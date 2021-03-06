import { IConfiguration } from "../types";

export default function(): IConfiguration {
  return {
    api: "https://testnet-dex.binance.org/",
    ws: "wss://testnet-dex.binance.org/api/ws",
    evtNetwork: { host: "testnet1.everitoken.io", port: 443, protocol: "https" },
    db: "postgres://test:test@localhost:5432/bnbbridge",
    evtSwapAddresses: ["EVT7f6pEXvD8E2mbytzkirYqv9DBxEd7ebDv9TJpQ6kuKPemLtKUY"],
    binanceSwapAddress: "tbnb1ltytz6mm37fjpha4gu9zl4plu93fmhgns66ahd",
    binanceChainSymbol: "MCB-704",
    prefix: "tbnb",
    defaultProcessBlockNum: 0,
  };
}
