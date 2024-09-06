import { gsub, GSubMap } from "./util";

const LETTERSX: Readonly<(string | null)[]> = [
  "s",
  "m",
  "n",
  "ǹ",
  "r",
  "l",
  "t",
  "d",
  "k",
  "g",
  "f",
  "p",
  "j",
  "x",
  null,
  null,
  "a",
  "e",
  "i",
  "o",
  "à",
  "u",
  "y",
] as const;

class LetterContext {
  private num: number;
  constructor(letter: number) {
    this.num = letter << 4;
  }

  vowel(): boolean {
    return this.num >> 4 >= 0x10;
  }

  final() {
    this.num |= 0x1;
  }

  initial() {
    this.num |= 0x2;
  }

  withA() {
    this.num |= 0x4;
  }

  stress() {
    this.num |= 0x8;
  }

  codepoint(): number {
    return 0xe000 + this.num;
  }
}

const TO_SUFFIXED: GSubMap = [
  [/á/g, "à'"],
  [/é/g, "e'"],
  [/í/g, "i'"],
  [/ó/g, "o'"],
  [/ú/g, "u'"],
  [/ý/g, "y'"],
] as const;
const toSuffixed = (s: string): string => gsub(s, TO_SUFFIXED);

export function scriptUnicode(text: string): string {
  const res: LetterContext[] = [];
  let flag = false; // detaching flag

  for (const c of text) {
    const first = res.length === 0;
    if (c === "a" && first) {
      // Initial 'a' has a special form
      res.push(new LetterContext(0x10));
    } else if (c === "a") {
      // Attach 'a' diacritic
      res[res.length - 1].withA();
    } else if (c === "'" && !first && res[res.length - 1].vowel()) {
      // stress vowels
      res[res.length - 1].stress();
    } else {
      const letter = LETTERSX.indexOf(c);
      if (letter === -1) {
        continue; // skip nonexistent letters
      }

      if (c === "m" && !first) {
        // detach last letter
        res[res.length - 1].final();
      }

      // detach this letter if flagged
      res.push(new LetterContext(letter));
      if (flag) {
        res[res.length - 1].initial();
      }

      // letters which will detach next letter (flag)
      flag = c === "à" || c === "m";
    }
  }

  if (res.length === 0) {
    return "";
  }

  res[0].initial();
  res[res.length - 1].final();

  return String.fromCodePoint(0x202e, ...res.map((i) => i.codepoint()));
}

export function scriptMultiUnicode(words: string): string {
  words = words.trim();
  if (words.length === 0) {
    return "";
  }

  let buffer = "";
  words.split(" ").forEach((w) => {
    buffer += scriptUnicode(toSuffixed(w)) + " ";
  });
  return buffer.trim();
}
