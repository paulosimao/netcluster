/**
 * Created by paulo.simao on 31/12/2015.
 */
var repl = require('repl');
var netcluster = require('../index').pipedclient();
var util = require('util');
var fs = require('fs');
netcluster.connect('control', function () {
    netcluster.on('log', function (msg) {
        console.log('A called:' + JSON.stringify(msg));
        //netcluster.disconnect();
    });
    netcluster.on('nc-control-showconfig-response', function (msg) {
        console.log('' + JSON.stringify(msg.data, null, '\t'));
        replServer.displayPrompt();
        //netcluster.disconnect();
    });
    netcluster.on('nc-control-showchannel-response', function (msg) {
        console.log('' + JSON.stringify(msg.data, null, '\t'));
        replServer.displayPrompt();
        //netcluster.disconnect();
    });
    netcluster.on('nc-control-reloadconfig-response', function (msg) {
        console.log('' + JSON.stringify(msg.data));
        replServer.displayPrompt();
        //netcluster.disconnect();
    });
    netcluster.on('nc-control-showclient-response', function (msg) {
        console.log('' + JSON.stringify(msg.data));
        replServer.displayPrompt();
        //netcluster.disconnect();
    });
});
var replServer = repl.start('NC-#:');
replServer.context.nc = netcluster;
replServer.defineCommand('lc', {
    help: 'List context',
    action: function () {
        for (a in replServer.context) {
            console.log(' - ' + a);
        }
        return '';
    }
});

function teste(a) {
    console.log('TESTE:' + a);
}
replServer.context.teste = teste;
replServer.context.showchannel = function (ch) {
    netcluster.emit('nc-control-showchannel', ch);
    return '';
};
replServer.context.showconfig = function () {
    netcluster.emit('nc-control-showconfig', '');
    return '';
};
replServer.context.showclient = function (ch, cliid) {
    netcluster.emit('nc-control-showclient', {channel: ch, client: cliid});
    return '';
};
replServer.context.reloadconfig = function (path) {

    var fs = require('fs');
    var confstr = fs.readFileSync(path);
    var conf = JSON.parse(confstr);

    netcluster.emit('nc-control-reloadconfig', conf);
    return '';
}
