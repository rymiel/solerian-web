import { applyKnownStress } from "lang/inflection";
import { gsub, GSubMap } from "lang/util";

export type Unromanize = readonly (readonly [string, string])[];
export type Change = readonly [from: string, to: string, leftContext: string | null, rightContext: string | null];
export interface SoundChangeConfig {
  readonly vowel: string;
  readonly stress: string;
  readonly clusters: readonly string[];
  readonly unromanize: {
    readonly pre: Unromanize;
    readonly post: Unromanize;
  };
  readonly changes: readonly Change[];
}

function setAtIndex(str: string, index: number, char: string): string {
  return `${str.slice(0, index)}${char}${str.slice(index + 1)}`;
}

function changeToRegex(change: Change, groups: GSubMap): readonly [RegExp, string] {
  const [from, to, left, right] = change;

  let k = from;
  if (left !== null) {
    k = `(?<=${left})${k}`;
  }
  if (right !== null) {
    k = `${k}(?=${right})`;
  }

  return [new RegExp(gsub(k, groups), "g"), to];
}

export class SoundChangeInstance {
  readonly #config: SoundChangeConfig;
  readonly #changes: GSubMap;
  readonly #syllable: RegExp;
  readonly #vg: RegExp;

  constructor(config: SoundChangeConfig) {
    this.#config = config;
    const vg = `[${config.vowel}]`;
    const cg = `[^${config.vowel}]`;
    const groups: GSubMap = [
      ["{V}", vg],
      ["{C}", cg],
    ];
    this.#changes = config.changes.map((c) => changeToRegex(c, groups));
    this.#syllable = new RegExp(`(${vg}${cg}*?)(?=${cg}?${vg})`, "g");
    this.#vg = new RegExp(vg, "g");
  }

  public ipaWithoutSoundChange(word: string) {
    return gsub(gsub(word, this.#config.unromanize.pre), this.#config.unromanize.post);
  }

  private syllabify(word: string, markStress: boolean): string {
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

  private singleWordSoundChange(word: string, markStress: boolean): string {
    if (markStress) {
      word = applyKnownStress(word);
    }
    word = gsub(word, this.#config.unromanize.pre);
    word = gsub(word, this.#changes);

    return this.syllabify(word, markStress);
  }

  public singleWordSoundChangeSteps(word: string, markStress: boolean): string[] {
    const steps: string[] = [];
    if (markStress) {
      word = applyKnownStress(word);
    }
    word = gsub(word, this.#config.unromanize.pre);

    let last = word;
    steps.push(word);

    for (const [find, replace] of this.#changes) {
      word = word.replaceAll(find, replace);
      if (word !== last) {
        steps.push(word);
      }
      last = word;
    }

    if (word !== last) {
      steps.push(word);
    }

    return steps.map((w) => `[${this.syllabify(w, markStress)}]`);
  }

  public soundChange(word: string, markStress: boolean): string {
    const words = word.split(" ").map((i) => this.singleWordSoundChange(i, markStress));

    return `[${words.join(" ")}]`;
  }

  public soundChangeSentence(sentence: string): string {
    const words = sentence
      .toLowerCase()
      .split(" ")
      .map((i) => {
        if (i.includes("-")) {
          const [prefix, word] = i.split("-");
          return `${this.singleWordSoundChange(prefix, false)}‿${this.singleWordSoundChange(word, true)}`;
        }
        return this.singleWordSoundChange(i, true);
      });

    return `[${words.join(" ")}]`;
  }

  public get config(): SoundChangeConfig {
    return this.#config;
  }
}
