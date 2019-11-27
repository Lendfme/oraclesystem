const {
    maxFeedingPriceInterval,
    maxPriceSwing,
} = require('../utils/config/base.config')

function feedPrice(currenPrice, finalPrice, previousPrice, previousTime) {
    priceChangingRatio = Math.abs(currenPrice - previousPrice) / previousPrice
    console.log("ratio is ", priceChangingRatio)
    let currentTime = Math.round(new Date().getTime() / 1000)
    if (priceChangingRatio > maxPriceSwing) {
        // do not exceed 10%
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

    if (currentTime - previousTime >= maxFeedingPriceInterval) {
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
