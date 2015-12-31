var netcluster = require('../index').pipedclient();
netcluster.connect('B', function () {
    netcluster.on('log', function (msg) {
        console.log('A called:' + JSON.stringify(msg));
        //netcluster.disconnect();
    });
});
