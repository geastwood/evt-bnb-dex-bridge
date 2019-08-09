import { IConfiguration } from "../types";

export default function(): IConfiguration {
  if (!process.env.PG_BRIDGE_USERNAME || !process.env.PG_BRIDGE_PASSWORD) {
    throw new Error("PG_BRIDGE_USERNAME and PG_BRIDGE_PASSWORD are required to be set");
  }

  const pgUserName = process.env.PG_BRIDGE_USERNAME;
  const pgPassword = process.env.PG_BRIDGE_PASSWORD;

  return {
    api: "https://dex.binance.org/",
    ws: "wss://dex.binance.org/api/ws",
    evtNetwork: { host: "mainnet7.everitoken.io", port: 443, protocol: "https" },
    db: `postgres://${pgUserName}:${pgPassword}@localhost:5432/bnbbridge`,
    evtSwapAddresses: ["EVT5NYzcUjJEpGunhJJZmw8r2qph2uDhGBkhCWSJTp3Nv3VQ7aLT3"],
    binanceSwapAddress: "bnb1v3fl4kuwuhzf3g7ghscsq7uzmu5dw50waseptd",
    binanceChainSymbol: "EVT-49B",
    prefix: "bnb",
    defaultProcessBlockNum: 0,
  };
}
