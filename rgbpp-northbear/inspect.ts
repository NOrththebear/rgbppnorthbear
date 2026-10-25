import { buildNetworkConfig, PredefinedNetwork } from "@ckb-ccc/rgbpp";
console.log(JSON.stringify(buildNetworkConfig(PredefinedNetwork.BitcoinTestnet3), null, 2));
