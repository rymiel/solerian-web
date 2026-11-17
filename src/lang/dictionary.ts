import { ApiWord, DerivedFields, LangConfigData } from "@rymiel/conlang-web-components";

import { AnyPattern, determinePattern, markStress, Part, partOfExtra } from "lang/extra";

import { LEGACY_SOUND_CHANGE } from "./config";

declare module "@rymiel/conlang-web-components" {
  interface LangEntryFields {
    phon: string;
    part: Part | null;
    class: AnyPattern | null;
    script: string;
  }
}

export function deriveFields(lang: LangConfigData, word: ApiWord): DerivedFields {
  const part = partOfExtra(word.extra);
  let cls: AnyPattern | null = null;
  if (part !== null) {
    cls = word.ex !== undefined ? "X" : (determinePattern(word.sol, part) ?? "?");
  }
  const script = lang.script(word.sol);
  const phon = "/" + LEGACY_SOUND_CHANGE.unromanize(word.sol) + "/";
  const ipa = lang.soundChange.soundChange(word.sol, { markStress: markStress(word) });
  const disp = word.sol;
  return { part, class: cls, script, ipa, disp, phon };
}
