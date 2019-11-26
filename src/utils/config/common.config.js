require('dotenv').config()

const {
    adminPrivateKey,
    privateKey
} = require('./base.config')

const {
    web3Provider
} = require('../server/provider')

// coinbase account
const web3 = web3Provider('mainnet')
// TODO: rename
const posterAccount = web3.eth.accounts.privateKeyToAccount('0x' + privateKey).address
const adminAccount = web3.eth.accounts.privateKeyToAccount('0x' + adminPrivateKey).address
const maxPendingAnchorSwing = 0.01
const newPendingAnchorInterval = 3600 // 60 * 60
// query current gas price
const ethgasstationAPI = `https://ethgasstation.info/json/ethgasAPI.json`

module.exports = {
    posterAccount,
    adminAccount,
    ethgasstationAPI,
    maxPendingAnchorSwing,
    newPendingAnchorInterval,
}
