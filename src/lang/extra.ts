export enum Part {
  Noun,
  Verb,
  Pronoun,
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
    [/[n](las)$/, "2n"],
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
  [Part.Pronoun]: [],
} as const;
export type Types = { readonly [P in Part]: (typeof SUFFIXES)[P][number][1] };

type PatternNames = readonly [cur: string, old: string, quant: string];
type PatternNameTable = {
  readonly [P in Part]: { readonly [T in Types[P]]: PatternNames };
};
const PATTERN_NAME_TABLE: PatternNameTable = {
  [Part.Noun]: {
    "1": ["1", "F1t", "Formerly feminine"],
    "2": ["2", "F1d", "Formerly feminine"],
    "3": ["3", "F2i", "Formerly feminine"],
    "4": ["4", "F2x", "Formerly feminine"],
    "5": ["5", "F2", "Formerly feminine"],
    "6": ["6", "M1", "Formerly masculine"],
    "7": ["7", "M2", "Formerly masculine"],
    "8": ["8", "N1", "Formerly neuter"],
    "9": ["9", "N2", "Formerly neuter"],
  },
  [Part.Verb]: {
    "1": ["1", "I", "Intransitive continuous"],
    "2": ["2", "II", "Transformation"],
    "2n": ["2", "II", "Transformation"],
    "3": ["3", "III", "One-time action"],
    "3n": ["3n", "III", "One-time action"],
    "3r": ["3r", "III", "One-time action"],
    "4": ["4", "IV", "Adjective"],
    "4s": ["4s", "IV", "Adjective"],
    "5": ["5", "0", "Transitive continuous"],
    "5r": ["5r", "0", "Transitive continuous"],
    "5t": ["5t", "0", "Transitive continuous"],
  },
  [Part.Pronoun]: {},
};

export function patternNames(word: string, part: Part): PatternNames | null {
  const f = <P extends Part>(p: P) => {
    const t = determineType(word, p);
    return t === null ? null : PATTERN_NAME_TABLE[p][t];
  };

  // prettier-ignore
  switch (part) {
    case Part.Noun: return f(part);
    case Part.Verb: return f(part);
    case Part.Pronoun: return f(part);
  }
}

export function patternDescriptors(word: string, part: Part): PatternNames | null {
  const names = patternNames(word, part);
  if (names === null) return null;

  return [
    `Pattern ${names[0]} ${Part[part].toLowerCase()}`,
    `Old class ${names[1]} ${Part[part].toLowerCase()}`,
    `${names[2]}`,
  ];
}

export function partOfExtra(extra: string): Part | null {
  if (extra.startsWith("N")) {
    return Part.Noun;
  } else if (extra.startsWith("V")) {
    return Part.Verb;
  } else if (extra === "pron.") {
    return Part.Pronoun;
  } else {
    return null;
  }
}

export function determineType<P extends Part>(word: string, part: P): Types[P] | null;
export function determineType(word: string, part: Part): Types[Part] | null {
  const types = SUFFIXES[part];
  for (const [suffix, t] of types) {
    if (suffix.test(word)) {
      return t;
    }
  }
  return null;
}

export type SeparatedRoot = { match: RegExpExecArray; part: Part; type: Types[Part] };
export function separateRoot(word: string, part: Part): SeparatedRoot | null {
  const classes = SUFFIXES[part];
  for (const [suffix, type] of classes) {
    const match = suffix.exec(word);
    if (match != null) {
      return { match, part, type };
    }
  }
  return null;
}

export function markStress(word: { extra: string } | { original: { extra: string } }): boolean {
  const extra = "extra" in word ? word.extra : word.original.extra;
  return !extra.startsWith("NAME");
}

export const PARTS_OF_SPEECH: Readonly<Record<string, string>> = {
  N: "Noun (pattern %)",
  "N+NAME": "Name and onomatonym (pattern %)",
  NAME: "Onomatonym (pattern %)",
  V: "Verb (pattern %)",
  "adv.": "Adverb",
  affix: "Affix",
  "conj.": "Conjunction",
  phrase: "Phrase",
  "postpos.": "Postposition",
  "pron.": "Pronoun (pattern %)",
  particle: "Particle",
};
