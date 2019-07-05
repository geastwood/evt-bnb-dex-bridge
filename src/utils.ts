import Binance from "./binance";
import config from "./config";
import BinanceChain from "@binance-chain/javascript-sdk";

const words =
  "dose boring turtle beef mind scheme estate board range beyond wife there blossom cat chronic cloth kid slide toilet elder delay weekend accuse pull";

export const printFirst10Addresses = async () => {
  const b = await Binance.createClient(config.api, async client => {
    await client.initChain();
    const privateKey = Binance.getPrivateKey(words);
    client.setPrivateKey(privateKey);
    // use default delegates (signing, broadcast)
    client.useDefaultSigningDelegate();
    client.useDefaultBroadcastDelegate();
  });

  for (let i = 0; i < 10; i++) {
    const privateKey = Binance.getPrivateKey(words, true, i);
    const publicKey = Binance.getPublicKey(privateKey);
    const address = Binance.getAddress(publicKey);
    console.log(address);
  }
};

// bb39528620cff4917fb63108b56b254f668a79ad187edeeacd50ad7f1aec4865 tbnb17y68vnk70wgz6xxxvjew53gfz6rzgh59uxq7ru
// 4766be1f3216252972fa32ac8bf76eef7f15219bfecb2eefbcd3d4977c0cd269 tbnb1lynud5yhgmr96tweawhwqy55nzvy8qt59apev0
// 2765843359de686e51693fe1ae1c5b822c471b82fe166f943cf6519dfbf0a63d tbnb1xlrwc7eqecnqkxweycww4um07r486vkrn8vwmq
export const createAccounts = (n: number) => {
  for (let i = 0; i < n; i++) {
    const words = BinanceChain.crypto.generateMnemonic();
    const privateKey = Binance.getPrivateKey(words);
    const publicKey = Binance.getPublicKey(privateKey);
    const address = Binance.getAddress(publicKey);
    console.log(privateKey, address);
  }
};

export const transfer = async (
  privateKey: string,
  from: string,
  to: string,
  amount: string
) => {
  const client = await Binance.createClientWithPrivateKey(
    config.api,
    privateKey
  );
  const trx = await client.transfer(from, to, amount, "BNB");
  console.log(trx);
};

// transfer(
//   "bb39528620cff4917fb63108b56b254f668a79ad187edeeacd50ad7f1aec4865",
//   "tbnb17y68vnk70wgz6xxxvjew53gfz6rzgh59uxq7ru",
//   "tbnb1ltytz6mm37fjpha4gu9zl4plu93fmhgns66ahd",
//   "199"
// );
