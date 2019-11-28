const oraclePrice = require('./src/database/oraclePrice');
const https = require('./src/helpers/https')
const apiPriceConfig = require('./src/utils/config/apiPriceConfig')


const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

var BTCPrice = [];
var USDTPrice = [];
var USDxPrice = [];

var endflagBTC = false;
var endflagUSDT = false;
var endflagUSDx = false;

var time;

async function parsePriceData(priceData, currency, timestamp) {

	var data = [];
	var price = '0';
	var endSign = false;
	for (let index = 0; index < priceData.length; index++) {
		price = '0';
		endSign = false;
		switch (priceData[index].sign) {
			case apiPriceConfig.exchange[0]:
				if (priceData[index].data){
					price = JSON.parse(priceData[index].data).price;
					endSign = true;
				}
				break;
			case apiPriceConfig.exchange[1]:
				if (priceData[index].data){
					price = JSON.parse(priceData[index].data).last;
					endSign = true;
				}
				break;
			case apiPriceConfig.exchange[2]:
				if (priceData[index].data){
					price = JSON.parse(priceData[index].data).tick.data[0].price;
					endSign = true;
				}
				break;
			case apiPriceConfig.exchange[3]:
				if (priceData[index].data){
					price = JSON.parse(priceData[index].data).last;
					endSign = true;
				}
				break;
			case apiPriceConfig.exchange[4]:
				if (priceData[index].data){
					price = JSON.parse(priceData[index].data)[0][7];
					endSign = true;
				}
				break;
			case apiPriceConfig.exchange[5]:
				if (priceData[index].data){
					price = JSON.parse(priceData[index].data).result.Last;
					endSign = true;
				}
				break;
			case apiPriceConfig.exchange[6]:
				if (priceData[index].data){
					price = JSON.parse(priceData[index].data).data.price;
					endSign = true;
				}
				break;
			default:
				break;
		}

		if(endSign)
			data.push([priceData[index].sign, currency, price, endSign, timestamp]);
		
	}
	console.log(`currency: ${currency}, ${timestamp}, length: ${data.length}`);
	console.log(data);
	if (data.length < 5) {
		return;
	}
	oraclePrice.insertExchangePrice(data);
	await delay(200);
	oraclePrice.cleanDatabase(500);
}

async function main() {

	for (let index = 0; index < apiPriceConfig.exchange.length; index++) {
		https.asyncGet(apiPriceConfig.apiUrlBTC[index], BTCPrice, apiPriceConfig.exchange[index]);
		console.log(`sync BTC price [${index}]:${apiPriceConfig.exchange[index]}  url: ${apiPriceConfig.apiUrlBTC[index]}`);
		https.asyncGet(apiPriceConfig.apiUrlUSDT[index], USDTPrice, apiPriceConfig.exchange[index]);
		console.log(`sync USDT price [${index}]:${apiPriceConfig.exchange[index]}  url: ${apiPriceConfig.apiUrlUSDT[index]}`);
		https.asyncGet(apiPriceConfig.apiUrlUSDT[index], USDTPrice, apiPriceConfig.exchange[index]);
		console.log(`sync USDx price [${index}]:${apiPriceConfig.exchange[index]}  url: ${apiPriceConfig.apiUrlUSDT[index]}`);
	}
	time = Math.ceil(Date.now() / 1000);
	oraclePrice.initDB();
	await delay(200);
	while(true){
		if (endflagBTC && endflagUSDT && endflagUSDx) {

			return;
		}
		if (BTCPrice.length == apiPriceConfig.exchange.length) {
			
			parsePriceData(BTCPrice, 'BTC', time);
			BTCPrice = [];
			endflagBTC = true;
		}

		if (USDTPrice.length == apiPriceConfig.exchange.length) {
			
			parsePriceData(USDTPrice, 'USDT', time);
			USDTPrice = [];
			endflagUSDT = true;
		}

		if (USDxPrice.length == apiPriceConfig.exchange.length) {
			
			parsePriceData(USDxPrice, 'USDx', time);
			USDxPrice = [];
			endflagUSDx = true;
		}

		await delay(500);
	}
}

main();
