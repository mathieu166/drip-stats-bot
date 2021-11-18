import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let rawdata = fs.readFileSync(__dirname + '/../abi/fountain.json');
let abi = JSON.parse(rawdata);

import addresses from '../smartcontracts-addresses.js'

class FontainContract {
  constructor(web3) {
    this.web3
    this.contract = new web3.eth.Contract(abi, addresses.FOUNTAIN_ADDRESS)
  }

  getContract(){
    return this.contract
  }

  async getBnbToTokenOutputPrice(tokenBought) {
    return await this.contract.methods
      .getBnbToTokenOutputPrice(tokenBought)
      .call()
  }

  async getTokenToBnbOutputPrice(bnbBought, hoursAgo) {
    if (hoursAgo) {
      const currentBlock = await this.web.getBlockNumber()
      const block = currentBlock - (hoursAgo || 0) * 1161
      return await this.contract.methods
        .getTokenToBnbOutputPrice(bnbBought)
        .call({}, block)
    }

    return await this.contract.methods
      .getTokenToBnbOutputPrice(bnbBought)
      .call()
  }

  /**
   * @param bnb_sold Amount of BNB sold.
   * @return Amount of Tokens that can be bought with input BNB.
   */
  async getBnbToTokenInputPrice(bnbSold) {
    return await this.contract.methods
      .getBnbToTokenInputPrice(bnbSold)
      .call()
  }

  /**
   * @param tokens_sold Amount of Tokens sold.
   * @return Amount of BNB that can be bought with input Tokens.
   */
  async getTokenToBnbInputPrice(tokenSold) {
    return await this.contract.methods
      .getTokenToBnbInputPrice(tokenSold)
      .call()
  }

  async getBalanceOf(address) {
    const values = await this.contract.methods.statsOf(address).call()
    return values[0]
  }

  async tokenToBnbSwapInput(tokenSold, minBnb, address) {
    await this.contract.methods
      .tokenToBnbSwapInput(tokenSold, minBnb)
      .send({ from: address })
  }

  async bnbToTokenSwapInput(bnbSold, minToken, address) {
    await this.contract.methods
      .bnbToTokenSwapInput(minToken)
      .send({ from: address, value: bnbSold })
  }
}

export default FontainContract
