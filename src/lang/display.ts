import { scriptMultiUnicode } from "./script";
import { soundChange } from "./soundChange";

export interface DisplayWord {
  sol: string;
  script: string;
  ipa: string;
}

export function populateDualInfo(word: string, markStress = true): DisplayWord {
  return {
    sol: word,
    script: scriptMultiUnicode(word),
    ipa: soundChange(word, markStress),
  };
}
