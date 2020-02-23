class Account {
  constructor(net, provider) {
    this.net = net;
    this.web3 = provider;
  }

  async getBalance(accountAddress) {
    return await this.web3.eth.getBalance(accountAddress);
  }
}

module.exports = {
  Account,
};
