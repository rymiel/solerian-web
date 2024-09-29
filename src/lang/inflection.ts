import { FullEntry } from "../dictionary";
import { Types, Part, SeparatedRoot, markStress, separateRoot } from "./extra";
import { gsub, sub, SubMap } from "./util";

export const FORM_NAMES = {
  [Part.Noun]: ["nom_sg", "acc_sg", "gen_sg", "nom_pl", "acc_pl", "gen_pl"] as const,
  [Part.Verb]: [
    "inf",
    "ger",
    "1sg_prs",
    "2sg_prs",
    "3sg_prs",
    "1pl_prs",
    "2pl_prs",
    "3pl_prs",
    "1sg_pst",
    "2sg_pst",
    "3sg_pst",
    "1pl_pst",
    "2pl_pst",
    "3pl_pst",
    "imp",
  ] as const,
};
export type FormNames<P extends Part> = (typeof FORM_NAMES)[P][number];

type SlotStrings<Tuple extends readonly [...any[]]> = {
  [Index in keyof Tuple]: Tuple[Index] extends string ? string : never;
};
export type Forms = {
  readonly [P in Part]: {
    readonly [T in Types[P]]: {
      readonly cur: SlotStrings<(typeof FORM_NAMES)[P]>;
      readonly old: SlotStrings<(typeof FORM_NAMES)[P]>;
    };
  };
};
export type GenericForms = { cur: string[]; old: string[] };

