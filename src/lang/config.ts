import {
  ApiConfig,
  configOrEmpty,
  DEFAULT_KEY_VALUE,
  DEFAULT_SOUND_CHANGE,
  GenerationConfig,
  GenerationInstance,
  SoundChangeInstance,
} from "conlang-web-components";

import { scriptMultiUnicode } from "lang/script";
import { LegacySoundChangeConfig, LegacySoundChangeInstance } from "lang/soundChange";
import { LangConfigData } from "providers/langConfig";

import { applyKnownStress } from "./inflection";

export function transformConfig(config: ApiConfig): LangConfigData {
  const legacySoundChange = new LegacySoundChangeInstance(LEGACY_SOUND_CHANGE_CONFIG);
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
          prefix = legacySoundChange.preUnromanize(prefix);
          rest = legacySoundChange.preUnromanize(rest);
          return `${prefix}‿${rest}`;
        }
        word = applyKnownStress(word);
      }
      return legacySoundChange.preUnromanize(word);
    },
    (word: string, { markStress }) => {
      if (markStress === undefined) {
        if (word.includes("‿")) {
          let [prefix, rest] = word.split("‿");
          prefix = legacySoundChange.syllabify(prefix, false);
          rest = legacySoundChange.syllabify(rest, true);
          return `${prefix}‿${rest}`;
        }
        markStress = true;
      }
      return legacySoundChange.syllabify(word, markStress);
    },
  );
  const generation = new GenerationInstance(config.generation as GenerationConfig);
  const abbreviations = configOrEmpty(config.abbr, DEFAULT_KEY_VALUE);
  const parts = configOrEmpty(config.parts, DEFAULT_KEY_VALUE);
  const ipa = (sentence: string) => soundChange.soundChangeSentence(sentence);
  const script = scriptMultiUnicode;

  return { soundChange, generation, abbreviations, parts, ipa, script, config };
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
