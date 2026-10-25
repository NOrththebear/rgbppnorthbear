import { ccc } from "@ckb-ccc/core";
import {
  buildNetworkConfig,
  PredefinedNetwork,
  RgbppUdtClient,
  CkbRgbppUnlockSigner,
  createScriptProvider,
} from "@ckb-ccc/rgbpp";

const networkConfig = buildNetworkConfig(PredefinedNetwork.BitcoinTestnet3);
const ckbClient = new ccc.ClientPublicTestnet();
const ckbSigner = new ccc.SignerCkbPrivateKey(ckbClient, process.env.CKB_PRIVKEY!);
const scriptProvider = createScriptProvider(ckbClient);
const rgbppUdtClient = new RgbppUdtClient(networkConfig, ckbClient, scriptProvider);
const { PrivateKeyRgbppBtcWallet } = await import("@ckb-ccc/rgbpp");
const rgbppBtcWallet = new PrivateKeyRgbppBtcWallet(
  process.env.BTC_PRIVKEY!,
  "P2WPKH" as any,
  networkConfig,
  { url: "https://api-testnet.rgbpp.com", isMainnet: false },
);
const ckbRgbppUnlockSigner = new CkbRgbppUnlockSigner({
  ckbClient,
  rgbppBtcAddress: await rgbppBtcWallet.getAddress(),
  btcDataSource: rgbppBtcWallet,
  scriptInfos: await rgbppUdtClient.scriptManager.getRgbppScriptInfos(),
});

const utxoSeal = await rgbppBtcWallet.prepareUtxoSeal();
const tx = ccc.Transaction.default();
const rgbppLockScript = await rgbppUdtClient.buildRgbppLockScript(utxoSeal);
tx.addOutput({ lock: rgbppLockScript });
await tx.completeInputsByCapacity(ckbSigner);
await tx.completeFeeBy(ckbSigner);
const ckbTxHash = await ckbSigner.sendTransaction(tx);
await ckbClient.waitTransaction(ckbTxHash);

const rgbppIssuanceCells = await ckbClient.findCellsByLock(rgbppLockScript);
const ckbPartialTx = await rgbppUdtClient.issuanceCkbPartialTx({
  token: { name: "NORTHBEAR", symbol: "NBEAR", decimal: 8 },
  amount: 21_000_000n,
  rgbppLiveCells: rgbppIssuanceCells,
  udtScriptInfo: await ckbClient.getKnownScript(ccc.KnownScript.XUdt),
});

const btcAddress = await rgbppBtcWallet.getAddress();
const { psbt, indexedCkbPartialTx } = await rgbppBtcWallet.buildPsbt({
  ckbPartialTx,
  ckbClient,
  rgbppUdtClient,
  btcChangeAddress: btcAddress,
  receiverBtcAddresses: [btcAddress],
});
const btcTxId = await rgbppBtcWallet.signAndBroadcast(psbt);

const ckbTxWithBtcId = await rgbppUdtClient.injectTxIdToRgbppCkbTx(indexedCkbPartialTx, btcTxId);
const rgbppSignedTx = await ckbRgbppUnlockSigner.signTransaction(ckbTxWithBtcId);
await rgbppSignedTx.completeFeeBy(ckbSigner);
const finalTx = await ckbSigner.signTransaction(rgbppSignedTx);
const finalHash = await ckbSigner.client.sendTransaction(finalTx);
console.log("NORTHBEAR issued. CKB tx:", finalHash);
