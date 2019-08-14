import config from "./config/index";
import BinanceChain from "@binance-chain/javascript-sdk";
import { writeFileSync } from "fs";
import { join } from "path";
import fetch from "isomorphic-fetch";

class Binance {
  readonly client: any;
  constructor(url: string) {
    this.client = new BinanceChain(url);
  }

  static getTrx = async (hash: string) => {
    const d = await fetch(`${config.api}api/v1/tx/${hash}?format=json`);
    return d.json();
  };

  static createClient = async (url: string, fn: (client: any) => void) => {
    const client = new Binance(url);
    await fn(client.client);
    return client;
  };

  static createClientWithPrivateKey = async (url: string, privateKey: string) => {
    return Binance.createClient(url, async c => {
      await c.initChain();
      c.setPrivateKey(privateKey);
      c.chooseNetwork(config.prefix === "tbnb" ? "testnet" : "mainnet");
      // use default delegates (signing, broadcast)
      c.useDefaultSigningDelegate();
      c.useDefaultBroadcastDelegate();
    });
  };

  static createAccount = (): string => {
    return BinanceChain.crypto.generateMnemonic();
  };

  static getPrivateKey = (mnemonic: string, derive: boolean = true, index: number = 0) => {
    return BinanceChain.crypto.getPrivateKeyFromMnemonic(mnemonic, derive, index);
  };

  static getPublicKey = (privateKey: string): string => {
    return BinanceChain.crypto.getPublicKeyFromPrivateKey(privateKey);
  };

  static getAddress = (publicKey: string): string => {
    return BinanceChain.crypto.getAddressFromPublicKey(publicKey, config.prefix);
  };

  /**
   * Keystore is used to login
   */
  static generateKeyStore = (privateKey: string, password: string, folder: string) => {
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
    sequence = null,
  ) => {
    return await this.client.transfer(fromAddress, toAddress, amount, asset, memo, sequence);
  };
}

export default Binance;
