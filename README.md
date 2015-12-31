# netcluster
Network based cluster for Node.js

Last updated at: **31-DEC-2015 10:35 GMT-2**

Default cluster lib works great as long as you´re in the same machine. Once you need to scale along multiple machines things start to get complicated.

Also, there are situations where your processed to be stand alone, but share computing skills.

This was the motivation to develop this lib.

Later it can incorporate different, multiple protocols.

For now, it works on top of UDP and Unix Socket / Windows Pipes and **without any cryptography**.

How it works:

1. You need to create a local server to coordinate unix sockets
2. You need to connect to this server somehow (please see below)
3. You may send and receive messages
4. In case you want to exchange messages w different boxes, you need to enable UDP connection on the local server process.
In this version, any package locally sent will be replicated remotelly - it is a mashup. Maybe later we can create channels to
reduce uneeded network usage.

##### How to install:
    npm install -g netcluster

In case you want to use provided server, the command ncserver will be available. If no parameters are provided,
it will use the config.json in the same folder ncserver is, otherwise, provide the FULL PATH to the config file
you want to use.

##### Snippets:

###### Config (control channel must exist ALWAYS):
    {
      //UDP Multicast addr
      "addr": "224.0.0.0",
      //UDP Multicast port
      "port": 4454,
      //In case you want to dump whatever comes over the socket to console
      "dumpnet": true,
      //Tells wether this instance will connect to the network or not
      "connecttonet": true,
      //Tells whether you want to start control channel agent
      "startcontrol": true,
      //This are the channels - each is an independent local socket
      "channels": {
        //channel name
        "control": {
           //Tells to wich channels msgs should be propagated. If false none,
           //if string, should be a Regex pointing to associated names.
          "propagatetochannels": false,
          //Tells if msgs should go to network also
          "propagatetonet": false,
          //Tell if msgs on this channel should be dumped to console
          "dumptoconsole": false
        },
        "A": {
          "propagatetochannels": ".*",
          "propagatetonet": false,
          "dumptoconsole": false
        },
        "B": {
          "propagatetochannels": ".*",
          "propagatetonet": false,
          "dumptoconsole": false
        }
      }
    }

###### Local Server:

    var fs = require('fs');
    var netcluster = require('../index').pipedserver();
    var confstr = fs.readFileSync(process.argv[2] ? process.argv[2] : 'config.json');
    var conf = JSON.parse(confstr);
    netcluster.config = conf;
    netcluster.start();

###### Receiver:

    //Create client
    var netcluster = require('../index').pipedclient();
    //connect to channel
    netcluster.connect('B', function () {
        //assigns listener to on msg
        netcluster.on('log', function (msg) {
        console.log('A called:' + JSON.stringify(msg));
        netcluster.disconnect();
        });
    });

###### Sender:

    //Create Client
    var netcluster = require('netcluster').pipedclient();

    //Bind to local server
    netcluster.connect('A', function () {
        function loop() {

            //Emit event
            netcluster.emit('log', 'TESTE');
            setTimeout(loop, 1000);
        }

        loop();

    });
    });

##### Relevant Interface:

###### BOTH:
 - `dumptoconsole` - Variable that if set to true will dump to console every message received. Works on both server and client.

###### Local Server:

- `start: function ()` : Initiate local server and binds it to the associated path.

###### Client:
- `connect: function (channel, cb)` : Connects client to local addr
- `disconnect: function ()` : Disconnects
- `emit: function (event, data)`: Send event and data associated to in
- `on: function (event, cb)` : Function triggered once message is received. cb should have one parameter to receive the message itself.
- `once: function (event, cb)`: Same as above,but triggered only once and not at every message
- `removeListener(event, cb)`: Removes a listener.

*For these, please refer to node events API* (https://nodejs.org/api/events.html)