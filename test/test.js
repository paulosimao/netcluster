var Server        = require('../index').NCServer;
var Agent         = require('../index').NCAgent;
var child_process = require('child_process');
var agent         = new Agent();
var assert        = require('assert');

var server = undefined;
var sender = undefined;
describe('NETCLUSTER - TEST', function () {
	before(function (done) {
		server = child_process.fork('test/ch_server');
		server.on('message', function (msg) {
			sender = child_process.fork('test/ch_sender');
			sender.on('message', function (msg) {
				done();
			});
		});
	});

	it('Simple Test', function (done) {
		agent = new Agent();
		agent.connect('A', function () {
			agent.on('.*', function (msg) {
				console.log(msg);
				assert.notEqual(null, msg);
				agent.disconnect();
				done();
			});
			//agent.emit('A', {a: 'A', b: 'B', c: 'C'});
		});

	});

});
