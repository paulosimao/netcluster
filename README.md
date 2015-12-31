# netcluster
Network based cluster for Node.js

Last updated at: **31-DEC-2015 10:35 GMT-2**

Default cluster lib works great as long as you´re in the same machine. Once you need to scale along multiple machines things start to get complicated.

Also, there are situations where your processed to be stand alone, but share computing skills.

This was the motivation to develop this lib.

In a short:

*It exchanges messages locally through pipes, each pipe is mapped in a channel. Roles for propagating messages among channels can be defined. It also exchange messages through UDP and routing can also be defined.*

*Conclusion: You can emit and listen to events in different processes and machines.*

Later it can incorporate different, multiple protocols.

For now, it works on top of UDP and Unix Socket / Windows Pipes and **without any cryptography**.

How it works:

1. You need to create a local server to coordinate unix sockets (see ncserver_<platform> in case you wont create your own.)
2. You need to connect to this server somehow (please see below)
3. You may send and receive messages
4. In case you want to exchange messages w different boxes, you need to enable UDP connection on the local server process.
##### How to install:
    npm install -g netcluster

In case you want to use provided server, the command ncserver will be available. If no parameters are provided,
it will use the config.json in the same folder ncserver is, otherwise, provide the FULL PATH to the config file
you want to use.

- `ncserver_posix` - Command to start provided server on *nix
- `ncserver_win` - Command to start provided server on windows
- `ncclient_posix` - Command to start provided control client on *nix
- `ncclient_win` - Command to start provided control client on windows

Both accept Full Qualified Path to config file(see below) as the only parameter.

##### Client Commands:

Once you run ncclient, it will start a REPL, allowing you to issue the following functions:

- `showconfig()`  : Dumps the active configuration on the server
- `reloaconfig (path)` : Reloads the config. Mandatory parameter is the full path of file. Remember that `\` needs to be escaped (double them).
- `showchannel (channame)` : <UNDER DEVELOPMENT >Shows you the uuid of clients connected to that channel.
- `showclient (chan,uuid)`  : <UNDER DEVELOPMENT >Shows info about that client (Broken at the moment).

**Please note these are functions available in REPL context, not REPL commands (the ones starting w/ .)**

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

###### Local Server (in case you want to embed):

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

#### TODO:

 - A lot of testing is required at the moment. Pleas provide feedback, and if possible register bugs into GITHUB (https://github.com/paulosimao/netcluster)