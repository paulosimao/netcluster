var netcluster = require('netcluster')();
describe('NETCLUSTER - TEST', function () {
    it('Simple Test', function (done) {
        netcluster.on('a', function (msg) {
            console.log('A called:' + JSON.stringify(msg));
            netcluster.disconnect();
            done();
        });
        netcluster.connect(4454, '224.0.0.0', function () {
            netcluster.emit('a', {a: 1, b: 2});
        });
    });

});