import { useData } from "@rymiel/conlang-web-components";

import { scriptMultiUnicode } from "lang/script";

export interface DisplayWord {
  sol: string;
  script: string;
  ipa: string;
}

export function usePopulateDualInfo() {
  const { config: lang } = useData();

  return (word: string, markStress = true) => ({
    sol: word,
    script: scriptMultiUnicode(word),
    ipa: lang.soundChange.soundChange(word, { markStress }),
  });
}
