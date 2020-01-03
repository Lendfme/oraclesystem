const http = require('http');
const url = require('url');

const oraclePrice = require('./src/database/oraclePrice');
const apiPriceConfig = require('./src/utils/config/apiPriceConfig');
const {
	asyncGet,
	request,
	post,
} = require('./src/helpers/request');

const {
	getMedian
} = require('./src/helpers/getPrice');

const {
	supportAssets,
	localPort,
	serviceName,
	medianStrategy,
	monitorGetPriceUrl,
} = require('./src/utils/config/base.config');

const {
	imBTCPrice,
} = require('./src/utils/config/api.config');

const {
	ERROR_CODE,
	ERROR_MSG,
} = require('./src/utils/config/error.config');


const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

var monitorData = {
	"err_code": ERROR_CODE.NO_ERROR,
	"err_msg": ERROR_MSG.NO_ERROR,
	"timestamp": 0,
	"server": serviceName,
	"app": "syncPrice",
	"version": "0.1.0",
	"data": {}
}

var duration = 30000;
var priceData = {};
var medianData = {};
var endflag = 0;
var time;

async function parsePriceData(priceData, currency, timestamp) {

	var data = [];
	var result;
	var price = '0';
	var endSign = false;
	console.log(`parsePriceData : ${currency} ; timestamp : ${timestamp}----------------------------\n`);
	for (let index = 0; index < priceData.length; index++) {
		price = '0';
		endSign = false;
		console.log(`exchange: ${priceData[index].sign}, ${timestamp}, length: ${data.length}`);
		console.log(`res: ${JSON.stringify(priceData[index])}`);
		console.log(`\n`);
		if (!priceData[index].data)
			continue;

		try {
			result = priceData[index].data == String ? JSON.parse(priceData[index].data) : priceData[index].data;
			if (!(result instanceof Object))
				continue;
			switch (priceData[index].sign) {
				case apiPriceConfig.exchange[0]:
					if (result.hasOwnProperty('price') && result.price && !isNaN(result.price)) {
						price = result.price.toString();
						endSign = true;
					}
					break;
				case apiPriceConfig.exchange[1]:
					if (result.hasOwnProperty('last') && result.last && !isNaN(result.last)) {
						price = result.last.toString();
						endSign = true;
					}
					break;
				case apiPriceConfig.exchange[2]:
					if (result.hasOwnProperty('tick') &&
						result.tick instanceof Object &&
						result.tick.hasOwnProperty('bid') &&
						Array.isArray(result.tick.bid) &&
						result.tick.bid[0] &&
						!isNaN(result.tick.bid[0])
					) {
						price = result.tick.bid[0].toString();
						endSign = true;
					}
					break;
				case apiPriceConfig.exchange[3]:
					if (result.hasOwnProperty('last') && result.last && !isNaN(result.last)) {
						price = result.last.toString();
						endSign = true;
					}
					break;
				case apiPriceConfig.exchange[4]:
					if (Array.isArray(result) &&
						Array.isArray(result[0]) &&
						result[0].length > 7 &&
						result[0][7] &&
						!isNaN(result[0][7])
					) {
						price = result[0][7].toString();
						endSign = true;
					}
					break;
				case apiPriceConfig.exchange[5]:
					if (result.hasOwnProperty('result') &&
						result.result instanceof Object &&
						result.result.hasOwnProperty('Last') &&
						result.result.Last &&
						!isNaN(result.result.Last)
					) {
						price = result.result.Last.toString();
						endSign = true;
					}
					break;
				case apiPriceConfig.exchange[6]:
					if (result.hasOwnProperty('data') &&
						result.data instanceof Object &&
						result.data.hasOwnProperty('price') &&
						result.data.price &&
						!isNaN(result.data.price)
					) {
						price = result.data.price.toString();
						endSign = true;
					}
					break;
				default:
					break;
			}
		} catch (error) {
			console.log(error);
			monitorData.err_code = ERROR_CODE.SYNC_PRICE_PARSE_ERROR;
			monitorData.err_msg = ERROR_MSG.SYNC_PRICE_PARSE_ERROR;
			monitorData.timestamp = Math.ceil(Date.now() / 1000);;
			monitorData.data = {
				'exchange': priceData[index].sign,
				'currency': currency,
				'info': priceData[index],
				'error_msg': error
			};
			post(monitorGetPriceUrl, monitorData);
		}

		if (endSign)
			data.push([priceData[index].sign, currency, price.toString(), endSign, timestamp]);
	}
	console.log(`currency: ${currency}, ${timestamp}, length: ${data.length}`);
	console.log(data);
	if (data.length < medianStrategy[currency]['leastValidValue']) {
		monitorData.err_code = ERROR_CODE.SYNC_PRICE_FILTER_ERROR;
		monitorData.err_msg = ERROR_MSG.SYNC_PRICE_FILTER_ERROR;
		monitorData.timestamp = Math.ceil(Date.now() / 1000);;
		monitorData.data = {
			'currency': currency,
			'info': data,
			'length': data.length
		};
		post(monitorGetPriceUrl, monitorData);
		return data;
	}
	oraclePrice.insertExchangePrice(data);
	await delay(200);
	oraclePrice.cleanDatabase(500);

	monitorData.err_code = ERROR_CODE.NO_ERROR;
	monitorData.err_msg = ERROR_MSG.NO_ERROR;
	monitorData.timestamp = Math.ceil(Date.now() / 1000);;
	monitorData.data = {
		'currency': currency,
		'info': data,
		'length': data.length
	};
	post(monitorGetPriceUrl, monitorData);

	return data;
}

