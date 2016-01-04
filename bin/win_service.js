/**
 * Created by paulo.simao on 30/12/2015.
 */

var Winreg   = require('winreg')
	, regKey = new Winreg({
	hive: Winreg.HKLM,
	key: '\\Software\\Netcluster' // key containing autostart programs
});

// list autostart programs
regKey.values(function (err, items) {
	if (err)
		console.log('ERROR: ' + err);
	else
		for (var i of items)
			if (i.name === 'conf') {
				var fs        = require('fs');
				var Server    = require('../index').NCServer;
				var server    = new Server();
				var confstr   = fs.readFileSync(i.value);
				server.config = JSON.parse(confstr);
				server.start();
			}
	//console.log('ITEM: ' + items[i].name + '\t' + items[i].type + '\t' + items[i].value);
});
