import addresses from '../smartcontracts-addresses.js'
import  fs from 'fs'

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let rawdata = fs.readFileSync(__dirname + '/../abi/drip-token.json');
let abi = JSON.parse(rawdata);

class DripContract {
  constructor(web3) {
    this.contract = new web3.eth.Contract(abi, addresses.DRIP_TOKEN_ADDRESS)
    this.web3 = web3
  }

  getContract(){
    return this.contract
  }

  getAccountsInBlockRange = async (startBlock, toBlock) => {
    const transferEvents = await this.contract.getPastEvents('Transfer', {
      fromBlock: startBlock,
      toBlock: toBlock
    })
    
    var accounts = new Map()
    for (var i = 0; i < transferEvents.length; i++) {
      var transferEvent = transferEvents[i]
      if (!accounts.get(transferEvent.returnValues.to)) {
        const block = await this.web3.eth.getBlock(transferEvent.blockNumber)
        accounts.set(transferEvent.returnValues.to, block)
      }
    }
    return accounts
  }

  getDripBalanceOf(address) {
    return this.contract.methods.balanceOf(address).call()
  }

  getAllowance(address) {
    return this.contract.methods
      .allowance(address, addresses.FOUNTAIN_ADDRESS)
      .call()
  }

  setAllowance(address) {
    return this.contract.methods
      .approve(addresses.FOUNTAIN_ADDRESS, 999999)
      .send({ from: address })
  }
}

export default DripContract
