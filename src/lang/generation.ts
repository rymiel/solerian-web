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

export class GenerationInstance {
  readonly #config: GenerationConfig;

  constructor(config: GenerationConfig) {
    this.#config = config;
  }

  public generateWord(syllables = 1): string {
    let word = "";
    for (let i = 0; i < syllables; i++) {
      const onset = resolve(this.#config.onset, this.#config.groups);
      const nucleus = resolve(this.#config.nucleus, this.#config.groups);
      const coda = resolve(this.#config.coda, this.#config.groups);
      word += `${onset}${nucleus}${coda}`;
    }

    return word;
  }
}
