/**
 * Created by paulo.simao on 04/01/2016.
 */
var Service = require('node-windows').Service;
var path    = require('path');
// Create a new service object
var svc = new Service({
	name: 'ncserver',
	script: path.join(__dirname, 'win_service.js')
});

// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall', function () {
	console.log('Uninstall complete.');
	console.log('The service exists: ', svc.exists);
});

// Uninstall the service.
svc.uninstall();