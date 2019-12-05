async function verify(priceOracle, assets, toVerifyPrices) {
    let result = []
    for (let i = 0, len = toVerifyPrices.length; i < len; i++) {
        let feedPrice = await priceOracle.getPrice(assets[i])
        priceOracle.log.info(assets[i], " current oracle price is: ", feedPrice.toString())
        priceOracle.log.info(" Previous price is: ", toVerifyPrices[i].toString())
        // TODO: delete hard code
        if (Math.abs(toVerifyPrices[i].toString() - feedPrice.toString()) < 0.00000000001) {
            result.push([assets[i], true])
        } else {
            result.push([assets[i], false])
        }
    }
    return result
}

module.exports = {
    verify,
}
