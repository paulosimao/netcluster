var EventEmitter = require('events');
var uuid = require('node-uuid');
var dgram = require("dgram");
var util = require('util');
var net = require('net');
console.log('Loaded netcluster');
//module.exports.tmp =    function () {
//    var ret = {
//            uuid: uuid.v4(),
//            addr: undefined,
//            path: '\\\\?\\pipe\\netcluster-default',
//            port: 0,
//            eventemiter: new EventEmitter(),
//            eventemiterlocal: new EventEmitter(),
//
//            socket: undefined,
//            socketlocal: undefined,
//            serverlocal: undefined,
//            debugtoconsole: undefined,
//
//            connect: function (port, addr, path, cb) {
//                ret.connectlocal(path);
//                ret.connectnet(port, addr, cb);
//            },
//
//            connectlocal: function (path, cb) {
//                if (path && util.isFunction(path)) {
//                    cb = path;
//                } else if (path && util.isString(path)) {
//                    ret.path = path;
//                }
//                ret.socketlocal = net.createConnection(ret.path);
//                ret.socketlocal.on('data', ret.onlocalmsg);
//                ret.socketlocal.on('error', ret.onerror);
//                ret.socketlocal.on('close', ret.onclose);
//                ret.socketlocal.on('listening', ret.onlisten);
//                process.nextTick(cb);
//
//            },
//            connectnet: function (port, add, cb) {
//                ret.addr = addr;
//                ret.port = port;
//                ret.path = path;
//                ret.socket = dgram.createSocket("udp4");
//                ret.socket.on('message', ret.ondatagram);
//                ret.socket.on('error', ret.onerror);
//                ret.socket.on('close', ret.onclose);
//                ret.socket.on('listening', ret.onlisten);
//
//                ret.socket.bind(port, function () {
//                    ret.socket.addMembership(ret.addr);
//                    cb();
//                });
//
//            },
//
//            initnetsender: function (port, addr) {
//                ret.addr = addr;
//                ret.port = port;
//                ret.socket = dgram.createSocket("udp4");
//            },
//
//            /**
//             * Initiates Local Server (UnixSockets)
//             * @param path - Path to be bound to server.
//             */
//            initlocalserver: function (path) {
//                if (path) {
//                    ret.path = path;
//                }
//                ret.serverlocal = net.createServer(function (sock) {
//                    sock.on('data', ret.onlocalmsg);
//                    sock.on('error', ret.onerror);
//                    ret.eventemiterlocal.addListener()
//                });
//
//                ret.serverlocal.listen(ret.path);
//            },
//            disconnectnet: function () {
//                if (ret.socket) {
//                    ret.socket.dropMembership(ret.addr);
//                    ret.socket.close();
//                }
//            },
//            disconnectlocal: function () {
//                if (ret.socketlocal) {
//                    ret.socketlocal.end();
//                }
//
//            },
//            disconnect: function () {
//                ret.disconnectlocal();
//                ret.disconnectnet();
//            },
//            emit: function (event, data, bcast) {
//                if (ret.socketlocal) {
//                    ret.emitlocal(event, data, bcast);
//                }
//                if (ret.socket) {
//                    ret.emitnet(event, data, bcast);
//                }
//            },
//            emitnet: function (event, data, bcast) {
//                var packet = {
//                    emmiteruuid: ret.uuid,
//                    broadcast: bcast ? true : false,
//                    event: event,
//                    data: data
//                };
//
//                var b = new Buffer(JSON.stringify(packet));
//                ret.socket.send(b, 0, b.length, ret.port, ret.addr);
//            },
//        ,
//
//        on:
//
//    function (event, cb) {
//        ret.onlocal(event, function () {
//            ret.onremote(event, cb());
//        });
//    }
//
//    ,
//    once: function (event, cb) {
//        ret.oncelocal(event, function () {
//            ret.onceremote(event, cb());
//        });
//    }
//    ,
//    onlocal: function (event, cb) {
//        ret.eventemiterlocal.on(event, cb);
//    }
//    ,
//    oncelocal: function (event, cb) {
//        ret.eventemiterlocal.once(event, cb);
//    }
//    ,
//    onnet: function (event, cb) {
//        ret.eventemiter.on(event, cb);
//    }
//    ,
//    oncenet: function (event, cb) {
//        ret.eventemiter.once(event, cb);
//    }
//    ,
//    /**
//     * Event triggered once we have UDP messages
//     * @param msg
//     * @param info
//     */
//    ondatagram: function (msg, info) {
//        var msgobj = JSON.parse(msg.toString());
//        if (ret.debugtoconsole && new RegExp(ret.debugtoconsole).test(msgobj.event)) {
//            console.log(msg.toString());
//        }
//        ret.eventemiter.emit(msgobj.event, msgobj);
//        if (msgobj.broadcast && ret.eventemiterlocal) {
//            ret.eventemiterlocal.emit(msgobj.event, msgobj);
//        }
//
//    }
//    ,
//    /**
//     * Event triggered once we have local msgs
//     * @param msg
//     * @param info
//     */
//    onlocalmsg: function (msg) {
//        var msgobj = JSON.parse(msg.toString());
//        if (ret.debugtoconsole && new RegExp(ret.debugtoconsole).test(msgobj.event)) {
//            console.log(msg.toString());
//        }
//        ret.eventemiterlocal.emit('message', msg);
//        if (msgobj.broadcast && ret.eventemiter) {
//            ret.eventemiter.emit(msgobj.event, msgobj);
//        }
//    }
//    ,
//    onerror: function () {
//    }
//    ,
//    onclose: function () {
//    }
//    ,
//    onlisten: function () {
//    }
//}
//    ;
//
//
//    return ret;
//};


var pipedserver = function () {
    var ret = {
        path: undefined,
        emiter: undefined,
        /**
         * Initiates Local Server (UnixSockets)
         * @param path - Path to be bound to server.
         */
        initlocalserver: function (path) {
            if (path) {
                ret.path = path;
            }
            ret.emiter = new EventEmitter();
            ret.serverlocal = net.createServer(function (sock) {
                sock.on('data', function (data) {
                    ret.emiter.emit('data', sock, data);
                    if (ret.socket) {
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
                    ret.emiter.removeListener('data', sock.ondatalistener);
                });
                ret.emiter.on('data', sock.ondatalistener);
            });

            ret.serverlocal.listen(ret.path);
        },
        connectudp: function (port, addr, cb) {
            ret.addr = addr;
            ret.port = port;
            ret.socket = dgram.createSocket("udp4");
            ret.socket.on('message', ret.ondatagram);
            ret.socket.on('error', function (err) {
                console.error(err);
            });
            ret.socket.on('close', function () {
                console.log('UDP Socket closed');
            });

            ret.socket.bind(port, function () {
                ret.socket.addMembership(ret.addr);
                if (cb) {
                    cb();
                }

            });

        },
        ondatagram: function (msg) {
            ret.emiter.emit('data', null, msg);
        }
    };


    return ret;
};
var pipedclient = function () {
    var ret = {
        emiter: undefined,
        connect: function (path, cb) {
            if (path && util.isFunction(path)) {
                cb = path;
            } else if (path && util.isString(path)) {
                ret.path = path;
            }
            ret.emiter = new EventEmitter();
            ret.socket = net.createConnection(ret.path);
            ret.socket.on('data', function (msg) {
                var msgs = msg.toString().split('\0');
                for (var msgi of msgs) {
                    if (msgi && msgi.length > 0) {
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
module.exports.pipedserver = pipedserver;
module.exports.pipedclient = pipedclient;
