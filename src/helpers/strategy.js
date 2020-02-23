const {
  log,
} = require('../utils/logger/log');

const {
  maxFeedingPriceInterval,
  maxPriceSwing,
} = require('../utils/config/base.config');

const {
  newPendingAnchorInterval,
} = require('../utils/config/common.config');

function feedPrice(currentPrice, finalPrice, previousPrice, previousTime, anchorPricesPeriod, currentBlockNumber) {
  const priceChangingRatio = Math.abs(currentPrice - previousPrice) / previousPrice;
  log.info('ratio is ', priceChangingRatio);
  const currentTime = Math.round(new Date().getTime() / 1000);
  if (priceChangingRatio > maxPriceSwing) {
    // current price has been max based on anchor price.
    // eslint-disable-next-line eqeqeq
    if (finalPrice == previousPrice && currentPrice != finalPrice) {
      if (Math.floor(currentBlockNumber / newPendingAnchorInterval) + 1 < anchorPricesPeriod)
        return {
          'actualPrice': finalPrice,
          'feedPrice': currentPrice,
          'type': false,
        };
    }

    return {
      'actualPrice': finalPrice,
      'feedPrice': currentPrice,
      'type': true,
    };
  }

  if (currentTime - previousTime >= maxFeedingPriceInterval) {
    return {
      'actualPrice': finalPrice,
      'feedPrice': currentPrice,
      'type': true,
    };
  }

  // do not set a new price
  return {
    'actualPrice': finalPrice,
    'feedPrice': currentPrice,
    'type': false,
  };
}

function getIntervalTime(moment, flag = false) {
  const milliseconds = 60000;
  const interval = 10 * milliseconds;
  const currentTimestamp = Date.now();
  let timestamp = currentTimestamp + interval;
  let timeDifference = moment - (new Date(timestamp).getMinutes() % 10 === 0
    ? 10
    : new Date(timestamp).getMinutes() % 10);

  timeDifference = timeDifference < 0 - interval / (milliseconds * 2)
    ? timeDifference + interval / milliseconds
    : timeDifference;
  if (flag)
    timeDifference = timeDifference > 0 ? timeDifference - 10 : timeDifference;
  timestamp += timeDifference * milliseconds;
  return timestamp - new Date(timestamp).getSeconds() * 1000 - new Date(timestamp).getMilliseconds() - currentTimestamp;
}

module.exports = {
  feedPrice,
  getIntervalTime,
};
