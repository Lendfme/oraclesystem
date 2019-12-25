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

function feedPrice(currentPrice, finalPrice, previousPrice, previousTime, anchorPricesPeriod, currentBlockNumber) {
    let priceChangingRatio = Math.abs(currentPrice - previousPrice) / previousPrice
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
            "feedPrice": currentPrice,
            "actualPrice": finalPrice,
        }
    }

    if (currentTime - previousTime >= maxFeedingPriceInterval) {
        return {
            "type": true,
            "feedPrice": currentPrice,
            "actualPrice": finalPrice,
        }
    }

    // do not set a new price
    return {
        "type": false,
    }
}

function getIntervalTime(moment, flag = false) {
	var milliseconds = 60000;
	var interval = 10 * milliseconds;
	var currentTimestamp = Date.now();
	var timestamp = currentTimestamp + interval;
	var timeDifference = moment - (new Date(timestamp).getMinutes() % 10 == 0 ? 10 : new Date(timestamp).getMinutes() % 10);

	timeDifference = timeDifference < 0 - interval / (milliseconds * 2) ? timeDifference + interval / milliseconds : timeDifference;
	if (flag)
		timeDifference = timeDifference > 0 ? timeDifference - 10 : timeDifference;
	timestamp += timeDifference * milliseconds;
	return timestamp - new Date(timestamp).getSeconds() * 1000 - new Date(timestamp).getMilliseconds() - currentTimestamp;
}

module.exports = {
    feedPrice,
    getIntervalTime,
}
