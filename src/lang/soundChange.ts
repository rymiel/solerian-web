import { applyKnownStress } from "./inflection";
import { gsub, GSubMap } from "./util";

const VOWEL = "əaeiouyáéíóúýæÆɐ";
const STRESS = "áéíóúýƆÆ";

const V = `[${VOWEL}]`;
const C = `[^${VOWEL}]`;
const Vg = new RegExp(V, "g");

const CHANGES: GSubMap = [
  [`st(?=[eéií])`, "ɕ"],
  [`(?<=[^s]?)t(?=[ií])`, "ts"],
  [`t(?=[eéií])`, "ç"],
  [`(?<=[kg])y`, "ʲi"],
  [`(?<=[kg])ý`, "ʲí"],
  [`ox(?=${V}|r)`, "a"],
  [`óx(?=${V}|r)`, "á"],
  [`(?<=x${V})x(?=${V})`, ""],
  [`(?<=${V})x(?=${V})`, "g"],
  [`^x`, "h"],
  [`[əa][əa]`, "ae"],
  [`[əa]á`, "aé"],
  [`á[əa]`, "áe"],
  [`aj`, "ae"],
  [`ae`, "je"],
  [`áe`, "é"],
  [`àé`, "Æ"],
  [`(?<=${C})e(?=${V})`, "i"],
  [`ki(?=${V})`, "ɕ"],
  [`(?<=${V})ea`, "e"],
  [`ry`, "ri"],
  [`rý`, "rí"],
  [`ra`, "ræ"],
  [`rá`, "rÆ"],
  [`(?<=ú|u)u`, "j"],
  [`[əa](?=${C}*[iyíý])`, "e"],
  [`á(?=${C}*[iyíý])`, "é"],
  [`u(?=${C}*[iyíý])`, "y"],
  [`ú(?=${C}*[iyíý])`, "ý"],
  [`(?<=[^l])g$`, "ŋ"],
  [`uú`, "ujú"],
  [`(?<=ə|a|á)(?=ə|a|á)`, "j"],
  [`(?<=é|e)(?=é|e)`, "j"],
  [`(?<=í|i)(?=í|i)`, "j"],
  [`(?<=ó|o)(?=ó|o)`, "j"],
  [`(?<=ý|y)(?=ý|y)`, "j"],
  [`j?i(?=e|é)`, "j"],
  [`(?<=e|é)i`, "j"],
  [`ɕj`, "ɕ"],
  [`ld`, "ll"],
  [`(?<=${V}|\\b)d(?=${V})`, "ð"],
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

const PRESERVE_CLUSTERS = ["ts", "tɕ", "kʲ"] as const;
const SYLLABLE = new RegExp(`(${V}${C}*?)(?=${C}?${V})`, "g");

function setAtIndex(str: string, index: number, char: string): string {
  return `${str.slice(0, index)}${char}${str.slice(index + 1)}`;
}

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

export function ipaWithoutSoundChange(word: string): string {
  return gsub(gsub(word, PRE_UNROMANIZE), POST_UNROMANIZE);
}

function singleWordSoundChange(word: string, markStress: boolean = true): string {
  if (markStress) {
    word = applyKnownStress(word);
  }
  word = gsub(word, PRE_UNROMANIZE);
  word = gsub(word, CHANGES);

  return syllabify(word, markStress);
}

export function soundChange(word: string, markStress: boolean): string {
  const words = word.split(" ").map((i) => singleWordSoundChange(i, markStress));

  return `[${words.join(" ")}]`;
}

export function soundChangeSentence(sentence: string): string {
  const words = sentence
    .toLowerCase()
    .split(" ")
    .flatMap((i) => {
      if (i.includes("-")) {
        const [prefix, word] = i.split("-");
        return [singleWordSoundChange(prefix, false), singleWordSoundChange(word, true)];
      }
      return singleWordSoundChange(i, true);
    });

  return `[${words.join(" ")}]`;
}
