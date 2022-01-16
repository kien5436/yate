export default class AudioPlayer {

  /** @param {Blob} src */
  constructor(src) {
    this.src = src;
    this.audio = null;
  }

  pause() {
    if (null === this.audio) return;

    this.audio.pause();
    this.audio = null;
  }

  play() {
    if (null !== this.audio) {
      this.pause();
    }

    const reader = new FileReader();

    reader.addEventListener('loadend', () => {

      this.audio = new Audio(reader.result);

      this.audio.addEventListener('error', () => console.error('audio.js:17: error while playing audio'), false);

      this.audio.addEventListener('ended', function() {
        this.audio = null;
      }, false);

      this.audio.play();
    }, false);

    reader.readAsDataURL(this.src);
  }
}