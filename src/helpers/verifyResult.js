async function _verify(priceOracle, assetAddress, newPrice) {
    let feedPrice = await priceOracle.getPrice(assetAddress)
    priceOracle.log.info(assetAddress, " current oracle price is: ", feedPrice.toString())
    priceOracle.log.info(" Previous price is: ", newPrice.toString())
    // TODO: delete hard code
    if (newPrice.toString() - feedPrice.toString() < 0.00000000001) {
        return true
    } else {
        return false
    }
}

async function verifyResult(priceOracle, assets, prices, balance) {
    for (let i = 0, len = prices.length; i < len; i++) {
        let verifiedResult = await _verify(priceOracle, assets[i], prices[i])
        if (verifiedResult) {
            priceOracle.log.info('Verified pass!')
            let convertPrice = 10 ** 18 / prices[i]
            // if (i < len - 1) {
            //     feeding(currentNet, convertPrice.toString(), log)
            // } else if (i == len - 1) {
            // }
        } else {
            priceOracle.log.error('You get an error when verify new price.')
        }
    }
}

module.exports = {
    verifyResult,
}
