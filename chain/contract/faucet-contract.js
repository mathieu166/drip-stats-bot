import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import  fs from 'fs'
let rawdata = fs.readFileSync(__dirname + '/../abi/faucet.json');
let abi = JSON.parse(rawdata);

import addresses from '../smartcontracts-addresses.js'
const decimals = 10 ** 18

class FaucetContract {
  constructor(web3) {
    this.web3 = web3
    this.contract = new web3.eth.Contract(abi, addresses.FAUCET_ADDRESS)
  }

  async getDepositBalance(address) {
    const userInfoTotals = await this.contract.methods.userInfoTotals(address).call()
    return userInfoTotals.total_deposits / decimals
  }

  async getBuddyAddress(address) {
    const userInfo = await this.contract.methods.userInfo(address).call()
    return userInfo.upline
  }

}

export default FaucetContract
