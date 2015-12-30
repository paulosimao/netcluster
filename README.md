# netcluster
Network based cluster for Node.js

Last updated at: **29-DEC-2015 20:15 GMT-2**

Default cluster lib works great as long as you´re in the same machine. Once you need to scale along multiple machines things start to get complicated.

Also, there are situations where your processed to be stand alone, but share computing skills.

This was the motivation to develop this lib.

Later it can incorporate different, multiple protocols.

For timebeing, it works on top of UDP and Unix Socket / Windows Pipes and **without any cryptography**.

How it works:

1. You need to create a local server to coordinate unix sockets
2. You need to connect to this server somehow (please see below)
3. You may send and receive messages
4. In case you want to exchange messages w different boxes, you need to enable UDP connection on the local server process.
In this version, any package locally sent will be replicated remotelly - it is a mashup. Maybe later we can create channels to
reduce uneeded network usage.

##### Snippets:

###### Local Server:

    //Create localserver
    var netcluster = require('netcluster').pipedserver();

    //Uses a pipe to stablish localserver -in Unix, you should use /var/run/mysocket
    netcluster.initlocalserver('\\\\?\\pipe\\netcluster-default');

    //Connect to UDP BUS on the following port and multicast address.
    netcluster.connectudp(4454,'224.0.0.0');

###### Receiver:

    //Create Client
    var netcluster = require('netcluster').pipedclient();

    //Connect to server through pipe
    netcluster.connect('\\\\?\\pipe\\netcluster-default', function () {
        //Callback once connected we set client up.
        netcluster.on('log', function (msg) {
            console.log('A called:' + JSON.stringify(msg));
            //netcluster.disconnect();
        });
    });


###### Sender:

    //Create Client
    var netcluster = require('netcluster').pipedclient();

    //Bind to local server
    netcluster.connect('\\\\?\\pipe\\netcluster-default', function () {
        function loop() {

            //Emit event
            netcluster.emit('log', 'TESTE');
            setTimeout(loop, 1000);
        }

        loop();

    });
    });

##### Relevant Interface:

###### Local Server:

- `initlocalserver: function (path)` : Initiate local server and binds it to the associated path.
- `connectudp: function (port, addr, cb)`: Initiate server to exchange packets over the network. Needless to say that
if you create the same server in another machine within the same network, and associate a listener to it,
packages will be exchanged between the boxes.

###### Client:
- `connect: function (path, cb)` : Connects client to local addr
- `disconnect: function ()` : Disconnects
- `emit: function (event, data)`: Send event and data associated to in
- `on: function (event, cb)` : Function triggered once message is received. cb should have one parameter to receive the message itself.
- `once: function (event, cb)`: Same as above,but triggered only once and not at every message
- `removeListener(event, cb)`: Removes a listener.

*For these, please refer to node events API* (https://nodejs.org/api/events.html)
