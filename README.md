# netcluster
Network based cluster for Node.js

Default cluster lib works great as long as you´re in the same machine. Once you need to scale along multiple machines things start to get get complicated.

This was the motivation to develop this lib.

Later it can incorporate different, multiple protocols.

For timebeing, it works on top of UDP and without any cryptography.

    //Create the cluster instance
    var netcluster = require('../index')();

    //binds event listener
    netcluster.on('a', function (msg) {
        console.log('A called:' + JSON.stringify(msg));
        //Closes connection
        netcluster.disconnect();
    });

    //Connects to the cluster - note a callback is called upon success.
    netcluster.connect(4454, '224.0.0.0', function () {
        //Sends an event to the cluster
        netcluster.emit('a', {a: 1, b: 2});
    });

Relevant Interface:

- `on: function (event, cb)` - Binds listener to event
- `once: function (event, cb)`- Binds listener to event once only
- `emit: function (event, data)` - Sends an event to the cluster

*For these, please refer to node events API* (https://nodejs.org/api/events.html)

- `connect: function (port, addr, cb)` - Connects to cluster. Must use a Multicast Addr (refer to: https://en.wikipedia.org/wiki/Multicast_address)
- `disconnect: function ()` - Disconnects from the cluster
