const https = require('https');

function syncGet(url) {
	return new Promise((resolve, reject) => {
		https.get(url, (res) => {
			res.on('data', (d) => {
				resolve(d.toString())
			})
		}).on('error', (e) => {
			reject(e);
		})
	})
}

function asyncGet(url, data, sign = '') {
	https.get(url, (res) => {
		res.on('data', (d) => {
			var info = sign ? {'sign': sign, 'data' : d.toString()} : d.toString();
			if (Array.isArray(data))
				data.push(info)
			else
				data = info;
		});
	}).on('error', (e) => {
		var info = sign ? {'sign': sign, 'data' : false} : false;
		if (Array.isArray(data))
			data.push(info);
		else
			data = info;
	});
}


module.exports = {
	syncGet,
	asyncGet
}