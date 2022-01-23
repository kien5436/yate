export default class AudioPlayer {

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
    if (null !== this.audio) {
      this.pause();
    }

    const reader = new FileReader();

    reader.addEventListener('loadend', () => {

      this.audio = new Audio(reader.result);

      this.audio.addEventListener('error', () => {

        this.paused = true;
        console.error('audio.js:32: error while playing audio');
      }, false);

      this.audio.addEventListener('ended', function() {
        this.audio = null;
        this.paused = true;
      }, false);

      this.audio.play();
      this.paused = false;
    }, false);

    reader.readAsDataURL(this.src);
  }
}