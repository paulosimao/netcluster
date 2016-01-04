/**
 * Created by paulo.simao on 04/01/2016.
 */
var Server    = require('../index').NCServer;
var server    = new Server();
server.config = {
	//UDP Multicast addr
	"addr": "224.0.0.0",
	//UDP Multicast port
	"port": 4454,
	//In case you want to dump whatever comes over the socket to console
	"dumpnet": true,
	//Tells wether this instance will connect to the network or not
	"connecttonet": true,
	//Tells whether you want to start control channel agent
	"startcontrol": true,
	//This are the channels - each is an independent local socket
	"channels": {
		//channel name
		"control": {
			//Tells to wich channels msgs should be propagated. If false none,
			//if string, should be a Regex pointing to associated names.
			"propagatetochannels": false,
			//Tells if msgs should go to network also
			"propagatetonet": false,
			//Tell if msgs on this channel should be dumped to console
			"dumptoconsole": false
		},
		"A": {
			"propagatetochannels": ".*",
			"propagatetonet": false,
			"dumptoconsole": false
		},
		"B": {
			"propagatetochannels": ".*",
			"propagatetonet": false,
			"dumptoconsole": false
		}
	}

};
server.start(function (err) {
	if (err) {
		console.error(err);
	} else {
		process.send('serverup');
	}
	console.log('Server Started');
});
