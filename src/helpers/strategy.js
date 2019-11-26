const {
    maxFeedingPriceInterval,
    maxPriceSwing,
} = require('../utils/config/base.config')

function feedPrice(currenPrice, finalPrice) {
    // TODO: get previous price from database.
    priceChangingRatio = (currenPrice - previousPrice) / previousPrice
    let currentTime = Math.round(new Date().getTime() / 1000)
    let lastTime = time
    if (priceChangingRatio > maxPriceSwing) {
        // not exceed 10%
        if (currenPrice === finalPrice) {
            return {
                "type": "normal",
            }
        } else {
            return {
                "type": "abnormal",
            }
        }
    }

    if (currentTime - lastTime >= maxFeedingPriceInterval) {
        return {
            "type": "normal",
        }
    }

    // do not set a new price
    return {
        "type": false,
    }
}

module.exports = {
    feedPrice,
}
