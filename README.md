#Field of nodeMCU playing back recorded tweets from the past.

##Supported modes:
1. Tweet hashtag playing back
controller.startTweet(100) 100 is 100ms step size
controller.stopTweet()

2. Heart Monitor signal play through
Config.MonitHeart = true

3. Generic patterns
controller.startRegular(options)
controller.stopRegular()
default_option={
    duration: 1000,
    sequential: false,
    sequential_delta: 10,
    randomize: false,
    randomize_range: 400,
    drift: false,
    drift_delta: 10,
}

To run, install jupyter and nodejs support
npm install
jupyter notebook
start "election server.ipynb"