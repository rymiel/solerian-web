import { markStress } from "./extra";
import { gsub, gsubBackreference, GSubMap } from "./util";

const VOWEL = "əaeiouyáéíóúýæÆɐ";
const STRESS = "áéíóúýƆÆ";

const V = `[${VOWEL}]`;
const C = `[^${VOWEL}]`;
const Vg = new RegExp(V, "g");

const CHANGES: GSubMap = [
  [`st([eéií])`, "ɕ\\1"],
  [`([^s]?)t([ií])`, "\\1ts\\2"],
  [`t([eéií])`, "ç\\1"],
  [`([kg])y`, "\\1ʲi"],
  [`([kg])ý`, "\\1ʲí"],
  [`ox(${V}|r)`, "a\\1"],
  [`óx(${V}|r)`, "á\\1"],
  [`(${V})x(${V})`, "\\1g\\2"],
  [`^x`, "h"],
  [`[əa][əa]`, "ae"],
  [`[əa]á`, "aé"],
  [`á[əa]`, "áe"],
  [`aj`, "ae"],
  [`ae`, "je"],
  [`áe`, "é"],
  [`àé`, "Æ"],
  [`(${C})e(${V})`, "\\1i\\2"],
  [`ki(${V})`, "ɕ\\1"],
  [`(${V})ea`, "\\1e"],
  [`ry`, "ri"],
  [`rý`, "rí"],
  [`ra`, "ræ"],
  [`rá`, "rÆ"],
  [`(ú|u)u`, "\\1j"],
  [`[əa](${C}*)([iyíý])`, "e\\1\\2"],
  [`á(${C}*)([iyíý])`, "é\\1\\2"],
  [`u(${C}*)([iyíý])`, "y\\1\\2"],
  [`ú(${C}*)([iyíý])`, "ý\\1\\2"],
  [`([^l])g$`, "\\1ŋ"],
  [`uú`, "ujú"],
  [`(ə|a|á)(ə|a|á)`, "\\1j\\2"],
  [`(é|e)(é|e)`, "\\1j\\2"],
  [`(í|i)(í|i)`, "\\1j\\2"],
  [`(ó|o)(ó|o)`, "\\1j\\2"],
  [`(ý|y)(ý|y)`, "\\1j\\2"],
  [`j?i(e|é)`, "j\\1"],
  [`(e|é)i`, "\\1j"],
  [`ld`, "ll"],
  [`(${V}|\\b)d(?=${V})`, "\\1ð"],
  [`[əea]r`, "ɐr"],
  [`x`, ""],
  [`nŋ`, "ŋ"],
].map(([k, v]) => [new RegExp(k, "g"), v]);

const PRE_UNROMANIZE: GSubMap = [
  ["a", "ə"],
  ["à", "a"],
  ["ǹ", "ɲ"],
];

const POST_UNROMANIZE: GSubMap = [
  ["á", "a"],
  ["é", "e"],
  ["í", "i"],
  ["ó", "o"],
  ["ú", "u"],
  ["y", "ɨ"],
  ["ý", "ɨ"],
  ["Æ", "æ"],
  ["ð", "ð̠"],
];

const MAKE_STRESSED: GSubMap = [
  ["a", "á"],
  ["e", "é"],
  ["i", "í"],
  ["o", "ó"],
  ["u", "ú"],
  ["y", "ý"],
];
const makeStressed = (word: string): string => gsub(word, MAKE_STRESSED);
const PRESERVE_CLUSTERS = ["ts", "tɕ", "kʲ"] as const;

function setAtIndex(str: string, index: number, char: string): string {
  return `${str.slice(0, index)}${char}${str.slice(index + 1)}`;
}

function laxStress(word: string): string {
  const vowelCount = (word.match(Vg) ?? []).length;
  const stressIndex = [...word].findIndex((i) => STRESS.includes(i));
  if (stressIndex === -1 && vowelCount > 1) {
    return makeStressed(word);
  } else {
    return word;
  }
}

const SYLLABLE = new RegExp(`([${VOWEL}][^${VOWEL}]*?)(?=[^${VOWEL}]?[${VOWEL}])`, "g");
function syllabify(word: string, markStress: boolean = true): string {
  word = word.replace(SYLLABLE, (_, $1) => `${$1}.`);
  PRESERVE_CLUSTERS.forEach((cluster) => {
    word = word.replaceAll(`${cluster[0]}.${cluster[1]}`, `.${cluster}`);
  });

  const vowelCount = (word.match(Vg) ?? []).length;
  const stressIndex = [...word].findIndex((i) => STRESS.includes(i));
  const stressBoundary = stressIndex ? word.lastIndexOf(".", stressIndex) : -1;

  if (vowelCount <= 1 || !markStress) {
    // pass
  } else if (stressBoundary === -1) {
    word = "\u02c8" + word;
  } else {
    word = setAtIndex(word, stressBoundary, "\u02c8");
  }

  return gsub(word, POST_UNROMANIZE);
}

function ipaWithoutSoundChange(word: string): string {
  return gsub(gsub(word, PRE_UNROMANIZE), POST_UNROMANIZE);
}

function singleWordSoundChange(word: string, markStress: boolean = true): string {
  word = gsub(word, PRE_UNROMANIZE);
  if (markStress) {
    word = laxStress(word);
  }
  word = gsubBackreference(word, CHANGES);

  return syllabify(word, markStress);
}

export interface MinimalWord {
  sol: string;
  extra: string;
}

export function soundChange(word: MinimalWord): string {
  const words = word.sol.split(" ").map((i) => singleWordSoundChange(i, markStress(word)));

  return `[${words.join(" ")}]`;
}
