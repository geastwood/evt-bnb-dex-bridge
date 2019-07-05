import config from "./config/index";
import BinanceChain from "@binance-chain/javascript-sdk";
import { writeFileSync } from "fs";
import { join } from "path";

class Binance {
  readonly client: any;
  constructor(url: string) {
    this.client = new BinanceChain(url);
  }

  static createClient = async (url: string, fn: (client: any) => void) => {
    const client = new Binance(url);
    await fn(client.client);
    return client;
  };

  static createClientWithPrivateKey = async (
    url: string,
    privateKey: string
  ) => {
    return Binance.createClient(url, async c => {
      await c.initChain();
      c.setPrivateKey(privateKey);
      // use default delegates (signing, broadcast)
      c.useDefaultSigningDelegate();
      c.useDefaultBroadcastDelegate();
    });
  };

  static createAccount = (): string => {
    return BinanceChain.crypto.generateMnemonic();
  };

  static getPrivateKey = (
    mnemonic: string,
    derive: boolean = true,
    index: number = 0
  ) => {
    return BinanceChain.crypto.getPrivateKeyFromMnemonic(
      mnemonic,
      derive,
      index
    );
  };

  static getPublicKey = (privateKey: string): string => {
    return BinanceChain.crypto.getPublicKeyFromPrivateKey(privateKey);
  };

  static getAddress = (publicKey: string): string => {
    return BinanceChain.crypto.getAddressFromPublicKey(
      publicKey,
      config.prefix
    );
  };

  /**
   * Keystore is used to login
   */
  static generateKeyStore = (
    privateKey: string,
    password: string,
    folder: string
  ) => {
    const keyStore = BinanceChain.crypto.generateKeyStore(privateKey, password);
    writeFileSync(join(folder, "test.keystore"), JSON.stringify(keyStore));
  };

  getBalance = async (address: string, symbol: string = "BNB") => {
    return await this.client.getBalance(address, symbol);
  };

  transfer = async (
    fromAddress: string,
    toAddress: string,
    amount: string,
    asset: string,
    memo = "",
    sequence = null
  ) => {
    return await this.client.transfer(
      fromAddress,
      toAddress,
      amount,
      asset,
      memo,
      sequence
    );
  };

  issueToken = async () => {};
}

export default Binance;

const words =
  "dose boring turtle beef mind scheme estate board range beyond wife there blossom cat chronic cloth kid slide toilet elder delay weekend accuse pull";

const run = async () => {
  const privateKey = Binance.getPrivateKey(words);
  const { client } = await Binance.createClientWithPrivateKey(
    config.api,
    privateKey
  );
  const trx = await client.tokens.issue(
    "tbnb1ltytz6mm37fjpha4gu9zl4plu93fmhgns66ahd",
    "Material Coin",
    "MCB",
    10000000000,
    false
  );
  console.log(trx);
};

run();
