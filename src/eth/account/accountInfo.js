const {
    web3Provider
} = require('../../utils/server/provider')

class Account {
    constructor(net) {
        this.net = net
        this.web3 = web3Provider(net)
    }

    async getBalance(accountAddress) {
        return await this.web3.eth.getBalance(accountAddress)
    }
}

module.exports = {
    Account
}
