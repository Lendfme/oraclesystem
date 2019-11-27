const BN = require('bn.js')

const log4js = require('./src/utils/logger/log')
log4js.initLogger("mainnet")
var log = log4js.getLogger()

const {
    mantissaOne
} = require('./src/utils/config/common.config')

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

const {
    getLendfMePrice,
    insertLendfMePrice,
} = require('./src/database/oraclePrice')

async function feed() {
    for (let i = 0, len = netTypes.length; i < len; i++) {
        var netType = netTypes[i]
        let currentNet = netType.toUpperCase()
        log4js.initLogger(netType)
        log = log4js.getLogger()
        let bot = new Slack(netType, log)
        try {
            let web3 = web3Provider(netType)

            log.info('\n')
            log.info('-----------------------------------')
            log.info(currentNet, ' start to feed price ...')
            // init
            let account = new Account(netType)
            let priceOracle = new Oracle(netType, log, oracleContract[netType])

            let currentBalance = await account.getBalance(priceOracle.poster)
            let currentBalanceFromWei = web3.utils.fromWei(currentBalance.toString(), 'ether')
            log.info(currentNet, ' current balance is: ', currentBalanceFromWei)
            if (currentBalanceFromWei < minBalance) {
                log.warn(currentNet, 'Attention to your balance! please deposit more!')
                bot.lackingBalanceWarning(priceOracle.poster, currentBalanceFromWei)
            }

            // get all assets pending anchor price
            let USDTAnchorPrice = await priceOracle.getPendingAnchor(assets[netType].usdt)
            log.info(currentNet, ' USDT pending anchor is: ', USDTAnchorPrice.toString())
            USDTAnchorPrice = new BN(USDTAnchorPrice)

            let imBTCAnchorPrice = await priceOracle.getPendingAnchor(assets[netType].imbtc)
            log.info(currentNet, ' imBTC pending anchor is: ', imBTCAnchorPrice.toString())
            imBTCAnchorPrice = new BN(imBTCAnchorPrice)

            // TODO: abstract to a function
            // get all assets current price
            let allBTCPrices = await getExchangePrice("BTC")
            let allUSDTPrices = await getExchangePrice("USDT")
            let currentBTCPrice = getMedianPrice(allBTCPrices)
            log.info(currentNet, ' BTC current result is: ', currentBTCPrice.result, ", price is: ", currentBTCPrice.median.toString())

            let currentUSDTPrice = getMedianPrice(allUSDTPrices)
            log.info(currentNet, ' USDT current result is: ', currentUSDTPrice.result, ", price is: ", currentUSDTPrice.median.toString())

            let getPrices = []
            let actualPrices = []
            if (currentBTCPrice.result) {
                let toWriteBTCPrice = mantissaOne.mul(new BN(10 ** 8)).div(currentBTCPrice.median).mul(new BN(10 ** 10))
                getPrices.push(["BTC", toWriteBTCPrice.toString(), assets[netType].imbtc])
                let btcFinalPrice = priceOracle.getFinalPrice("BTC", imBTCAnchorPrice, toWriteBTCPrice)
                actualPrices.push(["BTC", btcFinalPrice.toString(), assets[netType].imbtc])
            }

            if (currentUSDTPrice.result) {
                let toWriteUSDTPrice = mantissaOne.mul(new BN(10 ** 8)).div(currentUSDTPrice.median).mul(new BN(10 ** 12))
                getPrices.push(["USDT", toWriteUSDTPrice.toString(), assets[netType].usdt])
                let usdtFinalPrice = priceOracle.getFinalPrice("USDT", USDTAnchorPrice, toWriteUSDTPrice)
                actualPrices.push(["USDT", usdtFinalPrice.toString(), assets[netType].usdt])
            }

            log.info(' Get prices are: ', getPrices)
            log.info(' Actual prices are: ', actualPrices)
            let currentTime = Math.round(new Date().getTime() / 1000)
            log.info(' Current time is: ', currentTime)
            let finalWritingPrice = []
            let finalAssets = []
            let assetNames = []
            let previousPrice = 0
            let previousTime = 0
            let result = {}
            for (let i = 0, len = getPrices.length; i < len; i++) {
                let price = await getLendfMePrice(getPrices[i][2])
                previousPrice = await priceOracle.getPrice(getPrices[i][2])
                if (price.length !== 0) {
                    previousTime = previousPrice.timestamp
                    result = feedPrice(getPrices[i][1], actualPrices[i][1], previousPrice, previousTime)
                } else {
                    result["type"] = "normal" // only for the first time.
                }

                switch (result.type) {
                    case "normal":
                        assetNames.push(getPrices[i][0])
                        finalWritingPrice.push(getPrices[i][1])
                        finalAssets.push(getPrices[i][2])
                        break
                    // for admin
                    case "abnormal":
                        assetNames.push(actualPrices[i][0])
                        finalWritingPrice.push(actualPrices[i][1])
                        finalAssets.push(actualPrices[i][2])
                        await priceOracle.setPendingAnchor(actualPrices[i][2], actualPrices[i][1])
                        break
                }
            }

            if (finalWritingPrice.length != 0) {
                let data = []
                for (let i = 0, len = finalWritingPrice.length; i < len; i++) {
                    data.push([finalAssets[i], assetNames[i], finalWritingPrice[i], currentTime])
                }
                insertLendfMePrice(data)
                let setPriceResult = await priceOracle.setPrices(finalAssets, finalWritingPrice)
                if (setPriceResult.status) {
                    log.info(currentNet, " Set new price!", finalWritingPrice)
                    log.info(' Final prices are: ', actualPrices)
                } else {
                    log.error('You get an error when set new price!')
                    bot.getError(`${currentNet} Set new price failed!`)
                    throw new Error('Feed price failed!')
                }

                await verifyResult(bot, priceOracle, finalAssets, finalWritingPrice)
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
