require('dotenv').config();

const EthUtil = require('ethereumjs-util');
const BN = require('bn.js');

const {
  privateKey,
} = require('./base.config');

// coinbase account
const posterAccount = EthUtil.toChecksumAddress(EthUtil.bufferToHex(EthUtil.privateToAddress('0x' + privateKey)));
const maxPendingAnchorSwing = 0.1;    // 10%
const newPendingAnchorInterval = 240; // 240 blocks are equal to 1 hour
const mantissaOne = (new BN(10)).pow(new BN(18));
// query current gas price
const ethgasstationAPI = 'https://ethgasstation.info/json/ethgasAPI.json';

module.exports = {
  ethgasstationAPI,
  mantissaOne,
  maxPendingAnchorSwing,
  newPendingAnchorInterval,
  posterAccount,
};