// prettier-ignore
const FORM_SUFFIXES: Forms = {
  [Part.Noun]: {
    "1": {cur: ["àt", "en", "i", "àtún", "ent", "is"],
          old: ["àt", "en", "is", "àtún", "etin", "iis"]},
    "2": {cur: ["àd", "ein", "i", "ánd", "end", "is"],
          old: ["àd", "ein", "is", "ánd", "etin", "iis"]},
    "3": {cur: ["ià", "ie", "i", "áin", "ein", "ir"],
          old: ["ià", "ie", "ir", "iáin", "iein", "iir"]},
    "4": {cur: ["àx", "ox", "i", "áxi", "oxe", "ixr"],
          old: ["àx", "ox", "ir", "áxi", "oxe", "ixir"]},
    "5": {cur: ["à", "e", "i", "án", "en", "ir"],
          old: ["à", "e", "ir", "áin", "ein", "iir"]},
    "6": {cur: ["en", "àan", "yr", "etén", "ànt", "yrs"],
          old: ["en", "ean", "yr", "enét", "eant", "esyr"]},
    "7": {cur: ["m", "m", "mi", "mas", "mas", "ǹir"],
          old: ["m", "m", "mer", "mas", "mas", "ǹir"]},
    "8": {cur: ["el", "aln", "il", "iEk", "elk", "ilar"],
          old: ["el", "aln", "eler", "eek", "alnek", "elsar"]},
    "9": {cur: ["r", "ren", "ir", "àr", "rins", "rir"],
          old: ["r", "rin", "ràr", "àr", "rinse", "riser"]},
  },
  [Part.Verb]: {
    "1": {cur: ["élus", "érà", "<à", "eké", "éts", "án", "áig", "áste", "é", "élg", "ésa", "àmó", "ánà", "ánà", "í"],
          old: ["élus", "érà", "<à", "eké", "ités", "amét", "anég", "anés", "ét", "ég", "ésa", "ámo", "ánà", "ánà", "í"]},
    "2": {cur: ["las", "lar", "lý", "laké", "láts", "lánt", "lànég", "láns", "ld", "leg", "lsa", "làmo", "lànà", "lànà", "li"],
          old: ["las", "lar", "lý", "laké", "lités", "làté", "lànég", "láns", "ld", "leg", "lsa", "làmo", "lànà", "lànà", "li"]},
    "2n": {cur: ["las", "lar", "lý", "laké", "láts", "lánt", "lànég", "láns", "d", "leg", "sla", "làmo", "lànà", "lànà", "li"],
           old: ["las", "lar", "lý", "laké", "lités", "làté", "lànég", "láns", "ld", "leg", "lsa", "làmo", "lànà", "lànà", "li"]},
    "3n": {cur: ["lud", "ràd", "d", "lék", "la", "deté", "dég", "dés", "lut", "lek", "lusa", "lumà", "lonà", "lonà", ""],
           old: ["lud", "rad", "d", "lék", "ld", "deté", "dég", "dés", "lut", "lek", "lusa", "lomà", "lonà", "lonà", ""]},
    "3r": {cur: ["lud", "àd", "d", "lék", "la", "deté", "dég", "dés", "lut", "lek", "lusa", "lumà", "lonà", "lonà", ""],
           old: ["lud", "rad", "d", "lék", "ld", "deté", "dég", "dés", "lut", "lek", "lusa", "lomà", "lonà", "lonà", ""]},
    "3": {cur: ["lud", "ràd", "d", "lék", "ld", "deté", "dég", "dés", "lut", "lek", "lusa", "lumà", "lonà", "lonà", ""],
          old: ["lud", "rad", "d", "lék", "ld", "deté", "dég", "dés", "lut", "lek", "lusa", "lomà", "lonà", "lonà", ""]},
    "4s": {cur: ["s@ú", "s@ár", "sǹý", "sǹék", ">ns", "sǹá@", "sǹál", "sǹást", "s@í", "s@ék", "s@úsa", "s@ámo", "s@ánà", "s@ánà", "@s"],
           old: ["s@ú", "s@ár", "sǹý", "sǹék", ">sn", "sǹám", "sǹág", "sǹán", "s@út", "s@úek", "s@úsa", "s@ámo", "s@ánà", "s@ánà", "s@"]},
    "4": {cur: ["@ú", "@ár", "ǹý", "ǹék", ">n", "ǹá@", "ǹál", "ǹást", "@í", "@ék", "@úsa", "@ámo", "@ánà", "@ánà", "@"],
          old: ["@ú", "@ár", "ǹý", "ǹék", ">n", "ǹám", "ǹág", "ǹán", "@út", "@úek", "@úsa", "@ámo", "@ánà", "@ánà", "@"]},
    "5t": {cur: ["@lus", "@là", "r@", "@lék", "@léts", "@lán", "@láig", "@lást", "@re", "@reg", "@ras", "@làmo", "@lànà", "@lànà", "@lí"],
           old: ["@lus", "@là", "@r", "@lék", "@léts", "@lát", "@lág", "@lás", "@ret", "@reg", "@ras", "@làmo", "@lànà", "@lona", "@lí"]},
    "5r": {cur: ["lus", "là", "", "lék", "léts", "lán", "láig", "lást", "e", "eg", "as", "làmo", "lànà", "lànà", "lí"],
           old: ["lus", "là", "r", "lék", "léts", "lát", "lág", "lás", "ret", "reg", "ras", "làmo", "lànà", "lona", "lí"]},
    "5": {cur: ["lus", "là", "r", "lék", "léts", "lán", "láig", "lást", "re", "reg", "ras", "làmo", "lànà", "lànà", "lí"],
          old: ["lus", "là", "r", "lék", "léts", "lát", "lág", "lás", "ret", "reg", "ras", "làmo", "lànà", "lona", "lí"]},
  }
};

const STRESSED = /[áéíóúý]/;
const ANY_VOWEL = /[aeiouyàáéíóúý]/g;
const FULL_VOWEL = /[eiouyàáéíóúý]/g;

const DESTRESS: SubMap = [
  ["á", "à"],
  ["é", "e"],
  ["í", "i"],
  ["ó", "o"],
  ["ú", "u"],
  ["ý", "y"],
];
const APPLY_LAX_STRESS: SubMap = DESTRESS.map(([k, v]) => [v, k]);
const APPLY_STRESS: SubMap = [...APPLY_LAX_STRESS, ["a", "á"]];
const STRESS_MARKERS: SubMap = APPLY_LAX_STRESS.map(([k, v]) => [k.toUpperCase(), v]);

