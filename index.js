var EventEmiter = require('events');
var uuid = require('node-uuid');
var dgram = require("dgram");


module.exports = function (addr) {
    var ret = {
        uuid: uuid.v4(),
        addr: addr,
        port: 0,
        eventemiter: new EventEmiter(),
        socket: null,
        on: function (event, cb) {
            ret.eventemiter.on(event, cb);
        },
        once: function (event, cb) {
            ret.eventemiter.once(event, cb);
        },

        connect: function (port, addr, cb) {
            ret.addr = addr;
            ret.port = port;
            ret.socket = dgram.createSocket("udp4");
            ret.socket.on('message', ret.ondatagram);
            ret.socket.on('error', ret.onerror);
            ret.socket.on('close', ret.onclose);
            ret.socket.on('listening', ret.onlisten);

            ret.socket.bind(port, function () {
                ret.socket.addMembership(ret.addr);
                cb();
            });

        },
        disconnect: function () {
            ret.socket.dropMembership(ret.addr);
            ret.socket.close();
        },
        emit: function (event, data) {
            var packet = {
                emmiteruuid: ret.uuid,
                event: event,
                data: data
            };

            var b = new Buffer(JSON.stringify(packet));
            ret.socket.send(b, 0, b.length, ret.port, ret.addr);
        },

        ondatagram: function (msg, info) {
            var msgobj = JSON.parse(msg.toString());
            ret.eventemiter.emit(msgobj.event, msgobj.data);

        },
        onerror: function () {
        },
        onclose: function () {
        },
        onlisten: function () {
        }
    };


    return ret;
};