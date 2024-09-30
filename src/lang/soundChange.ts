import { applyKnownStress } from "./inflection";
import { gsub, GSubMap } from "./util";

type Unromanize = readonly (readonly [string, string])[];
type Change = readonly [from: string, to: string];
interface SoundChangeConfig {
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

class SoundChangeInstance {
  readonly #config: SoundChangeConfig;
  readonly #changes: GSubMap;
  readonly #syllable: RegExp;
  readonly #vg: RegExp;

  constructor(config: SoundChangeConfig) {
    this.#config = config;
    const vg = `[${config.vowel}]`;
    const cg = `[^${config.vowel}]`;
    this.#changes = config.changes.map(
      ([k, v]) =>
        [
          new RegExp(
            gsub(k, [
              ["{V}", vg],
              ["{C}", cg],
            ]),
            "g"
          ),
          v,
        ] as const
    );
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
      .flatMap((i) => {
        if (i.includes("-")) {
          const [prefix, word] = i.split("-");
          return [this.singleWordSoundChange(prefix, false), this.singleWordSoundChange(word, true)];
        }
        return this.singleWordSoundChange(i, true);
      });

    return `[${words.join(" ")}]`;
  }
}

const CONFIG: SoundChangeConfig = {
  vowel: "əaeiouyáéíóúýæÆɐ",
  stress: "áéíóúýƆÆ",
  unromanize: {
    pre: [
      ["a", "ə"],
      ["à", "a"],
      ["ǹ", "ɲ"],
    ],
    post: [
      ["á", "a"],
      ["é", "e"],
      ["í", "i"],
      ["ó", "o"],
      ["ú", "u"],
      ["y", "ɨ"],
      ["ý", "ɨ"],
      ["Æ", "æ"],
      ["ð", "ð̠"],
    ],
  },
  clusters: ["ts", "tɕ", "kʲ"],
  changes: [
    [`st(?=[eéií])`, "ɕ"],
    [`(?<=[^s]?)t(?=[ií])`, "ts"],
    [`t(?=[eéií])`, "ç"],
    [`(?<=[kg])y`, "ʲi"],
    [`(?<=[kg])ý`, "ʲí"],
    [`ox(?={V}|r)`, "a"],
    [`óx(?={V}|r)`, "á"],
    [`(?<=x{V})x(?={V})`, ""],
    [`(?<={V})x(?={V})`, "g"],
    [`^x`, "h"],
    [`[əa][əa]`, "ae"],
    [`[əa]á`, "aé"],
    [`á[əa]`, "áe"],
    [`aj`, "ae"],
    [`ae`, "je"],
    [`áe`, "é"],
    [`àé`, "Æ"],
    [`(?<={C})e(?={V})`, "i"],
    [`ki(?={V})`, "ɕ"],
    [`(?<={V})ea`, "e"],
    [`ry`, "ri"],
    [`rý`, "rí"],
    [`ra`, "ræ"],
    [`rá`, "rÆ"],
    [`(?<=ú|u)u`, "j"],
    [`[əa](?={C}*[iyíý])`, "e"],
    [`á(?={C}*[iyíý])`, "é"],
    [`u(?={C}*[iyíý])`, "y"],
    [`ú(?={C}*[iyíý])`, "ý"],
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
    [`(?<={V}|\\b)d(?={V})`, "ð"],
    [`[əea]r`, "ɐr"],
    [`x`, ""],
    [`nŋ`, "ŋ"],
  ],
};

const INSTANCE = new SoundChangeInstance(CONFIG);

export function ipaWithoutSoundChange(word: string): string {
  return INSTANCE.ipaWithoutSoundChange(word);
}

export function soundChange(word: string, markStress: boolean): string {
  return INSTANCE.soundChange(word, markStress);
}

export function singleWordSoundChangeSteps(word: string, markStress: boolean): string[] {
  return INSTANCE.singleWordSoundChangeSteps(word, markStress);
}

export function soundChangeSentence(sentence: string): string {
  return INSTANCE.soundChangeSentence(sentence);
}
