const ERROR_CODE = {
    NO_ERROR:   0,
    DATA_ERROR: 100001,
    NET_ERROR:  200001,
    FEED_ERROR: 300001,  // Feed price failed
    INSUFFICIENT_BALANCE: 300002, // Insufficient balance
    AUTHORITY_LIMITED: 300003,    // Authority
    UNSPECTED_ERROR: 300004,      // Code error

    SYNC_PRICE_ERROR:           400001,
    SYNC_PRICE_PARSE_ERROR:     400002,
    SYNC_PRICE_FILTER_ERROR:    400003,
    SYNC_PRICE_MEDIAN_ERROR:    400004,
};

const ERROR_MSG = {
    NO_ERROR:   'success',
    DATA_ERROR: '',
    NET_ERROR:  '',
    FEED_ERROR: '',  // Feed price failed
    INSUFFICIENT_BALANCE: 'Pay attention to your ETH balance', // Insufficient balance
    AUTHORITY_LIMITED: 'Check poster address!',
    UNSPECTED_ERROR: 'Check the log for more detail',
    NO_WRITING: 'Do not set a new Price!',

    SYNC_PRICE_PARSE_ERROR:     'Parsing price anomalies',
    SYNC_PRICE_FILTER_ERROR:    'Get price less than 5',
    SYNC_PRICE_FILTER_ERROR:    'Get price less than 5',
    SYNC_PRICE_MEDIAN_ERROR:    'Did not get median',
};

module.exports = {
    ERROR_CODE,
    ERROR_MSG
}
