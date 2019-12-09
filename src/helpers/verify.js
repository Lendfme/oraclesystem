const {
    OPS_ERROR
} = require('../utils/config/error.config')

async function verify(priceOracle, assets, toVerifyPrices) {
    let result = {
        'status': OPS_ERROR.NO_ERROR,
        'msg': [],
    }
    for (let i = 0, len = toVerifyPrices.length; i < len; i++) {
        let feedPrice = await priceOracle.getPrice(assets[i])
        priceOracle.log.info(assets[i], " current oracle price is: ", feedPrice.toString())
        priceOracle.log.info(" Previous price is: ", toVerifyPrices[i].toString())
        if (toVerifyPrices[i].toString() === feedPrice.toString()) {
            result.msg.push([assets[i], toVerifyPrices[i].toString(), feedPrice.toString(), true])
        } else {
            result.status = OPS_ERROR.FEED_ERROR
            result.msg.push([assets[i], toVerifyPrices[i].toString(), feedPrice.toString(), false])
        }
    }
    return result
}

module.exports = {
    verify,
}
