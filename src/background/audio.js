export default class AudioPlayer {

  src = null;

  audio = null;

  paused = true;

  /** @param {Blob} src */
  constructor(src) {
    this.src = src;
    this.audio = null;
    this.paused = true;
  }

  pause() {
    if (null === this.audio) return;

    this.audio.pause();
    this.audio = null;
    this.paused = true;
  }

  play() {

    return new Promise((resolve, reject) => {

      if (null !== this.audio)
        this.pause();

      const reader = new FileReader();

      reader.addEventListener('loadend', () => {

        this.audio = new Audio(reader.result);

        this.audio.addEventListener('error', () => {

          this.paused = true;
          reject('audio.js:41: error while playing audio');
        }, false);

        this.audio.addEventListener('ended', () => {
          this.audio = null;
          this.paused = true;
          resolve();
        }, false);

        this.paused = false;
        this.audio.play();
      }, false);

      reader.readAsDataURL(this.src);
    });
  }
}

