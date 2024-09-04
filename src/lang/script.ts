const LETTERS: Readonly<Record<string, number>> = {
  s: 0x00,
  m: 0x01,
  n: 0x02,
  ǹ: 0x03,
  r: 0x04,
  l: 0x05,
  t: 0x06,
  d: 0x07,
  k: 0x08,
  g: 0x09,
  f: 0x0a,
  p: 0x0b,
  j: 0x0c,
  x: 0x0d,
  e: 0x11,
  i: 0x12,
  o: 0x13,
  à: 0x14,
  u: 0x15,
  y: 0x16,
} as const;

class LetterContext {
  letter: number;
  form: number;
  constructor(letter: number, form: number) {
    this.letter = letter;
    this.form = form;
  }

  final(): LetterContext {
    this.form |= 0x1;
    return this;
  }

  initial(): LetterContext {
    this.form |= 0x2;
    return this;
  }

  withA(): LetterContext {
    this.form |= 0x4;
    return this;
  }

  stress(): LetterContext {
    this.form |= 0x8;
    return this;
  }
}

function toSuffixed(s: string): string {
  (
    [
      [/á/g, "à'"],
      [/é/g, "e'"],
      [/í/g, "i'"],
      [/ó/g, "o'"],
      [/ú/g, "u'"],
      [/ý/g, "y'"],
    ] as const
  ).forEach(([k, v]) => {
    s = s.replace(k, v);
  });
  return s;
}

export function scriptHTML(text: string): string {
  const res: LetterContext[] = [];
  let flag = false; // detaching flag

  for (const c of text) {
    const first = res.length === 0;
    if (c === "a" && first) {
      // Initial 'a' has a special form
      res.push(new LetterContext(0x10, 0));
    } else if (c === "a") {
      // Attach 'a' diacrtici
      res[res.length - 1] = res[res.length - 1].withA();
    } else if (c === "'" && !first && res[res.length - 1].letter >= 0x10) {
      // stress vowels
      res[res.length - 1] = res[res.length - 1].stress();
    } else {
      const letter = LETTERS[c];
      if (letter === undefined) {
        continue; // skip nonexistent letters
      }

      if (c === "m" && !first) {
        // detach last letter
        res[res.length - 1] = res[res.length - 1].final();
      }

      // detach this letter if flagged
      res.push(new LetterContext(letter, flag ? 2 : 0));

      // letters which will detach next letter (flag)
      flag = c === "à" || c === "m";
    }
  }

  if (res.length === 0) {
    return "";
  }

  res[0] = res[0].initial();
  res[res.length - 1] = res[res.length - 1].final();

  let buffer = "&#x202e"; // RTL
  res.forEach((i) => {
    buffer += "&#xe" + i.letter.toString(16).padStart(2, "0") + i.form.toString(16);
  });
  return buffer;
}

export function scriptMultiHTML(words: string): string {
  words = words.trim();
  if (words.length === 0) {
    return "";
  }

  let buffer = "";
  words.split(" ").forEach((w) => {
    buffer += scriptHTML(toSuffixed(w)) + " ";
  });
  return buffer.trim();
}

export function decodeHtml(html: string): string {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}