const isStressed = (word: string): boolean => STRESSED.test(word);
const syllableCount = (word: string): number => (word.match(ANY_VOWEL) ?? []).length;
const fullVowelCount = (word: string): number => (word.match(FULL_VOWEL) ?? []).length;

export const applyDestress = (word: string): string => gsub(word, DESTRESS);
const applyStressFirst = (word: string): string => sub(applyDestress(word), APPLY_STRESS);
const reverse = (word: string): string => [...word].reverse().join("");
const applyStressLast = (word: string): string => reverse(applyStressFirst(reverse(word)));
const applyLaxStress = (word: string): string => sub(applyDestress(word), APPLY_LAX_STRESS);
const applyMarkStress = (word: string): string => sub(applyDestress(word), STRESS_MARKERS);

export function applyNormalize(word: string): string {
  if (isStressed(word)) {
    if (syllableCount(word) === 1 || fullVowelCount(word) === 1) {
      return applyDestress(word);
    }
  } else {
    if (fullVowelCount(word) === 0) {
      return applyNormalize(applyStressFirst(word));
    } else if (fullVowelCount(word) > 1) {
      return applyLaxStress(word);
    }
  }

  return word;
}

function applyFrom<P extends Part>(
  baseRoot: string,
  ending: string,
  special: string,
  part: P,
  type: Types[P],
  markStress = true
): Forms[P][Types[P]] {
  const stressSuffix = isStressed(ending) || fullVowelCount(baseRoot) == 0;
  const suffixes = FORM_SUFFIXES[part][type];
  const mapSuffix = (suffix: string): string => {
    const stressFirst = suffix.startsWith("<");
    const stressLast = suffix.startsWith(">");
    const hasStressMarker = STRESS_MARKERS.some(([k, _]) => suffix.includes(k));
    suffix = suffix.replace("<", "").replace(">", "");
    if (suffix.includes("@")) {
      suffix = suffix.replaceAll("@", special);
    }

    let root = baseRoot;
    if (stressFirst) {
      root = applyStressFirst(root);
    } else if (stressLast) {
      root = applyStressLast(root);
    } else if (isStressed(suffix)) {
      root = applyDestress(root);
    } else if (stressSuffix) {
      if (hasStressMarker) {
        suffix = applyMarkStress(suffix);
      } else {
        suffix = applyLaxStress(suffix);
      }
    }

    if (hasStressMarker) {
      suffix = suffix.toLowerCase();
    }

    return markStress ? applyNormalize(root + suffix) : applyDestress(root + suffix);
  };

  return {
    cur: suffixes.cur.map(mapSuffix) as Forms[P][Types[P]]["cur"],
    old: suffixes.old.map(mapSuffix) as Forms[P][Types[P]]["old"],
  } as Forms[P][Types[P]];
}

export function applyFromSeparatedRoot({ match, part, type }: SeparatedRoot, markStress = true): GenericForms {
  const word = match.input;
  const cutoff = match[1].length;
  const root = word.slice(0, -cutoff);
  const suffix = word.slice(-cutoff);
  const special = match[2] || "";
  return applyFrom(root, suffix, special, part, type, markStress) as GenericForms;
}

export function formsFromEntry(entry: FullEntry, part: Part): [forms: GenericForms, stress: boolean] {
  if (entry.part !== part) {
    throw new Error(`Passed entry is not a ${Part[part]}`);
  }
  let forms;
  const stress = markStress(entry);
  if (entry.ex === undefined) {
    const s = separateRoot(entry.sol, part);
    if (s === null) {
      throw new Error(`${Part[part]} failed to separate root`);
    }

    forms = applyFromSeparatedRoot(s, stress);
  } else {
    const ex = entry.ex.split(",");
    forms = {
      cur: ex.slice(0, ex.length / 2),
      old: ex.slice(ex.length / 2),
    };
  }

  return [forms, stress];
}
