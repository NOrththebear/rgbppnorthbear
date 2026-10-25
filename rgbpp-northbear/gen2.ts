import { ccc } from "@ckb-ccc/core";
import { buildNetworkConfig, PredefinedNetwork } from "@ckb-ccc/rgbpp";
const ckbPriv = process.env.CKB_PRIVKEY!;
const btcPriv = process.env.BTC_PRIVKEY!;
const client = new ccc.ClientPublicTestnet();
const signer = new ccc.SignerCkbPrivateKey(client, ckbPriv);
console.log("CKB address:", await signer.getRecommendedAddress());
const net = buildNetworkConfig(PredefinedNetwork.BitcoinTestnet3);
const { PrivateKeyRgbppBtcWallet } = await import("@ckb-ccc/rgbpp");
const w = new PrivateKeyRgbppBtcWallet(btcPriv, "P2WPKH" as any, net, {
  url: "https://api-testnet.rgbpp.com",
  isMainnet: false,
});
console.log("BTC address:", await w.getAddress());
