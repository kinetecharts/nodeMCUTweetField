"use strict"
var Config = require('./config')

var MaxHeartbeatCnt = 3;

var get_offsetted_now=function(offset){
    var now = new Date()
    var time = new Date(now.setDate(now.getDate() - offset))
    if(Config.OffsetHour !==0){
        return new Date(time.setHours(time.getHours()+Config.OffsetHour))
    }
    return time
}


class PlayStream{
    constructor(date, hashtag, stream, Network){
        this.Network = Network
        this.date = date
        this.hashtag=hashtag
        this.stream=stream
        this.time = new Date()
        this.days_offset = Math.floor((new Date() - stream[0])/86400000)
        this.t_last
        this.t_now
        this.ip = null
        this.heartbeat_cnt = 0;
        this.playHead = 0; //for performance reason, we use counter
        this.timeoutInsts = [];

        Log("created play for ", date, hashtag, stream.length, "events")
    }
    add(ip){
        if(this.ip == null){
            Log("adding", ip, "to", this.date, this.hashtag)
            setTimeout(()=>{ this.checkHealth()}, 3000);
        }
        this.ip = ip
        this.heartbeat_cnt = MaxHeartbeatCnt
    }
    checkHealth(){ // check every 3 second
        if(this.ip!==null){
            var that = this;
            this.heartbeat_cnt --
            if(this.heartbeat_cnt<0){
                Log("removing", this.ip, "from", this.date, this.hashtag)
                this.ip = null
            }else{
                setTimeout(()=>{ this.checkHealth()}, 3000);
            }
        }
    }
    remove(ip){
        this.ip = null
    }
    tick(remove_from_timeoutInsts){
        if(remove_from_timeoutInsts) this.timeoutInsts.shift()
        this.Network.send(this.ip, "tick")
    }
    startTweet(){ //start from current time
        this.days_offset = Math.floor((new Date() - this.stream[0])/86400000)
        this.t_last = get_offsetted_now(this.days_offset)
        this.playHead = _.filter(this.stream, t=>{return t < this.t_last }).length


    }
    renderTweet(){
        this.t_now = get_offsetted_now(this.days_offset)
        if(this.stream[this.playHead]<this.t_now){
            if(this.ip!==null){
                this.Network.send(this.ip, this.hashtag)
                if(Config.DEBUG) Log(this.date, this.hashtag, this.t_now)
            }
            this.playHead++
        }
        this.t_last = this.t_now
    }
    renderRegular(option, idx){
        if(option.sequential==false && option.randomize == false){
            this.tick()
        }else if(option.sequential && option.randomize == false){
            this.timeoutInsts.push(setTimeout(()=>{this.tick(true)}, idx*option.sequential_delta))
        }else if(option.sequential==false && option.randomize){
            this.timeoutInsts.push(setTimeout(()=>{this.tick(true)}, Math.random()* option.randomize_range))
        }else if(option.sequential && option.randomize){
            this.timeoutInsts.push(setTimeout(()=>{this.tick(true)}, idx*option.sequential_delta + Math.random()* option.randomize_range))
        }
    }
    stopRegular(){
        this.timeoutInsts.forEach(inst=>{clearTimeout(inst)})
        this.timeoutInsts.length = 0
    }
}

module.exports=PlayStream;