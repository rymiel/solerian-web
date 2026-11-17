import { FullEntry, uri, useData, ValidationCandidate, ValidationFailure } from "conlang-web-components";
import { useMemo } from "react";

import { LEGACY_SOUND_CHANGE } from "lang/config";
import { applyDestress, applyNormalize } from "lang/inflection";
import { useInflEntries } from "lang/inflEntries";

export function validationValue(word: string): string {
  return LEGACY_SOUND_CHANGE.unromanize(word);
}

function isAffix(sol: string): boolean {
  return sol.includes("-");
}

export function useValidationCandidates(): readonly ValidationCandidate[] {
  const { entries } = useData();
  const infl = useInflEntries();
  return useMemo(
    () => [
      ...entries
        .filter((e) => !isAffix(e.sol))
        .map((e) => ({
          key: e.hash,
          label: `"${e.sol}"`,
          value: validationValue(e.sol),
          link: uri`/reverse/${e.sol}`,
          entry: e,
        })),
      ...infl
        .filter((i) => !i.old && !isAffix(i.sol))
        .map((i) => ({
          key: `"${i.original.hash}"-${i.form}`,
          label: `"${i.sol}" (${i.form} of ${i.original.sol})`,
          value: validationValue(i.sol),
          link: uri`/reverse/${i.sol}`,
        })),
    ],
    [entries, infl],
  );
}

function normalizationFailure(entry: FullEntry): string | null {
  if (entry.extra.includes("NAME")) {
    return null; // Skip onomatonyms for now
  }
  const norm = applyNormalize(entry.sol);
  if (entry.extra === "conj." || entry.extra === "postpos.") {
    // TODO(rymiel): special normalization for these words which are allowed to lack stress?
    if (norm.replaceAll("à", "a") === entry.sol) {
      return null; // Allow conjunctions and postpositions to have no full vowels
    }
    if (applyDestress(norm) === entry.sol) {
      return null; // Allow conjunctions and postpositions to not mark stress on the first syllable
    }
  }
  if (norm === entry.sol) {
    return null;
  }

  return "not normalized";
}

const INVALID_CLUSTERS = ["aa", "rr"].map(validationValue);

export function validateLocal(candidates: readonly ValidationCandidate[]): ValidationFailure[] {
  const fail: ValidationFailure[] = [];
  for (const c of candidates) {
    const reason = c.entry && normalizationFailure(c.entry);
    if (reason) {
      fail.push([c, reason]);
    }
  }
  for (const c of candidates) {
    if (INVALID_CLUSTERS.some((cluster) => c.value.includes(cluster))) {
      fail.push([c, "invalid cluster"]);
    }
  }
  return fail;
}
