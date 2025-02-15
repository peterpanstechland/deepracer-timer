# deepracer-timer

Original concept and [code](https://github.com/nalbam/deepracer-timer) by Jungyoul Yu see his [blog post](https://blog.nalbam.com/3318) for more details.

I've removed a lot of the code I don't currently need and changed / tidied for my needs running [AWS DeepRacer](https://aws.amazon.com/deepracer/) events.

Additionally if the timer isn't already running then it will start when the car drives over the pressure switch.

## usage

```bash
./run.sh init
./run.sh start
./run.sh restart
./run.sh status
./run.sh stop
```

## screen

![screen](images/screen.png)

The green area exists to be used when streaming events using OBS by adding in as a video source and then using a chroma key filter.

## keymap

| Action  | Key |
| ------- | --- |
| Start   |  Q  |
| Pause   |  W  |
| Passed  |  E  |
| Reset   |  R  |
| Clear   |  T  |
| Squeeze |  Y  |
