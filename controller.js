"use strict"
var _ = require('lodash');
var Q = require('q');
var Config = require('./config')

var getlogs=function(date){
    var deferred = Q.defer();
    var logs = [];
    //     fs.createReadStream('data/2016-07-27/part-00000')
    fs.createReadStream('data/'+date+'/part-00000')
        .pipe(split())
        .on('data', function (line) {
            if(line.length>5){
                var d=line.replace(/\]/, '').replace(/\[/, '').split(',');
                var user=d.shift()
                var hashtags=d.shift()
                var date=d.pop()
                var location=d.join(',')
                hashtags && hashtags.split(" ").forEach(h=>{
                    if(h.length>3)
                        logs.push({
                            hashtag: h,
                            date: new Date(date)
                        });
                });
            }else{
                Log(line)
            }
        })
        .on('end', ()=>{
            deferred.resolve(logs)
        })
        .on('finish', ()=>{
            Log("finish")
        })
        .on("error", err=>{
            deferred.reject(new Error(err));
        });
    return deferred.promise
}


class Controller{
    constructor(Network){
        this.plays=[]
        this.playing = false
        this.Network = Network
        this.duration = 100
    }
    day_to_id(i_day, i_hashtag){
        return i_day*Config.HashtagPerDay + i_hashtag
    }
    id_to_day(id){
        var i_day = Math.floor(id/Config.HashtagPerDay)
        var i_hashtag = id - i_day*Config.HashtagPerDay
        return {i_day: i_day, i_hashtag: i_hashtag}
    }
    heart_beat_received(id, ip){
        // Log(id, ip);
        if(this.plays[id]!==undefined){
            this.plays[id].add(ip)
        }
    }
    init(){
        return _.range(Config.NumDays).reduce((soFar, i_day)=>{
            return soFar.then(()=>{return getlogs(Hashtags[i_day].date)
                .then(logs=>{
                    global.L = logs; 
                    Log(logs.length, "logs loaded")
                    _.range(Config.HashtagPerDay).forEach(i_hashtag=>{
                        var date = Hashtags[i_day].date
                        var hashtag = Hashtags[i_day].hashtags[i_hashtag].hashtag
                        var stream = _.map(logs.filter(l=>{return l.hashtag == hashtag}), 'date')
                        this.plays.push( new PlayStream(date, hashtag, stream, this.Network))
                    })
                })
          })
        }, Q([]))
    }
    start(duration){
        if(duration !== undefined) this.duration = duration
        Log("start playing tweets at duration:", this.duration);
        this.plays.forEach(play=>{play.start()})
        this.playing = true
        this.render()
    }
    stop(){
        this.playing = false
    }
    render(){
        if(this.playing){
            setTimeout(()=>{this.render()}, this.duration)
            this.plays.forEach(play=>{play.render()})
        }
    }
}



module.exports=Controller;