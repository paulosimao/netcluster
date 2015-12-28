/**
 * Created by paulo.simao on 28/12/2015.
 */
var netcluster = require('../index')();

netcluster.on('a', function (msg) {
    console.log('A called:' + JSON.stringify(msg));
    netcluster.disconnect();
});

netcluster.connect(4454, '224.0.0.0', function () {
    netcluster.emit('a', {a: 1, b: 2});
});
