import { useContext } from "react";

import { scriptMultiUnicode } from "lang/script";
import { LangConfig } from "providers/langConfig";

export interface DisplayWord {
  sol: string;
  script: string;
  ipa: string;
}

export function usePopulateDualInfo() {
  const lang = useContext(LangConfig);

  return (word: string, markStress = true) => ({
    sol: word,
    script: scriptMultiUnicode(word),
    ipa: lang ? lang.soundChange.soundChange(word, markStress) : "[ ... ]",
  });
}
