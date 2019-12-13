const {
    log
} = require('../utils/logger/log')

const {
    maxFeedingPriceInterval,
    maxPriceSwing,
} = require('../utils/config/base.config')

const {
    newPendingAnchorInterval
} = require('../utils/config/common.config')

function feedPrice(currenPrice, finalPrice, previousPrice, previousTime, anchorPricesPeriod, currentBlockNumber) {
    let priceChangingRatio = Math.abs(currenPrice - previousPrice) / previousPrice
    log.info("ratio is ", priceChangingRatio)
    let currentTime = Math.round(new Date().getTime() / 1000)
    if (priceChangingRatio > maxPriceSwing) {
        // current price has been max based on anchor price.
        if (finalPrice === previousPrice && currentPrice != finalPrice) {
            if (Math.floor(currentBlockNumber / newPendingAnchorInterval) + 1 < anchorPricesPeriod)
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

function getIntervalTime(moment, minutes = 10) {
	var milliseconds = 60000;
	var interval = minutes * milliseconds;
	var currentTimestamp = Date.now();
	var timestamp = currentTimestamp + interval;
	var timeDifference = moment - new Date(timestamp).getMinutes() % 10;

	timeDifference = timeDifference < 0 - interval / (milliseconds * 2) ? timeDifference + interval / milliseconds : timeDifference;
	timestamp += timeDifference * milliseconds;
	return timestamp - currentTimestamp;
}

module.exports = {
    feedPrice,
    getIntervalTime,
}
