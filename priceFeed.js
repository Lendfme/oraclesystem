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
    supportAssets,
    supposedMantissa,
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
    post
} = require('./src/helpers/request')

const {
    feedPrice
} = require('./src/helpers/strategy')

const {
    verify
} = require('./src/helpers/verify')

const {
    getFeedPrice
} = require('./src/database/oraclePrice')

const {
    getLendfMePrice,
    insertLendfMePrice,
} = require('./src/database/oraclePrice')

let currentBalance = 0
let verifyResult = false
let currentTime = 0

async function feed() {
    for (let i = 0, len = netTypes.length; i < len; i++) {
        var netType = netTypes[i]
        let currentNet = netType.toUpperCase()
        log4js.initLogger(netType)
        log = log4js.getLogger(netType)
        try {
            let web3 = web3Provider(netType)

            log.info('\n')
            log.info('-----------------------------------')
            log.info(currentNet, ' start to feed price ...')
            // init
            let account = new Account(netType)
            let priceOracle = new Oracle(netType, log, oracleContract[netType])
            let getPrices = []
            let actualPrices = []

            currentBalance = await account.getBalance(priceOracle.poster)
            let currentBalanceFromWei = web3.utils.fromWei(currentBalance.toString(), 'ether')
            log.info(currentNet, ' current balance is: ', currentBalanceFromWei)
            if (currentBalanceFromWei < minBalance) {
                log.warn(currentNet, 'Attention to your balance! please deposit more!')
            }

            // get all assets current price and pending anchor price
            for (let i = 0, len = supportAssets.length; i < len; i++) {
                let anchorPrice = await priceOracle.getPendingAnchor(assets[netType][supportAssets[i]])
                log.info(`${currentNet} ${supportAssets[i]} pending anchor is: ${anchorPrice.toString()}`)
                anchorPrice = new BN(anchorPrice)

                let currentPrice = await getFeedPrice(supportAssets[i])
                log.info(`${currentNet} ${supportAssets[i]} current price is: ${currentPrice[0].price.toString()}`)
                currentPrice = new BN(currentPrice[0].price)

                let toWritePrice = mantissaOne.mul(new BN(10 ** 8)).div(currentPrice).mul(new BN(10 ** supposedMantissa[i]))
                getPrices.push([supportAssets[i], toWritePrice.toString(), assets[netType][supportAssets[i]]])
                let finalPrice = priceOracle.getFinalPrice(supportAssets[i], anchorPrice, toWritePrice)
                actualPrices.push([supportAssets[i], finalPrice.toString(), assets[netType][supportAssets[i]]])
            }

            log.info(' Get prices are: ', getPrices)
            log.info(' Actual prices are: ', actualPrices)

            let finalWritingPrices = []
            let finalAssets = []
            let assetNames = []
            let previousPrice = 0
            let previousTime = 0
            let toVerifyPrices = []
            let result = {}
            for (let i = 0, len = getPrices.length; i < len; i++) {
                let price = await getLendfMePrice(getPrices[i][2])
                previousPrice = await priceOracle.getPrice(getPrices[i][2])
                if (price.length !== 0) {
                    previousTime = price[0].timestamp
                    result = feedPrice(getPrices[i][1], actualPrices[i][1], previousPrice, previousTime)
                } else {
                    // only for the first time.
                    result["type"] = true
                    result["feedPrice"] = currenPrice
                    result["actualPrice"] = finalPrice
                }

                if (result.type) {
                    assetNames.push(getPrices[i][0])
                    finalWritingPrices.push(getPrices[i][1])
                    toVerifyPrices.push(result.actualPrice)
                    finalAssets.push(getPrices[i][2])
                }
            }

            if (finalWritingPrices.length != 0) {
                let data = []
                currentTime = Math.round(new Date().getTime() / 1000)
                log.info(' Current time is: ', currentTime)
                for (let i = 0, len = finalWritingPrices.length; i < len; i++) {
                    data.push([finalAssets[i], assetNames[i], finalWritingPrices[i], currentTime])
                }
                insertLendfMePrice(data)
                let setPriceResult = await priceOracle.setPrices(finalAssets, finalWritingPrices)
                if (setPriceResult.status) {
                    log.info(currentNet, " Set new price!", finalWritingPrices)
                    log.info(' Final prices are: ', actualPrices)
                } else {
                    log.error('You get an error when set new price!')
                    throw new Error('Feed price failed!')
                }

                verifyResult = await verify(priceOracle, finalAssets, toVerifyPrices)

            }
        } catch (err) {
            log.error('You get an error in try-catch', err)
            log.trace('Error: ', err)
        }
    }
    // Quit the program
    process.exit(0)
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
