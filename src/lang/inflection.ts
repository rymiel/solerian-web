import { Types, Part, SeparatedRoot } from "./extra";
import { gsub, sub, SubMap } from "./util";

export const FORM_NAMES = {
  [Part.Noun]: [
    "nom_sg",
    "acc_sg",
    "gen_sg",
    "nom_pl",
    "acc_pl",
    "gen_pl",
    // old forms
    "old_nom_sg",
    "old_acc_sg",
    "old_gen_sg",
    "old_nom_pl",
    "old_acc_pl",
    "old_gen_pl",
  ] as const,
  [Part.Verb]: [
    "1_inf",
    "2_inf",
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
    "2sg_imp",
    // old forms
    "old_1_inf",
    "old_2_inf",
    "old_1sg_prs",
    "old_2sg_prs",
    "old_3sg_prs",
    "old_1pl_prs",
    "old_2pl_prs",
    "old_3pl_prs",
    "old_1sg_pst",
    "old_2sg_pst",
    "old_3sg_pst",
    "old_1pl_pst",
    "old_2pl_pst",
    "old_3pl_pst",
    "old_2sg_imp",
  ] as const,
};
export type FormNames<P extends Part> = (typeof FORM_NAMES)[P][number];

type SlotStrings<Tuple extends readonly [...any[]]> = {
  [Index in keyof Tuple]: Tuple[Index] extends string ? string : never;
};
export type Forms = {
  readonly [P in Part]: {
    readonly [T in Types[P]]: SlotStrings<(typeof FORM_NAMES)[P]>;
  };
};

// prettier-ignore
const FORM_SUFFIXES: Forms = {
  [Part.Noun]: {
    "1": ["àt", "en", "i", "àtún", "ent", "is",
          "àt", "en", "is", "àtún", "etin", "iis"],
    "2": ["àd", "ein", "i", "ánd", "end", "is",
          "àd", "ein", "is", "ánd", "etin", "iis"],
    "3": ["ià", "ie", "i", "áin", "ein", "ir",
          "ià", "ie", "ir", "iáin", "iein", "iir"],
    "4": ["àx", "ox", "i", "áxi", "oxe", "ixr",
          "àx", "ox", "ir", "áxi", "oxe", "ixir"],
    "5": ["à", "e", "i", "án", "en", "ir",
          "à", "e", "ir", "áin", "ein", "iir"],
    "6": ["en", "àan", "yr", "etén", "ànt", "yrs",
          "en", "ean", "yr", "enét", "eant", "esyr"],
    "7": ["m", "m", "mi", "mas", "mas", "ǹir",
          "m", "m", "mer", "mas", "mas", "ǹir"],
    "8": ["el", "aln", "il", "iEk", "elk", "ilar",
          "el", "aln", "eler", "eek", "alnek", "elsar"],
    "9": ["r", "ren", "ir", "àr", "rins", "rir",
          "r", "rin", "ràr", "àr", "rinse", "riser"],
  },
  [Part.Verb]: {
    "1": ["élus", "érà", "<à", "eké", "éts", "án", "áig", "áste", "é", "élg", "ésa", "àmó", "ánà", "ánà", "í",
          "élus", "érà", "<à", "eké", "ités", "amét", "anég", "anés", "ét", "ég", "ésa", "ámo", "ánà", "ánà", "í"],
    "2": ["las", "lar", "lý", "laké", "láts", "lánt", "lànég", "láns", "ld", "leg", "lsa", "làmo", "lànà", "lànà", "li",
          "las", "lar", "lý", "laké", "lités", "làté", "lànég", "láns", "ld", "leg", "lsa", "làmo", "lànà", "lànà", "li"],
    "3n": ["lud", "rad", "d", "lék", "la", "deté", "dég", "dés", "lut", "lek", "lusa", "lumà", "lonà", "lonà", "",
           "lud", "rad", "d", "lék", "ld", "deté", "dég", "dés", "lut", "lek", "lusa", "lomà", "lonà", "lonà", ""],
    "3r": ["lud", "ad", "d", "lék", "la", "deté", "dég", "dés", "lut", "lek", "lusa", "lumà", "lonà", "lonà", "",
           "lud", "rad", "d", "lék", "ld", "deté", "dég", "dés", "lut", "lek", "lusa", "lomà", "lonà", "lonà", ""],
    "3": ["lud", "rad", "d", "lék", "ld", "deté", "dég", "dés", "lut", "lek", "lusa", "lumà", "lonà", "lonà", "",
          "lud", "rad", "d", "lék", "ld", "deté", "dég", "dés", "lut", "lek", "lusa", "lomà", "lonà", "lonà", ""],
    "4s": ["s@ú", "s@ár", "sǹý", "sǹék", ">ns", "sǹá@", "sǹál", "sǹást", "s@í", "s@ék", "s@úsa", "s@ámo", "s@ánà", "s@ánà", "@s",
           "s@ú", "s@ár", "sǹý", "sǹék", ">sn", "sǹám", "sǹág", "sǹán", "s@út", "s@úek", "s@úsa", "s@ámo", "s@ánà", "s@ánà", "s@"],
    "4": ["@ú", "@ár", "ǹý", "ǹék", ">n", "ǹá@", "ǹál", "ǹást", "@í", "@ék", "@úsa", "@ámo", "@ánà", "@ánà", "@",
          "@ú", "@ár", "ǹý", "ǹék", ">n", "ǹám", "ǹág", "ǹán", "@út", "@úek", "@úsa", "@ámo", "@ánà", "@ánà", "@"],
    "5t": ["@lus", "@là", "r@", "@lék", "@léts", "@lán", "@láig", "@lást", "@re", "@reg", "@ras", "@làmo", "@lànà", "@lànà", "@lí",
           "@lus", "@là", "@r", "@lék", "@léts", "@lát", "@lág", "@lás", "@ret", "@reg", "@ras", "@làmo", "@lànà", "@lona", "@lí"],
    "5r": ["lus", "là", "", "lék", "léts", "lán", "láig", "lást", "e", "eg", "as", "làmo", "lànà", "lànà", "lí",
           "lus", "là", "r", "lék", "léts", "lát", "lág", "lás", "ret", "reg", "ras", "làmo", "lànà", "lona", "lí"],
    "5": ["lus", "là", "r", "lék", "léts", "lán", "láig", "lást", "re", "reg", "ras", "làmo", "lànà", "lànà", "lí",
          "lus", "là", "r", "lék", "léts", "lát", "lág", "lás", "ret", "reg", "ras", "làmo", "lànà", "lona", "lí"],
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

const applyDestress = (word: string): string => gsub(word, DESTRESS);
const applyStressFirst = (word: string): string => sub(applyDestress(word), APPLY_STRESS);
const reverse = (word: string): string => [...word].reverse().join("");
const applyStressLast = (word: string): string => reverse(applyStressFirst(reverse(word)));
const applyLaxStress = (word: string): string => sub(applyDestress(word), APPLY_LAX_STRESS);
const applyMarkStress = (word: string): string => sub(applyDestress(word), STRESS_MARKERS);

function applyNormalize(word: string): string {
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
  return suffixes.map((suffix) => {
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
  }) as unknown as Forms[P][Types[P]];
}

export function applyFromSeparatedRoot([match, part, type]: SeparatedRoot, markStress = true): string[] {
  const word = match.input;
  const cutoff = match[1].length;
  const root = word.slice(0, -cutoff);
  const suffix = word.slice(-cutoff);
  const special = match[2] || "";
  return applyFrom(root, suffix, special, part, type, markStress) as string[];
}
