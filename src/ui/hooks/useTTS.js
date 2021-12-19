import AudioPlayer from "../common/audio";
import { tts } from "../../background/api";

export default function useTTS() {
  const audio = new AudioPlayer();

  return async function(text, targetLang) {

    try {
      audio.src = await tts(text, targetLang);
      audio.play();
    }
    catch (err) {
      console.error('useAudio.js:14:', err);
    }
  };
}