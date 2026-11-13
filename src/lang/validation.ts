import { useContext } from "react";

import { ValidationCandidate, ValidationFailure } from "common/types";
import { Dictionary, FullEntry } from "providers/dictionary";

import { applyDestress, applyNormalize } from "./inflection";
import { useInflEntries } from "./inflEntries";

export function useValidationCandidates(): readonly ValidationCandidate[] | null {
  const { entries } = useContext(Dictionary);
  const infl = useInflEntries();
  if (entries === null || infl === null) return null;
  return [
    ...entries.map((e) => ({ key: e.hash, sol: e.sol, label: `"${e.sol}"`, entry: e })),
    ...infl
      .filter((i) => i.old === false)
      .map((i) => ({
        key: `"${i.original.hash}"-${i.form}`,
        sol: i.sol,
        label: `"${i.sol}" (${i.form} of ${i.original.sol})`,
      })),
  ];
}

function normalizationFailure(entry: FullEntry): string | null {
  if (entry.extra.includes("NAME")) {
    return null; // Skip onomatonyms for now
  }
  if (entry.sol.includes("-")) {
    return null; // Skip affixes for now
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

export function validateLocal(candidates: readonly ValidationCandidate[]): ValidationFailure[] {
  const fail: ValidationFailure[] = [];
  for (const c of candidates) {
    const reason = c.entry && normalizationFailure(c.entry);
    if (reason) {
      fail.push([c, reason]);
    }
  }
  for (const c of candidates) {
    if (c.sol.includes("aa") || c.sol.includes("rr")) {
      fail.push([c, "invalid cluster"]);
    }
  }
  return fail;
}
