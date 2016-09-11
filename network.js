var Config = require('./config')

// var PORT = 12346;
// var HOST = '127.0.0.1';
var REMOTEPORT = 12345;
// var HOST = '192.168.0.101';

var LOCALHOST = '192.168.0.101';
var LOCALPORT = 12346;

var dgram = require('dgram');
var message = new Buffer('My KungFu is Good!');

var client = dgram.createSocket('udp4');
var server = dgram.createSocket('udp4');

var startServer=function(deviceHeartBeatFunc){
	Log("starting UDP server")
    server.on('listening', ()=>{
        var address = server.address();
        Log('UDP Server listening on ' + address.address + ":" + address.port);
    })

    server.on('message', (message, remote)=>{
        var msgSplit = message.toString().trim().split(' ')
        var msgType = msgSplit[0];
        switch(msgType){
            case "Heartbeat":
                var ip = msgSplit[4].split(":")[1]
                var id = msgSplit[3].split(":")[1]
                Config.DEBUG && Log("Heartbeat ===== ID:", id, "IP:", ip)
                // devices.add(remote.address, id);
                deviceHeartBeatFunc && deviceHeartBeatFunc(id, remote.address)
                break;
            default :
                // heart monitor, msg is 'ID:3#BPM:58.25'
                if(msgType.match('BPM')!==null){
                    Config.DEBUG && Log(msgType)
                    Config.MonitHeart && controller.tick()
                }
    //         console.log(remote.address + ':' + remote.port +' - ' + message);
        }
    //     console.log(remote.address + ':' + remote.port +' - ' + message);
    });

    server.bind(LOCALPORT, LOCALHOST);
};

var send=function(ip, message){
	client.send(message, 0, message.length, REMOTEPORT, ip, function(err, bytes) {
            if (err){
                Log(err)
                devices.rm(ip)
                // throw err;
            }
            Config.DEBUG && Log('UDP message sent to ' + ip +':'+ REMOTEPORT);
        })
};

module.exports = {
	startServer: startServer,
	send: send
};

