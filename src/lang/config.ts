import {
  ApiConfig,
  configOrEmpty,
  DEFAULT_GENERATION,
  DEFAULT_KEY_VALUE,
  DEFAULT_SOUND_CHANGE,
  GenerationInstance,
  SoundChangeInstance,
} from "conlang-web-components";

import { PARTS_OF_SPEECH } from "lang/extra";
import { scriptMultiUnicode } from "lang/script";
import { LegacySoundChangeConfig, LegacySoundChangeInstance } from "lang/soundChange";
import { LangConfigData } from "providers/langConfig";

import { applyKnownStress } from "./inflection";

export interface LangConfigFields {}

function languageConfig(config: ApiConfig) {
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
  const script = scriptMultiUnicode;
  const hasScript = true;
  return { soundChange, script, hasScript };
}

export function transformConfig(config: ApiConfig): LangConfigData {
  const generation = new GenerationInstance(configOrEmpty(config.generation, DEFAULT_GENERATION));
  const abbreviations = configOrEmpty(config.abbr, DEFAULT_KEY_VALUE);
  const parts = configOrEmpty(config.parts, PARTS_OF_SPEECH);
  const lang = languageConfig(config);
  const ipa = (sentence: string) => lang.soundChange.soundChangeSentence(sentence);

  return { ...lang, generation, abbreviations, parts, ipa, config };
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
