/**
 * Created by paulo.simao on 30/12/2015.
 */
var fs = require('fs');
var netcluster = require('../index').pipedserver();
var confstr = fs.readFileSync(process.argv[2] ? process.argv[2] : __dirname+'/config.json');
var conf = JSON.parse(confstr);
netcluster.config = conf;
netcluster.start();
