# Bridge between everiToken and Binance Dex

## Get started

1. install dependencies with `yarn`

2. setup `mysql`

   Have mysql instance running either with docker or local on machine. Create a database called `bnbbridge` (which is specified in `src/config/development.ts` and `src/config/production.ts`). Make sure the `db` settings in config file are correct.

   run `yarn setup:db` to create tables

3. source in environment variables

   - `BINANCE_ACCOUNT_WORDS` => mnemonic words that controls swap account on Binance chain
   - `EVT_ACCOUNT_PRIVATE_KEY` => Private key that controls swap account on everiToken public chain

   In case of `development`

   - `BINANCE_ACCOUNT_WORDS="dose boring turtle beef mind scheme estate board range beyond wife there blossom cat chronic cloth kid slide toilet elder delay weekend accuse pull"`

     > In **development**, this mnemonic words controls the `binance swap account address` which is `tbnb1ltytz6mm37fjpha4gu9zl4plu93fmhgns66ahd`.

   - `EVT_ACCOUNT_PRIVATE_KEY="5J7UEyddLEsurNWun2Fz41pzR9mdQWzApBosvBsfjuzQN2jE9eo"`
     > In **development**, this private key controls `everiToken swap account address` which is `EVT7f6pEXvD8E2mbytzkirYqv9DBxEd7ebDv9TJpQ6kuKPemLtKUY`

4. start two listeners (evt and binance)

   - run `yarn listen:evt` starts the listening process on everiToken public chain
   - run `yarn listen:binance` starts the listening process on binance dex

5. ready to start swapping between **evt** and **binance dex**

   > In **development**, symbol on **binance dex** for EVT is called `MCB-704` (don't ask me why)

   1. Swap **EVT** to **MCB-704**. Send your **EVT** to address `EVT7f6pEXvD8E2mbytzkirYqv9DBxEd7ebDv9TJpQ6kuKPemLtKUY` (development), in **memo**, specify your **Binance dex address**. You will receive same amount of **MCB-704** token in the binance address specified.

   2. Swap **MCB-704** to **EVT**. Send your **MCB-704** to binance dex address `tbnb1ltytz6mm37fjpha4gu9zl4plu93fmhgns66ahd` (development), in **memo**, specify your EVT address. You will receive same amount of **EVT**.

## Resources

- [Binance developer doc](https://docs.binance.org/index.html)
- [Binance dex migration guild](https://community.binance.org/topic/196/listing-migration-process-on-binance-chain)
