export default {
  api: "https://testnet-dex.binance.org/",
  ws: "wss://testnet-dex.binance.org/api/ws",
  evtNetwork: { host: "testnet1.everitoken.io", port: 443, protocol: "https" },
  db: {
    host: "127.0.0.1",
    user: "root",
    password: "fei",
    database: "bnbbridge"
  },
  evtSwapAddresses: ["EVT7f6pEXvD8E2mbytzkirYqv9DBxEd7ebDv9TJpQ6kuKPemLtKUY"],
  binanceSwapAddress: "tbnb1ltytz6mm37fjpha4gu9zl4plu93fmhgns66ahd",
  binanceChainSymbol: "MCB-704",
  prefix: "tbnb"
};
