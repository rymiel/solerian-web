import { useContext } from "react";
import { LangConfig } from "../providers/langConfig";
import { scriptMultiUnicode } from "./script";

export interface DisplayWord {
  sol: string;
  script: string;
  ipa: string;
}

export function usePopulateDualInfo() {
  const { soundChange } = useContext(LangConfig);

  return (word: string, markStress = true) => ({
    sol: word,
    script: scriptMultiUnicode(word),
    ipa: soundChange ? soundChange.soundChange(word, markStress) : "[ ... ]",
  });
}
