type WeightedChoices = readonly (readonly [string, number])[];
type Weighted = string | string[] | WeightedChoices;
type Groups = Readonly<Record<string, Weighted>>;

function equalChoiceRandom(s: string | string[]): string {
  return s[Math.floor(s.length * Math.random())];
}

function arrayIsEqualWeight(w: Weighted): w is string[] {
  return typeof w[0] === "string";
}

function weightedRandom(choices: Weighted): string {
  if (typeof choices === "string" || arrayIsEqualWeight(choices)) {
    return equalChoiceRandom(choices);
  }

  let i;
  const weights = [choices[0][1]];

  for (i = 1; i < choices.length; i++) {
    weights[i] = choices[i][1] + weights[i - 1];
  }

  const random = Math.random() * weights[weights.length - 1];

  for (i = 0; i < weights.length; i++) {
    if (weights[i] > random) {
      break;
    }
  }

  return choices[i][0];
}

export interface GenerationConfig {
  onset: Weighted;
  nucleus: Weighted;
  coda: Weighted;
  groups: Groups;
}

function resolve(w: Weighted, g: Groups): string {
  return [...weightedRandom(w)].map((c) => (g[c] === undefined ? c : resolve(g[c], g))).join("");
}

export function generateWord(config: GenerationConfig, syllables = 1): string {
  let word = "";
  for (let i = 0; i < syllables; i++) {
    const onset = resolve(config.onset, config.groups);
    const nucleus = resolve(config.nucleus, config.groups);
    const coda = resolve(config.coda, config.groups);
    word += `${onset}${nucleus}${coda}`;
  }

  return word;
}

export const GEN_INSTANCE: GenerationConfig = {
  onset: [
    ["sk", 1],
    ["", 3],
    ["C", 10],
    ["PS", 1],
  ],
  nucleus: [
    ["e", 4],
    ["a", 4],
    ["i", 3],
    ["à", 3],
    ["o", 2],
    ["u", 2],
    ["y", 2],
  ],
  coda: [
    ["", 20],
    ["C", 60],
    ["sP", 3],
    ["Ps", 1],
    ["Ns", 2],
    ["NP", 4],
    ["Ls", 2],
    ["LP", 4],
    ["LN", 4],
    ["xs", 1],
    ["xL", 4],
  ],
  groups: {
    C: [
      ["t", 12],
      ["s", 12],
      ["n", 12],
      ["r", 10],
      ["l", 10],
      ["m", 8],
      ["k", 8],
      ["d", 8],
      ["x", 5],
      ["f", 5],
      ["j", 3],
      ["st", 3],
      ["g", 2],
      ["ǹ", 1],
    ],
    P: "tdkg",
    L: "lr",
    N: "nm",
    S: "lrs",
  },
};
