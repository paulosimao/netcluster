/**
 * Created by paulo.simao on 29/12/2015.
 */
var netcluster = require('../index').pipedclient();
netcluster.connect('A', function () {
    function loop() {
        netcluster.emit('log', 'TESTE');
        setTimeout(loop, 1000);
    }
    loop();
});

