/**
 * Created by paulo.simao on 30/12/2015.
 */
var os = require('os');
var ifaces = os.networkInterfaces();

for (i in ifaces) {
    for (j in ifaces[i]) {
        if (ifaces[i][j].family && ifaces[i][j].family === 'IPv4') {

            console.dir(ifaces[i][j].address);
        }
    }
}