// TODO: move out, only for imBTC
async function verifyTokenlonPrice(calculatingBTCPrice) {
	let tokenlonPrice = '';
	try {
		tokenlonPrice = await request(imBTCPrice);
		// TODO: need to confirm field: error
		if (tokenlonPrice.error != false) {
			throw new Error({
				'response': 'Tokenlon API error!'
			});
		};
	} catch (error) {
		console.log('Got an error: ', error.response);
		monitorData.err_code = ERROR_CODE.IMBTC_API_ERROR;
		monitorData.err_msg = ERROR_MSG.IMBTC_API_ERROR;
		monitorData.timestamp = Math.ceil(Date.now() / 1000);
		monitorData.data = {
			'info': error.response
		};
		post(monitorGetPriceUrl, monitorData);
	}

	let getImBTCPrice = tokenlonPrice.data.bid;
	getImBTCPrice = (10 ** 8 / getImBTCPrice).toFixed();

	let imBTCSwing = medianStrategy['imbtc']['safePriceSwing'];
	let btcSwing = Math.abs(calculatingBTCPrice - getImBTCPrice) / getImBTCPrice;
	if (imBTCSwing < btcSwing) {
		monitorData.err_code = ERROR_CODE.IMBTC_PRICE_ERROR;
		monitorData.err_msg = ERROR_MSG.IMBTC_PRICE_ERROR;
		monitorData.timestamp = Math.ceil(Date.now() / 1000);
		monitorData.data = {
			'Tokenlon_price': getImBTCPrice,
			'exchange_price': calculatingBTCPrice,
		};
		post(monitorGetPriceUrl, monitorData);
	}
	console.log('tokenlon price', getImBTCPrice);
	console.log('exchange price', calculatingBTCPrice);
	return calculatingBTCPrice < getImBTCPrice ? getImBTCPrice : calculatingBTCPrice;
}

