/**
 * Created by paulo.simao on 29/12/2015.
 */
var netcluster = require('../index').pipedclient();
netcluster.connect('\\\\?\\pipe\\netcluster-default', function () {
    function loop() {
        netcluster.emit('log', 'TESTE');
        setTimeout(loop, 1000);
    }

    loop();

});

