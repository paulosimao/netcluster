var EventEmitter = require('events');
var uuid = require('node-uuid');
var dgram = require("dgram");
var util = require('util');
var net = require('net');
var async = require('async');
console.log('Loaded netcluster');

var pipedserver = function () {
        var ret = {
            path: undefined,
            emiter: undefined,
            localaddresses: {},
            channels: {},
            config: {
                addr: '224.0.0.0',
                port: 4454,
                connecttonet: true,
                dumpnet: true,
                startcontrol: true,
                channels: {
                    control: {
                        propagatetochannels: false,
                        propagatetonet: false,
                        dumptoconsole: false
                    },

                    A: {
                        propagatetochannels: false,
                        propagatetonet: false,
                        dumptoconsole: false
                    },
                    B: {
                        propagatetochannels: false,
                        propagatetonet: false,
                        dumptoconsole: false
                    }

                }
            },
            /**
             * Starts the server based on its the config.json object
             */
            start: function (cb) {


                var arr = [];
                for (var chan in ret.config.channels) {
                    arr.push(chan);
                }

                async.each(arr, function (achan, cb) {
                    createchannel(ret, achan, ret.config.channels[achan], cb);
                }, function (err) {
                    if (err) {
                        if (cb) {
                            return cb(err, null);
                        } else {
                            return console.error(err);
                        }
                    }
                    if (ret.config.startcontrol) {
                        createagent(ret);
                    }
                    if (ret.config.connecttonet) {
                        ret.connectudp(cb);
                    } else {
                        process.nextTick(function () {
                            cb(null, 'ok');
                        });
                    }
                });
            },

            /**
             * Connect to UDP Network
             * @param port
             * @param addr
             * @param cb
             */
            connectudp: function (cb) {
                ret.socket = dgram.createSocket("udp4");
                ret.socket.on('message', ret.ondatagram);
                ret.socket.on('error', function (err) {
                    console.error(err);
                });
                ret.socket.on('close', function () {
                    console.log('UDP Socket closed');
                });

                ret.socket.bind(ret.config.port, function () {
                    ret.socket.addMembership(ret.config.addr);
                    if (cb) {
                        cb();
                    }

                });

                //Lets map local ips so we can discard loopback messages...
                var os = require('os');
                var ifaces = os.networkInterfaces();

                for (i in ifaces) {
                    for (j in ifaces[i]) {
                        if (ifaces[i][j].family && ifaces[i][j].family === 'IPv4') {
                            ret.localaddresses[ifaces[i][j].address] = true;
                        }
                    }
                }

            },
            /**
             * Triggered upon arrival of UDP messages
             * @param msg
             * @param msginfo - brings metadata about the datagram
             */
            ondatagram: function (msg, msginfo) {
                if (!ret.localaddresses[msginfo.address]) {
                    if (ret.config.dumpnet) {
                        console.log(msg.toString());
                    }
                    ret.emiter.emit('data', null, msg);
                }
            },

            reload: function (cfg) {
                ret.config = cfg;
                for (var c in cfg.channels) {
                    if (!ret.channels[c]) {
                        createchannel(ret, c, ret.config.channels[c]);
                    }
                }
                for (var c in ret.channels) {
                    if (!ret.config.channels[c]) {
                        ret.channels[c].stop();
                    }
                }
            },
            stop: function () {
            }


        };

        return ret;
    }
    ;

