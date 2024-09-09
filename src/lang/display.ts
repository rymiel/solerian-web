import { scriptMultiUnicode } from "./script";
import { MinimalWord, soundChange } from "./soundChange";

export interface DisplayWord {
  sol: string;
  script: string;
  ipa: string;
}

export function populateDualInfo(word: MinimalWord): DisplayWord {
  return {
    sol: word.sol,
    script: scriptMultiUnicode(word.sol),
    ipa: soundChange(word),
  };
}
