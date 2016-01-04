/**
 * Created by paulo.simao on 04/01/2016.
 */
var Service = require('node-windows').Service;
var path    = require('path');
// Create a new service object
var svc = new Service({
	name: 'ncserver',
	description: 'Net Cluster Server - Routes messages among NC machines.',
	script: path.join(__dirname, 'win_service.js')
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function () {
	svc.start();
	console.log('The service has been installed: ', svc.exists);
});

svc.install();