async function main() {

	oraclePrice.initDB();
	await delay(200);
	while (true) {

		console.log('start----------------------------\n');
		time = Math.ceil(Date.now() / 1000);
		for (let i = 0; i < supportAssets.length; i++) {

			priceData[supportAssets[i]] = [];
			for (let index = 0; index < apiPriceConfig.apiList[supportAssets[i]].length; index++) {
				asyncGet(apiPriceConfig.apiList[supportAssets[i]][index], duration, priceData[supportAssets[i]], apiPriceConfig.exchange[index]);
				console.log(`sync ${supportAssets[i]} price [${index}]:${apiPriceConfig.exchange[index]}  url: ${apiPriceConfig.apiList[supportAssets[i]][index]}`);
			}
			monitorData.err_code = ERROR_CODE.NO_ERROR;
			monitorData.err_msg = ERROR_MSG.NO_ERROR;
			monitorData.timestamp = Math.ceil(Date.now() / 1000);
			monitorData.data = {
				'exchange': supportAssets[i],
				'info': 'Get exchange price',
			};
			post(monitorGetPriceUrl, monitorData);
		}

		while (endflag < supportAssets.length) {
			for (let index = 0; index < supportAssets.length; index++) {
				if (priceData[supportAssets[index]].length == apiPriceConfig.exchange.length) {
					medianData[supportAssets[index]] = await parsePriceData(priceData[supportAssets[index]], supportAssets[index], time);
					priceData[supportAssets[index]] = [];
					endflag += 1;
				}
			}
			await delay(200);
		}

		endflag = 0;

		var data = [];
		var priceMedian;
		for (let index = 0; index < supportAssets.length; index++) {

			if (medianData[supportAssets[index]].length < medianStrategy[supportAssets[index]]['leastValidValue'])
				continue;
				
			priceMedian = getMedian(medianData[supportAssets[index]]);

			console.log(supportAssets[index]);
			console.log(priceMedian.result);
			console.log(priceMedian.median.toString());
			if (priceMedian.result) {

				if (supportAssets[index] == 'imbtc')
					data.push(['tokenLon', supportAssets[index], await verifyTokenlonPrice(priceMedian.median.toString()), time]);
				else
					data.push([priceMedian.exchange, supportAssets[index], priceMedian.median.toString(), time]);
			} else {
				monitorData.err_code = ERROR_CODE.SYNC_PRICE_MEDIAN_ERROR;
				monitorData.err_msg = ERROR_MSG.SYNC_PRICE_MEDIAN_ERROR;
				monitorData.timestamp = Math.ceil(Date.now() / 1000);;
				monitorData.data = {
					'currency': supportAssets[index],
					'info': priceMedian
				};
				post(monitorGetPriceUrl, monitorData);
			}
		}
		console.log(data);

		if (data.length)
			oraclePrice.insertFeedPrice(data);

		console.log('medianData----------------------------\n');
		console.log(medianData);
		console.log('end----------------------------\n\n');
		await delay(50000);
	}
}

main();

http.createServer(async function (req, res) {

	res.writeHead(200, {
		'Content-Type': 'text/plain; charset=utf-8'
	});
	var urlInfo = url.parse(req.url, true);
	var result = 'parameter error';
	console.log(urlInfo);
	var data = '';
	for (const key in urlInfo.query) {
		switch (key) {
			case 'model':
				switch (urlInfo.query[key]) {
					case 'feedPrice':
						if (urlInfo.query.currency) {
							result = await oraclePrice.getFeedPrice(urlInfo.query.currency);
							if (result[0].id == null)
								result = [{}];
							result = JSON.stringify(result);
							res.end(`${result}`);
						}
						break;
					case 'lendfMePrice':
						if (urlInfo.query.asset) {
							result = await oraclePrice.getLendfMePrice(urlInfo.query.asset);
							if (result[0].id == null)
								result = [{}];
							result = JSON.stringify(result);
							res.end(`${result}`);
						}
						break;
					case 'insertLendfMePrice':
						req.on('data', async function (chunk) {
							data += chunk;
							console.log(data);
							oraclePrice.insertLendfMePrice(JSON.parse(data));
							res.end(`${data}`);
						});
						break;
					default:
						break;
				}
				break;
			default:
				break;
		}
		break;
	}
}).listen(localPort);
