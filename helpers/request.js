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
            }, 180000) // 3 minutes
        }
    })
}


module.exports = {
    request,
}
