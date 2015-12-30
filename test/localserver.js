var netcluster = require('netcluster').pipedserver();
netcluster.initlocalserver('\\\\?\\pipe\\netcluster-default');
netcluster.connectudp(4454,'224.0.0.0');