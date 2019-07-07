export default {
  api: "https://dex.binance.org",
  ws: "wss://dex.binance.org/api/ws",
  evtNetwork: { host: "mainnet1.everitoken.io", port: 443, protocol: "https" },
  db: {
    host: "127.0.0.1",
    user: "", // this needs to be changed
    password: "", // this needs to be changed
    database: "bnbbridge"
  },
  evtSwapAddresses: [],
  binanceSwapAddress: "",
  binanceChainSymbol: "EVT-xxx", // this need to changed
  prefix: "bnb"
};
