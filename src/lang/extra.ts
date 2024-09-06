import { RawEntry } from "../api";

enum Part {
  Noun,
  Verb,
  // Pronoun
}

type Suffixes = { [P in Part]: readonly (readonly [RegExp, string])[] };
const SUFFIXES: Suffixes = {
  [Part.Noun]: [
    [/[áà]t$/, "1"],
    [/[áà]d$/, "2"],
    [/[ií]à$/, "3"],
    [/[áà]x$/, "4"],
    [/[áà]$/, "5"],
    [/[eé]n$/, "6"],
    [/m$/, "7"],
    [/[eé]l$/, "8"],
    [/r$/, "9"],
  ],
  [Part.Verb]: [
    [/élus$/, "1"],
    [/[aeiouyàáéíóúý]las$/, "2"],
    [/[nm]lud$/, "3n"],
    [/[r]lud$/, "3r"],
    [/lud$/, "3"],
    [/s[nm][úu]$/, "4s"],
    [/[nm][úu]$/, "4"],
    [/[tnm]lus$/, "5t"],
    [/rlus$/, "5r"],
    [/lus$/, "5"],
  ],
} as const;

export function partOfExtra(extra: string): Part | null {
  if (extra.startsWith("N")) {
    return Part.Noun;
  } else if (extra.startsWith("V")) {
    return Part.Verb;
  } else {
    return null;
  }
}

export function determineClass(word: string, part: Part): string | null {
  const classes = SUFFIXES[part];
  for (const [suffix, c] of classes) {
    if (suffix.test(word)) {
      return c;
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
