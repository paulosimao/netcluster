/**
 * Created by paulo.simao on 04/01/2016.
 */
//Create Client
var Agent = require('../index').NCAgent;
var agent = new Agent();
//Bind to local server
agent.connect('A', function () {
	process.send('serverup');
	function loop() {
		//Emit event
		agent.emit('log', 'TESTE');
		setTimeout(loop, 1000);
	}

	loop();


});
