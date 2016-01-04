//var EventEmitter = require('events');
var EventEmitter = require('xtraemitter');
var uuid         = require('node-uuid');
var dgram        = require("dgram");
var util         = require('util');
var net          = require('net');
var async        = require('async');

var NCServer = function () {

	this.path           = undefined;
	this.emiter         = undefined;
	this.localaddresses = {};
	this.channels       = {};
	this.config         = {
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
			}

		}
	}
};
/**
 * Starts the server based on its the config.json object
 */
NCServer.prototype.start = function (cb) {


	var arr = [];
	for (var chan in this.config.channels) {
		arr.push(chan);
	}

	async.each(arr, (achan, cb) => {
		createchannel(this, achan, this.config.channels[achan], cb);
	}, (err) => {
		if (err) {
			if (cb) {
				return cb(err, null);
			} else {
				return console.error(err);
			}
		}
		if (this.config.startcontrol) {
			createagent(this);
		}
		if (this.config.connecttonet) {
			this.connectudp(cb);
		} else {
			process.nextTick(function () {
				cb(null, 'ok');
			});
		}
	});
};
/**
 * Connect to UDP Network
 * @param port
 * @param addr
 * @param cb
 */
NCServer.prototype.connectudp = function (cb) {
	this.socket = dgram.createSocket("udp4");
	this.socket.on('message', (msg, info) => {
		this.ondatagram(msg, info)
	});
	this.socket.on('error', function (err) {
		console.error(err);
	});
	this.socket.on('close', function () {
		console.log('UDP Socket closed');
	});

	this.socket.bind(this.config.port, () => {
		this.socket.addMembership(this.config.addr);
		if (cb) {
			cb();
		}

	});

	//Lets map local ips so we can discard loopback messages...
	var os     = require('os');
	var ifaces = os.networkInterfaces();

	for (i in ifaces) {
		for (j in ifaces[i]) {
			if (ifaces[i][j].family && ifaces[i][j].family === 'IPv4') {
				this.localaddresses[ifaces[i][j].address] = true;
			}
		}
	}

};
/**
 * Triggered upon arrival of UDP messages
 * @param msg
 * @param msginfo - brings metadata about the datagram
 */
NCServer.prototype.ondatagram = function (msg, msginfo) {
	if (!this.localaddresses[msginfo.address]) {
		if (this.config.dumpnet) {
			console.log(msg.toString());
		}
		this.emiter.emit('data', null, msg);
	}
};
NCServer.prototype.reload = function (cfg) {
	this.config = cfg;
	for (var c in cfg.channels) {
		if (!this.channels[c]) {
			createchannel(this, c, this.config.channels[c]);
		}
	}
	for (var c in this.channels) {
		if (!this.config.channels[c]) {
			this.channels[c].stop();
		}
	}
};
NCServer.prototype.stop   = function () {
};

var NCAgent                      = function () {

	this.emiter        = undefined;
	this.dumptoconsole = false;
};
NCAgent.prototype.connect        = function (path, cb) {
	if (path && util.isFunction(path)) {
		cb = path;
	} else if (path && util.isString(path)) {
		this.path = path;
	}
	this.emiter       = new EventEmitter();
	this.socket       = net.createConnection(getpipefromchannel(this.path));
	this.socket.on('data', (msg) => {
		var msgs = msg.toString().split('\0');
		for (var msgi of msgs) {
			if (msgi && msgi.length > 0) {

				if (this.dumptoconsole) {
					console.log(msgi.toString());
				}

				var msgobj = JSON.parse(msgi.toString());
				this.emiter.emit(msgobj.event, msgobj);
			}
		}
	});
	this.socket.on('error', function (err) {
		console.error(err);
	});
	this.socket.on('close', function () {
		console.log('socket closed');
	});
	process.nextTick(cb);
};
NCAgent.prototype.disconnect     = function () {
	this.socket.end();
	this.emiter = undefined;
};
NCAgent.prototype.emit           = function (event, data, bcast) {
	var packet = {
		emmiteruuid: this.uuid,
		channel: this.path,
		broadcast: bcast ? true : false,
		event: event,
		data: data
	};

	var b = new Buffer(JSON.stringify(packet) + '\0');
	this.emiter.emit(event, packet);
	this.socket.write(b, 0, b.length);
};
NCAgent.prototype.on             = function (event, cb) {
	this.emiter.on(event, cb);
};
NCAgent.prototype.once           = function (event, cb) {
	this.emiter.once(event, cb);
};
NCAgent.prototype.removeListener = function (event, cb) {
	this.emiter.removeListener(event, cb);
};

function getpipefromchannel(chan) {
	return (/^win/.test(process.platform) ? '\\\\?\\pipe\\netcluster-' : '/var/run/netcluster-') + chan
}
function createchannel(ret, name, cfg, cb) {
	var chan         = {};
	chan.emiter      = new EventEmitter();
	chan.clients     = {};
	chan.serverlocal = net.createServer(function (sock) {
		sock.uuid               = uuid.v4();
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
	};


	chan.serverlocal.listen(getpipefromchannel(name), cb);
	ret.channels[name] = chan;

}
function createagent(ret) {
	ctrlagent = new NCAgent();
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


module.exports.NCServer = NCServer;
module.exports.NCAgent  = NCAgent;
