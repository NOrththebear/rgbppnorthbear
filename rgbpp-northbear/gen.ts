import { ccc } from "@ckb-ccc/core";
import { buildNetworkConfig, PredefinedNetwork } from "@ckb-ccc/rgbpp";

const ckbPriv = ccc.bytesToHex(ccc.generateKey());
const btcPriv = ccc.bytesToHex(ccc.generateKey());
console.log("CKB_PRIVKEY=" + ckbPriv);
console.log("BTC_PRIVKEY=" + btcPriv);

const client = new ccc.ClientPublicTestnet();
const signer = new ccc.SignerCkbPrivateKey(client, ckbPriv);
console.log("CKB address:", await signer.getRecommendedAddress());
const net = buildNetworkConfig(PredefinedNetwork.BitcoinTestnet3);
const { PrivateKeyRgbppBtcWallet } = await import("@ckb-ccc/rgbpp");
const w = new PrivateKeyRgbppBtcWallet(btcPriv, net);
console.log("BTC address:", await w.getAddress());
