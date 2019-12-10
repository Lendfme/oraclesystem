const OPS_ERROR = {
    NO_ERROR:   0,
    DATA_ERROR: 100001,
    NET_ERROR:  200001,
    FEED_ERROR: 300001,  // Feed price failed
    INSUFFICIENT_BALANCE: 300002 // Insufficient balance
};

module.exports = {
    OPS_ERROR
}
