const BN = require('bn.js')

const log4js = require('./src/utils/logger/log')
log4js.initLogger("mainnet")
var log = log4js.getLogger()

const {
    assets,
    netTypes,
    minBalance,
    oracleContract,
} = require('./src/utils/config/base.config')

const {
    web3Provider
} = require('./src/utils/server/provider')

const {
    Account
} = require('./src/eth/account/accountInfo')

const {
    Oracle
} = require('./src/eth/contract/oracle')

const {
    feedPrice
} = require('./src/helpers/strategy')

const {
    getMedianPrice,
} = require('./src/helpers/getPrice')

const {
    verifyResult
} = require('./src/helpers/verifyResult')

const {
    Slack
} = require('./src/slack/bot')

const {
    getExchangePrice
} = require('./src/database/oraclePrice')


async function feed() {
    for (let i = 0, len = netTypes.length; i < len; i++) {
        var netType = netTypes[i]
        let currentNet = netType.toUpperCase()
        try {
            let web3 = web3Provider(netType)

            log4js.initLogger(netType);
            log = log4js.getLogger();
            log.info('\n')
            log.info('-----------------------------------')
            log.info(currentNet, ' start to feed price ...')
            // initial
            let bot = new Slack(netType, log)
            let account = new Account(netType)
            let priceOracle = new Oracle(netType, log, oracleContract[netType])

            let currentBalance = await account.getBalance(priceOracle.poster)
            log.info("current Balance is", currentBalance)
            let currentBalanceFromWei = web3.utils.fromWei(currentBalance.toString(), 'ether')
            log.info(currentNet, ' current balance is: ', currentBalanceFromWei)
            if (currentBalanceFromWei < minBalance) {
                log.warn(currentNet, 'Attention to your balance! please deposit more!')
                bot.lackingBalanceWarning(priceOracle.poster, currentBalanceFromWei)
            }

            // get all assets pending anchor price
            let USDTAnchorPrice = await priceOracle.getPendingAnchor(assets[netType].usdt)
            log.info(currentNet, ' USDT pending anchor is: ', USDTAnchorPrice.toString())

            let imBTCAnchorPrice = await priceOracle.getPendingAnchor(assets[netType].imbtc)
            log.info(currentNet, ' imBTC pending anchor is: ', imBTCAnchorPrice.toString())

            // get all assets current price
            let allBTCPrices = getExchangePrice("btc")
            let allUSDTPrices = getExchangePrice("usdt")
            let currentBTCPrice = getMedianPrice(allBTCPrices)
            log.info(currentNet, ' BTC current price is: ', currentBTCPrice.toString())
            currentBTCPrice = new BN(currentBTCPrice.toString() * 10 ** 8)

            let currentUSDTPrice = await getMedianPrice(allUSDTPrices)
            log.info(currentNet, ' USDT current price is: ', currentUSDTPrice.toString())
            currentUSDTPrice = new BN(currentUSDTPrice.toString() * 10 ** 8)

            let getPrices = []
            let actualPrices = []
            let BTCChangingRatio = 0
            let USDTChangingRatio = 0
            if (currentBTCPrice.result) {
                let toWriteBTCPrice = mantissaOne.mul(new BN(10 ** 8)).div(currentBTCPrice.median).mul(new BN(10 ** 10))
                getPrices.push([toWriteBTCPrice.toString(), assets[netType].imbtc])
                // calculate changing ratio
                BTCChangingRatio = (toWriteBTCPrice.toString() - imBTCAnchorPrice.toString()) / imBTCAnchorPrice.toString()
                let btcFinalPrice = priceOracle.getFinalPrice("BTC", toWriteBTCPrice, imBTCAnchorPrice)
                actualPrices.push(btcFinalPrice)
            }

            if (currentUSDTPrice.result) {
                let toWriteUSDTPrice = mantissaOne.mul(new BN(10 ** 8)).div(currentUSDTPrice.median).mul(new BN(10 ** 12))
                getPrices.push([toWriteUSDTPrice.toString(), assets[netType].usdt])
                USDTChangingRatio = (toWriteUSDTPrice.toString() - USDTAnchorPrice.toString()) / USDTAnchorPrice.toString()
                let usdtFinalPrice = priceOracle.getFinalPrice("USDT", toWriteUSDTPrice, USDTAnchorPrice)
                actualPrices.push(usdtFinalPrice)
            }

            log.info(" BTC changes ratio is", BTCChangingRatio)
            log.info(" USDT changes ratio is", USDTChangingRatio)
            log.info(' Get prices are: ', getPrices)
            log.info(' Actual prices are: ', actualPrices)
            let currentTime = Math.round(new Date().getTime() / 1000)
            log.info(' Current time is: ', currentTime)
            let finalWritingPrice = []
            let finalAssets = []
            for (let i = 0, len = getPrices.length; i < len; i++) {
                let result = feedPrice(getPrices[i][0], actualPrices[i])
                switch (result.type) {
                    case "normal":
                        finalWritingPrice.push(getPrices[i][0])
                        finalAssets.push(getPrices[i][1])
                    // for admin
                    case "abnormal":
                        finalWritingPrice.push(actualPrices[i])
                        finalAssets.push(getPrices[i][1])
                        await priceOracle.setPendingAnchor(getPrices[i][1], actualPrices[i])
                }
            }

            if (finalWritingPrice.length != 0) {
                let setPriceResult = await priceOracle.setPrices(finalAssets, finalWritingPrice)
                if (setPriceResult.status) {
                    log.info(currentNet, " Set new price!", finalWritingPrice)
                    log.info(' Final prices are: ', actualPrices)
                } else {
                    log.error('You get an error when set new price!')
                    bot.getError(`${currentNet} Set new price failed!`)
                    throw new Error('Feed price failed!')
                }

                await verifyResult(bot, feedContract, finalAssets, finalWritingPrice)
            }
        } catch (err) {
            log.error('You get an error in try-catch', err)
            bot.getError(`${currentNet} You catch an error: ${err}`)
            log.trace('Error: ', err)
        }
    }
}

async function main() {
    log.info('\n\n\n')
    log.info('Init files')
    log.info("start to run!")
    log.info("-------------------------------------------")
    log.info("-------------------------------------------")
    log.info('\n\n\n')
    await feed()
}

main()
