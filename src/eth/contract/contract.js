const Tx = require('ethereumjs-tx').Transaction;

const {
  privateKey,
  safetyFactor,
} = require('../../utils/config/base.config');

const {
  getGasPrice,
} = require('../../helpers/getPrice');

const {
  log,
} = require('../../utils/logger/log');

class BaseContract {
  constructor(net, provider) {
    this.net = net;
    this.web3 = provider;
    this.log = log;
  }

  async getNonce(account) {
    return await this.web3.eth.getTransactionCount(account);
  }

  async getBlockNumber() {
    return await this.web3.eth.getBlockNumber();
  }

  async estimateGas(account, nonce, receiver, originData) {
    return new Promise((resolve) => {
      this.web3.eth.estimateGas({
        'data': originData,
        'from': account,
        'to': receiver,
      })
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          this.log.error('Fail due to ', err.message);
        });
    });
  }

  async txHelper(account, count, receiver, originData) {
    const accountNonce = this.web3.utils.toHex(count);
    const {
      average,
    } = await getGasPrice();
    // TODO: const 10**6
    const averagePrice = Math.floor(average / '10' * safetyFactor * 10 ** 6).toString();
    const price = this.web3.utils.toHex(this.web3.utils.toWei(averagePrice, 'kwei'));
    let calculateGas = await this.estimateGas(account, accountNonce, receiver, originData);
    calculateGas = (calculateGas * safetyFactor).toFixed();
    const rawTransaction = {
      data: originData,
      gasLimit: this.web3.utils.toHex(calculateGas.toString()), // Raise the gas limit to a much higher amount
      gasPrice: price,
      nonce: accountNonce,
      to: receiver,
      value: '0x00',
    };
    this.log.info('raw transaction is ', rawTransaction);

    return rawTransaction;
  }

  signTx(rawTX) {
    const tx = new Tx(rawTX, {
      'chain': this.net,
    });
    // eslint-disable-next-line no-undef
    const key = Buffer.from(privateKey, 'hex');

    tx.sign(key);

    const serializedTx = tx.serialize();
    const raw = '0x' + serializedTx.toString('hex');

    return raw;
  }

  async sendTransaction(transaction) {
    return new Promise((resolve, reject) => {
      this.web3.eth.sendSignedTransaction(transaction)
        .once('confirmation', (number, receipt) => {
          this.log.info('Transaction completed', receipt.transactionHash);
          const status = receipt.status;
          resolve({
            status,
          });
        })
        .on('error', (err) => {
          reject(err);
        })
        .catch(err => this.log.error(err.message));
    });
  }
}

module.exports = {
  BaseContract,
};
