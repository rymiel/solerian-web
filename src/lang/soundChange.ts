import { gsub } from "conlang-web-components";

export type Unromanize = readonly (readonly [string, string])[];
export type Change = readonly [from: string, to: string, leftContext: string | null, rightContext: string | null];
export interface LegacySoundChangeConfig {
  readonly vowel: string;
  readonly stress: string;
  readonly clusters: readonly string[];
  readonly unromanize: {
    readonly pre: Unromanize;
    readonly post: Unromanize;
  };
}

function setAtIndex(str: string, index: number, char: string): string {
  return `${str.slice(0, index)}${char}${str.slice(index + 1)}`;
}

export class LegacySoundChangeInstance {
  readonly #config: LegacySoundChangeConfig;
  readonly #syllable: RegExp;
  readonly #vg: RegExp;

  constructor(config: LegacySoundChangeConfig) {
    this.#config = config;
    const vg = `[${config.vowel}]`;
    const cg = `[^${config.vowel}]`;
    this.#syllable = new RegExp(`(${vg}${cg}*?)(?=${cg}?${vg})`, "g");
    this.#vg = new RegExp(vg, "g");
  }

  public syllabify(word: string, markStress: boolean): string {
    word = word.replace(this.#syllable, (_, $1) => `${$1}.`);
    this.#config.clusters.forEach((cluster) => {
      word = word.replaceAll(`${cluster[0]}.${cluster[1]}`, `.${cluster}`);
    });

    const vowelCount = (word.match(this.#vg) ?? []).length;
    const stressIndex = [...word].findIndex((i) => this.#config.stress.includes(i));
    const stressBoundary = stressIndex ? word.lastIndexOf(".", stressIndex) : -1;

    if (vowelCount <= 1 || !markStress) {
      // pass
    } else if (stressBoundary === -1) {
      word = "\u02c8" + word;
    } else {
      word = setAtIndex(word, stressBoundary, "\u02c8");
    }

    return gsub(word, this.#config.unromanize.post);
  }

  public preUnromanize(word: string): string {
    return gsub(word, this.#config.unromanize.pre);
  }

  public get config(): LegacySoundChangeConfig {
    return this.#config;
  }
}
