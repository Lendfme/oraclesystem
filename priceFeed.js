const BN = require('bn.js')
const fs = require('fs')

const {
    mantissaOne,
    posterAccount,
    timeDir,
} = require('./src/utils/config/common.config')

const {
    assets,
    netType,
    minBalance,
    monitorPostPriceUrl,
    oracleContract,
    serviceName,
    supportAssets,
    supposedMantissa,
    getUrl
} = require('./src/utils/config/base.config')

const {
    ERROR_CODE,
    ERROR_MSG,
} = require('./src/utils/config/error.config')

const {
    log
} = require('./src/utils/logger/log')

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
    post,
    request,
} = require('./src/helpers/request')

const {
    feedPrice
} = require('./src/helpers/strategy')

const {
    verify
} = require('./src/helpers/verify')

let currentBalance = 0
let verifyResult = {
    'status': ERROR_CODE.NO_ERROR,
    'msg': ERROR_MSG.NO_WRITING,
}
let currentTime = 0
let currentBalanceFromWei = 0

async function feed() {
    let currentNet = netType.toUpperCase()
    try {
        let web3 = web3Provider(netType)
        log.info('\n')
        log.info('-----------------------------------')
        log.info(currentNet, ' start to feed price ...')
        // init
        let account = new Account(netType)
        let priceOracle = new Oracle(netType, oracleContract[netType])
        let getPrices = []
        let actualPrices = []
        let anchorPrices = []
        let poster = await priceOracle.getPoster()
        if (poster != posterAccount) {
            currentTime = Math.round(new Date().getTime() / 1000)
            let data = {
                'timestamp': currentTime,
                'net': netType,
                'err_code': ERROR_CODE.AUTHORITY_LIMITED,
                'err_msg': ERROR_MSG.AUTHORITY_LIMITED,
                'server': serviceName,
                'app': 'feed_price',
                'version': '',
                'data': {
                    'current_poster_address': posterAccount,
                    'contract_poster_address': poster,
                },
            }
            post(monitorPostPriceUrl, data)
            log.error(currentNet, ' current poster is: ', posterAccount, 'contract poster is: ', poster)
            return
        }

        currentBalance = await account.getBalance(priceOracle.poster)
        currentBalanceFromWei = web3.utils.fromWei(currentBalance.toString(), 'ether')
        log.info(currentNet, ' current balance is: ', currentBalanceFromWei)
        if (currentBalanceFromWei < minBalance) {
            log.warn(currentNet, 'Attention to your balance! please deposit more!')
            currentTime = Math.round(new Date().getTime() / 1000)
            let data = {
                'timestamp': currentTime,
                'net': netType,
                'err_code': ERROR_CODE.INSUFFICIENT_BALANCE,
                'err_msg': 'Pay attention to your ETH balance',
                'server': serviceName,
                'app': 'feed_price',
                'version': '',
                'data': {
                    'eth_balance': currentBalanceFromWei,
                },
            }
            post(monitorPostPriceUrl, data)
        }

        // get all assets current price and pending anchor price
        for (let i = 0, len = supportAssets.length; i < len; i++) {
            let anchorPrice = await priceOracle.getPendingAnchor(assets[netType][supportAssets[i]])
            anchorPrices.push(anchorPrice)
            log.info(`${currentNet} ${supportAssets[i]} pending anchor is: ${anchorPrice.priceMantissa.toString()}`)
            anchorPrice = new BN(anchorPrice.priceMantissa)

            let requestUrl = getUrl('feedPrice', supportAssets[i])
            let currentPrice = await request(requestUrl)

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
        let toVerifyPrices = []
        let result = {}
        for (let i = 0, len = getPrices.length; i < len; i++) {
            let timeData = JSON.parse(fs.readFileSync(timeDir))
            let previousTime = timeData[netType]
            log.info(currentNet, ' last feeding time is: ', previousTime)
            previousPrice = await priceOracle.getPrice(getPrices[i][2])
            let currentBlockNumber = await priceOracle.getBlockNumber()
            if (previousTime !== 0) {
                result = feedPrice(getPrices[i][1], actualPrices[i][1], previousPrice, previousTime, anchorPrices[i].period, currentBlockNumber)
            } else {
                // only for the first time.
                result["type"] = true
                result["feedPrice"] = getPrices[i][1]
                result["actualPrice"] = actualPrices[i][1]
            }

            if (result.type) {
                assetNames.push(getPrices[i][0])
                finalWritingPrices.push(getPrices[i][1])
                toVerifyPrices.push(result.actualPrice)
                finalAssets.push(getPrices[i][2])
            }
        }

        currentTime = Math.round(new Date().getTime() / 1000)
        if (finalWritingPrices.length != 0) {
            log.info(currentNet, ' Current time is: ', currentTime)
            let setPriceResult = await priceOracle.setPrices(finalAssets, finalWritingPrices)
            if (setPriceResult.status) {
                log.info(currentNet, " Set new price!", finalWritingPrices)
                log.info(' Final prices are: ', actualPrices)
                let timeData = {}
                timeData[netType] = currentTime
                fs.writeFileSync(timeDir, JSON.stringify(timeData), 'utf8')
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
    // TODO: Debug
    let data = {
        'timestamp': currentTime,
        'net': netType,
        'eth_balance': currentBalanceFromWei,
        'err_code': verifyResult.status,
        'err_msg': verifyResult.msg,
        'server': serviceName,
        'app': 'feed_price',
        'version': '',
        'data': {},
    }
    post(monitorPostPriceUrl, data)

    // Quit the program
    setTimeout(() => {
        process.exit(0)
    }, 5000)
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
