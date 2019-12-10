const ERROR_CODE = {
    NO_ERROR:   0,
    DATA_ERROR: 100001,
    NET_ERROR:  200001,
    FEED_ERROR: 300001,  // Feed price failed
    INSUFFICIENT_BALANCE: 300002 // Insufficient balance
};

const ERROR_MSG = {
    NO_ERROR:   'success',
    DATA_ERROR: '',
    NET_ERROR:  '',
    FEED_ERROR: '',  // Feed price failed
    INSUFFICIENT_BALANCE: 'Pay attention to your ETH balance' // Insufficient balance
};

module.exports = {
    ERROR_CODE,
    ERROR_MSG
}
