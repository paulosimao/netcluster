var netcluster = require('../index')();
var netcluster2 = require('../index')();
describe('NETCLUSTER - TEST', function () {
    it('Simple Test', function (done) {

        netcluster2.connectlocal('teste', function () {
            netcluster2.onlocal('a', function (msg) {
                console.log('A called:' + JSON.stringify(msg));
                netcluster2.disconnect();
                netcluster.disconnect();
                done();
            });
        });
        netcluster.connectlocal('teste', function () {
            netcluster.emitlocal('a', {a: 1, b: 2});
        });
    });

});