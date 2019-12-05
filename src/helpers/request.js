const axios = require('axios')

function request(url) {
    return new Promise(async (resolve, reject) => {
        try {
            let result = await axios.get(url)
            resolve(result.data)
        } catch (error) {
            setTimeout(() => {
                console.error(error.stack)
                console.error('Get http error, try again after 3 minutes ...', error)
                request(url)
            }, 10000) // 10 seconds
        }
    })
}

function post(url, data) {
    axios.post(url, data).then((res) => {
        console.log("res=>", res)
    })
}

function asyncGet(url, duration, data, sign = '') {

    axios.get(url, {timeout: duration})
    .then(function (response) {
    
        var info = sign ? {'sign': sign, 'data' : response.data} : response.data;
			if (Array.isArray(data))
				data.push(info)
			else
				data = info;
    }).catch(function (error) {
    
        var info = sign ? {'sign': sign, 'data' : false} : false;
		if (Array.isArray(data))
			data.push(info);
		else
			data = info;
        console.log('sign error : ' + sign);
        console.log(error.errno);
    })
}

module.exports = {
    request,
    post,
    asyncGet,
}
