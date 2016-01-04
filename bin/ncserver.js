/**
 * Created by paulo.simao on 30/12/2015.
 */
var fs        = require('fs');
var Server    = require('../index').NCServer;
var server    = new Server();
var confstr   = fs.readFileSync(process.argv[2] ? process.argv[2] : __dirname + '/config.json');
var conf      = JSON.parse(confstr);
server.config = conf;
server.start();
