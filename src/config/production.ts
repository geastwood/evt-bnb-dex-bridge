export default {
  api: "https://dex.binance.org",
  ws: "wss://dex.binance.org/api/ws",
  evtNetwork: { host: "mainnet1.everitoken.io", port: 443, protocol: "https" },
  db: {
    host: "127.0.0.1",
    user: "",
    password: "",
    database: "bnbbridge"
  },
  evtSwapAddresses: [],
  binanceSwapAddress: "",
  binanceChainSymbol: "EVT",
  prefix: "bnb",
  testnet: false
};
