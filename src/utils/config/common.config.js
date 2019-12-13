require('dotenv').config()

const BN = require('bn.js')
const fs = require('fs')

const {
    netType,
    privateKey,
} = require('./base.config')

const {
    web3Provider
} = require('../server/provider')

// coinbase account
const web3 = web3Provider('mainnet')
const posterAccount = web3.eth.accounts.privateKeyToAccount('0x' + privateKey).address
const maxPendingAnchorSwing = 0.1 // 10%
const newPendingAnchorInterval = 240 // 240 blocks are equal to 1 hour
const mantissaOne = (new BN(10)).pow(new BN(18))
// query current gas price
const ethgasstationAPI = `https://ethgasstation.info/json/ethgasAPI.json`
// save last feeding time
const timeDir = `${netType}Time.log`

function init() {
    fs.access(timeDir, fs.constants.F_OK, (err) => {
        let exist = err ? false : true
        if (!exist) {
            let data = {}
            data[netType] = 0
            fs.writeFileSync(timeDir, JSON.stringify(data), 'utf8')
        }
    })
}

init()

module.exports = {
    ethgasstationAPI,
    mantissaOne,
    maxPendingAnchorSwing,
    newPendingAnchorInterval,
    posterAccount,
    timeDir,
}
