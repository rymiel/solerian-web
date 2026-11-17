import {
  ApiConfig,
  configOrEmpty,
  DEFAULT_SOUND_CHANGE,
  LanguageConfig,
  SoundChangeInstance,
} from "@rymiel/conlang-web-components";

import { scriptMultiUnicode } from "lang/script";
import { LegacySoundChangeConfig, LegacySoundChangeInstance } from "lang/soundChange";

import { applyKnownStress } from "./inflection";

export function languageConfig(config: ApiConfig): LanguageConfig {
  const soundChange = new SoundChangeInstance(
    configOrEmpty(config.sound_change, DEFAULT_SOUND_CHANGE),
    (word: string, { markStress }) => {
      word = word.toLowerCase();
      if (markStress) {
        word = applyKnownStress(word);
      } else if (markStress === undefined) {
        if (word.includes("-")) {
          let [prefix, rest] = word.split("-");
          rest = applyKnownStress(rest);
          prefix = LEGACY_SOUND_CHANGE.preUnromanize(prefix);
          rest = LEGACY_SOUND_CHANGE.preUnromanize(rest);
          return `${prefix}‿${rest}`;
        }
        word = applyKnownStress(word);
      }
      return LEGACY_SOUND_CHANGE.preUnromanize(word);
    },
    (word: string, { markStress }) => {
      if (markStress === undefined) {
        if (word.includes("‿")) {
          let [prefix, rest] = word.split("‿");
          prefix = LEGACY_SOUND_CHANGE.syllabify(prefix, false);
          rest = LEGACY_SOUND_CHANGE.syllabify(rest, true);
          return `${prefix}‿${rest}`;
        }
        markStress = true;
      }
      return LEGACY_SOUND_CHANGE.syllabify(word, markStress);
    },
  );
  const script = scriptMultiUnicode;
  const hasScript = true;
  return { soundChange, script, hasScript };
}

const LEGACY_SOUND_CHANGE_CONFIG: LegacySoundChangeConfig = {
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
};

export const LEGACY_SOUND_CHANGE = new LegacySoundChangeInstance(LEGACY_SOUND_CHANGE_CONFIG);
