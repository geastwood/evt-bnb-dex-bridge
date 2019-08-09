interface Network {
  host: string;
  port: number;
  protocol: "https" | "http";
}

export interface IConfiguration {
  api: string;
  ws: string;
  evtNetwork: Network;
  db: string;
  evtSwapAddresses: ReadonlyArray<string>;
  binanceSwapAddress: string;
  binanceChainSymbol: string;
  prefix: "bnb" | "tbnb";
  defaultProcessBlockNum: number;
}
