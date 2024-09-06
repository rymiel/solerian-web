import { RawEntry } from "../api";

export enum Part {
  Noun,
  Verb,
  // Pronoun
}

const SUFFIXES = {
  [Part.Noun]: [
    [/([áà]t)$/, "1"],
    [/([áà]d)$/, "2"],
    [/([ií]à)$/, "3"],
    [/([áà]x)$/, "4"],
    [/([áà])$/, "5"],
    [/([eé]n)$/, "6"],
    [/(m)$/, "7"],
    [/([eé]l)$/, "8"],
    [/(r)$/, "9"],
  ],
  [Part.Verb]: [
    [/(élus)$/, "1"],
    [/[aeiouyàáéíóúý](las)$/, "2"],
    [/[nm](lud)$/, "3n"],
    [/[r](lud)$/, "3r"],
    [/(lud)$/, "3"],
    [/(s(n|m)[úu])$/, "4s"],
    [/((n|m)[úu])$/, "4"],
    [/((t|n|m)lus)$/, "5t"],
    [/r(lus)$/, "5r"],
    [/(lus)$/, "5"],
  ],
} as const;
export type Types = { [P in Part]: (typeof SUFFIXES)[P][number][1] };

export function partOfExtra(extra: string): Part | null {
  if (extra.startsWith("N")) {
    return Part.Noun;
  } else if (extra.startsWith("V")) {
    return Part.Verb;
  } else {
    return null;
  }
}

export function determineType(word: string, part: Part): Types[Part] | null {
  const types = SUFFIXES[part];
  for (const [suffix, t] of types) {
    if (suffix.test(word)) {
      return t;
    }
  }
  return null;
}

export type SeparatedRoot = [result: RegExpExecArray, type: Types[Part]]
export function separateRoot(word: string, part: Part): SeparatedRoot | null {
  const classes = SUFFIXES[part];
  for (const [suffix, t] of classes) {
    const match = suffix.exec(word);
    if (match != null) {
      return [match, t];
    }
  }
  return null;
}

const compare = (a: string, b: string): number => (((a as any) > b) as any) - (((a as any) < b) as any);

export const defaultEntrySort = (a: RawEntry, b: RawEntry): number => {
  const f = compare(a.extra, b.extra);
  if (f === 0) return compare(a.eng, b.eng);
  else return f;
};
