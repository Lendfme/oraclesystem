const {
    maxFeedingPriceInterval,
    maxPriceSwing,
} = require('../utils/config/base.config')

function feedPrice(currenPrice, finalPrice, previousPrice, previousTime) {
    priceChangingRatio = Math.abs(currenPrice - previousPrice) / previousPrice
    console.log("ratio is ", priceChangingRatio)
    let currentTime = Math.round(new Date().getTime() / 1000)
    if (priceChangingRatio > maxPriceSwing) {
        // current price has been max based on anchor price.
        if (finalPrice === previousPrice) {
            return false
        }

        return {
            "type": true,
            "feedPrice": currenPrice,
            "actualPrice": finalPrice,
        }
    }

    if (currentTime - previousTime >= maxFeedingPriceInterval) {
        return {
            "type": true,
            "feedPrice": currenPrice,
            "actualPrice": finalPrice,
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
