let singleton = null

export default class PlayerState {
  constructor() {
    if (singleton === null) {
      console.log('setting a thing')
      this.playing = false
      singleton = this
    }

    return singleton
  }

  setIsPlaying(isPlayingBool) {
    this.playing = isPlayingBool
  }

  isPlaying() {
    return this.playing
  }
}
