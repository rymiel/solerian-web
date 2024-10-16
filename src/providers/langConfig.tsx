import { createContext, PropsWithChildren, useEffect, useState } from "react";

import { SoundChangeConfig, SoundChangeInstance } from "lang/soundChange";

interface LangConfigData {
  soundChange: SoundChangeInstance | null;
}

export const LangConfig = createContext<LangConfigData>({
  soundChange: null,
});

export function LangConfigProvider({ children }: PropsWithChildren) {
  const [soundChange, setSoundChange] = useState<SoundChangeInstance | null>(null);

  // TODO: actual api

  useEffect(() => {
    setSoundChange(new SoundChangeInstance(CONFIG));
  }, []);

  return <LangConfig.Provider value={{ soundChange }}>{children}</LangConfig.Provider>;
}

const CONFIG: SoundChangeConfig = {
  vowel: "əaeiouyáéíóúýæÆɐ",
  stress: "áéíóúýƆÆ",
  unromanize: {
    pre: [
      ["a", "ə"],
      ["à", "a"],
      ["ǹ", "ɲ"],
    ],
    post: [
      ["á", "a"],
      ["é", "e"],
      ["í", "i"],
      ["ó", "o"],
      ["ú", "u"],
      ["y", "ɨ"],
      ["ý", "ɨ"],
      ["Æ", "æ"],
      ["ð", "ð̠"],
    ],
  },
  clusters: ["ts", "tɕ", "kʲ"],
  changes: [
    ["st", "ɕ", null, "[eéií]"],
    ["t", "ts", "[^s]|\\b", "[ií]"],
    ["y", "ʲi", "[kg]", null],
    ["ý", "ʲí", "[kg]", null],
    ["ox", "a", null, "{V}|r"],
    ["óx", "á", null, "{V}|r"],
    ["x", "", "x{V}", "{V}"],
    ["x", "g", "{V}", "{V}"],
    ["x", "j", "[eéií]", "{C}"],
    ["x", "k", null, "s"],
    ["^x", "h", null, null],
    ["[əa][əa]", "ae", null, null],
    ["[əa]á", "aé", null, null],
    ["á[əa]", "áe", null, null],
    ["aj", "ae", null, null],
    ["ae", "je", null, null],
    ["áe", "é", null, null],
    ["àé", "Æ", null, null],
    ["eá", "já", null, null],
    ["e", "i", "{C}", "{V}"],
    ["ki", "ɕ", null, "{V}"],
    ["ea", "e", "{V}", null],
    ["ry", "ri", null, null],
    ["rý", "rí", null, null],
    ["ra", "ræ", null, null],
    ["rá", "rÆ", null, null],
    ["u", "j", "ú|u", null],
    ["[əa]", "e", null, "{C}*[iyíý]"],
    ["á", "é", null, "{C}*[iyíý]"],
    ["u", "y", null, "{C}*[iyíý]"],
    ["ú", "ý", null, "{C}*[iyíý]"],
    ["g$", "ŋ", "[^l]", null],
    ["uú", "ujú", null, null],
    ["", "j", "ə|a|á", "ə|a|á"],
    ["", "j", "é|e", "é|e"],
    ["", "j", "í|i", "í|i"],
    ["", "j", "ó|o", "ó|o"],
    ["", "j", "ý|y", "ý|y"],
    ["j?i", "j", null, "e|é"],
    ["i", "j", "e|é", null],
    ["ij", "e", null, "{C}"],
    ["íj", "é", null, "{C}"],
    ["jj", "ijj", null, null],
    ["ɕj", "ɕ", null, null],
    ["ld", "ll", null, null],
    ["d", "ð", "{V}|\\b", "{V}"],
    ["[əea]r", "ɐr", null, null],
    ["x", "", null, null],
    ["nŋ", "ŋ", null, null],
  ],
};