function createchannel(ret, name, cfg, cb) {
    var chan = {};
    chan.emiter = new EventEmitter();
    chan.clients = {};
    chan.serverlocal = net.createServer(function (sock) {
        sock.uuid = uuid.v4();
        chan.clients[sock.uuid] = sock;
        sock.on('data', function (data) {

            if (cfg.dumptoconsole) {
                console.log(data.toString());
            }

            chan.emiter.emit('data', sock, data);

            if (cfg.propagatetochannels) {
                var regex = new RegExp(cfg.propagatetochannels);
                for (otherchan in ret.channels) {
                    if (regex.test(otherchan)) {
                        ret.channels[otherchan].emiter.emit('data', sock, data);
                    }
                }
            }

            if (cfg.propagatetonet && ret.socket) {
                ret.socket.send(data, 0, data.length, ret.port, ret.addr);
            }


        });
        sock.on('error', function (err) {
            console.error(err);
        });
        sock.ondatalistener = function (src, data) {
            if (sock != src || src == null) {
                sock.write(data)
            }

        };
        sock.on('close', function () {
            chan.emiter.removeListener('data', sock.ondatalistener);
        });
        chan.emiter.on('data', sock.ondatalistener);

    });

    chan.stop = function () {
        chan.emiter.removeAllListeners('data');
        chan.serverlocal.close();
        for (s in chan.clients) {
            chan.clients[s].end();
            delete chan.clients[s];
        }
        chan.clients = {};
    }


    chan.serverlocal.listen(getpipefromchannel(name), cb);
    ret.channels[name] = chan;

}
function createagent(ret) {
    ctrlagent = pipedclient();
    ctrlagent.connect('control', function () {
        ctrlagent.on('nc-control-showconfig', function (msg) {
            ctrlagent.emit('nc-control-showconfig-response', ret.config);

        });
        ctrlagent.on('nc-control-reloadconfig', function (msg) {
            try {
                ret.reload(msg.data);
                ctrlagent.emit('nc-control-reloadconfig-response', 'done');
            } catch (err) {
                ctrlagent.emit('nc-control-reloadconfig-response', err);
            }


        });
        ctrlagent.on('nc-control-showchannel', function (msg) {
            var clients = [];
            for (i in ret.channels[msg.data].clients) {
                clients.push(i);
            }
            ctrlagent.emit('nc-control-showchannel-response', clients);
        });

        ctrlagent.on('nc-control-showclient', function (msg) {
            ctrlagent.emit('nc-control-showclient-response', ret.channels[msg.data.channel].clients[msg.data.client]);
        });
    });
}

var pipedclient = function () {
    var ret = {
        emiter: undefined,
        dumptoconsole: false,
        connect: function (path, cb) {
            if (path && util.isFunction(path)) {
                cb = path;
            } else if (path && util.isString(path)) {
                ret.path = path;
            }
            ret.emiter = new EventEmitter();
            ret.socket = net.createConnection(getpipefromchannel(ret.path));
            ret.socket.on('data', function (msg) {
                var msgs = msg.toString().split('\0');
                for (var msgi of msgs) {
                    if (msgi && msgi.length > 0) {

                        if (ret.dumptoconsole) {
                            console.log(msgi.toString());
                        }

                        var msgobj = JSON.parse(msgi.toString());
                        ret.emiter.emit(msgobj.event, msgobj);
                    }
                }
            });
            ret.socket.on('error', function (err) {
                console.error(err);
            });
            ret.socket.on('close', function () {
                console.log('socket closed');
            });
            process.nextTick(cb);
        },
        disconnect: function () {
            ret.socket.end();
            ret.emiter.removeAllListeners();
        },
        emit: function (event, data, bcast) {
            var packet = {
                emmiteruuid: ret.uuid,
                channel: ret.path,
                broadcast: bcast ? true : false,
                event: event,
                data: data
            };

            var b = new Buffer(JSON.stringify(packet) + '\0');
            ret.socket.write(b, 0, b.length);
        },
        on: function (event, cb) {
            ret.emiter.on(event, cb);
        },
        once: function (event, cb) {
            ret.emiter.once(event, cb);
        },
        removeListener(event, cb){
            ret.emiter.removeListener(event, cb);
        }

    };
    return ret;
};

function getpipefromchannel(chan) {
    return (/^win/.test(process.platform) ? '\\\\?\\pipe\\netcluster-' : '/var/run/netcluster-') + chan
}

module.exports.pipedserver = pipedserver;
module.exports.pipedclient = pipedclient;
