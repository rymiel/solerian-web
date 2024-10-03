type B10Num = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type B12Num = B10Num | "X" | "E";
type BijectNum = Exclude<B12Num, "0"> | "T";

type B10 = readonly B10Num[];
type B12 = readonly B12Num[];
type BijectPositive = readonly BijectNum[];
type BijectZero = 0;
type Biject = BijectPositive | BijectZero;

const B10_NUMS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;
const B12_NUMS = [...B10_NUMS, "X", "E"] as const;

const zero = "adénel";

const ones: Readonly<Record<BijectNum, string>> = {
  "1": "tir",
  "2": "skel",
  "3": "jàr",
  "4": "sífà",
  "5": "rémen",
  "6": "namád",
  "7": "kelm",
  "8": "sátel",
  "9": "najár",
  X: "séren",
  E: "tirér",
  T: "ler",
} as const;

const teens: Readonly<Record<BijectNum, string>> = {
  "1": "latsetír",
  "2": "latseskél",
  "3": "latsejár",
  "4": "latsesífà",
  "5": "latserémen",
  "6": "latsenamád",
  "7": "latsekélm",
  "8": "latsesátel",
  "9": "latsenajár",
  X: "latseséren",
  E: "latsetirér",
  T: "élàtser",
} as const;

const tens: Readonly<Record<Exclude<BijectNum, "1">, [string, string]>> = {
  "2": ["skélaler", "éskelaler"],
  "3": ["járaler", "éjàraler"],
  "4": ["sífàler", "ésifàler"],
  "5": ["rémenaler", "éremenaler"],
  "6": ["namádaler", "énamàdaler"],
  "7": ["kélmaler", "ékelmaler"],
  "8": ["sátelaler", "ésàtelaler"],
  "9": ["najáraler", "énajàraler"],
  X: ["sérenaler", "éserenaler"],
  E: ["tiréraler", "étireraler"],
  T: ["léraler", "éleraler"],
} as const;

const hundreds: Readonly<Record<BijectNum, string>> = {
  "1": "tírexar",
  "2": "skélexar",
  "3": "járexar",
  "4": "sífàxar",
  "5": "rémenexar",
  "6": "namádexar",
  "7": "kélmexar",
  "8": "sátelexar",
  "9": "najárexar",
  X: "sérenexar",
  E: "tirérexar",
  T: "lerexar",
} as const;

export function constructNumber(biject: Biject) {
  if (biject === 0) {
    return zero;
  }
  let fstring = "";
  const rtl = [...biject].reverse();
  if (rtl[1] === "1") {
    fstring += teens[rtl[0]];
  } else if (rtl.length === 1) {
    fstring += ones[rtl[0]];
  } else {
    if (rtl[0] !== "T") {
      fstring += ones[rtl[0]] + " " + tens[rtl[1]][0];
    } else {
      fstring += tens[rtl[1]][1];
    }
  }
  if (rtl.length === 3) {
    fstring += " " + hundreds[rtl[2]];
  }
  return fstring;
}

function convertBase(value: string, fromBase: number, toBase: number): string {
  const range: readonly string[] = B12_NUMS;
  const fromRange = range.slice(0, fromBase);
  const toRange = range.slice(0, toBase);

  let decValue = value
    .split("")
    .reverse()
    .reduce((carry, digit, index) => (carry += fromRange.indexOf(digit) * Math.pow(fromBase, index)), 0);

  let newValue = "";
  while (decValue > 0) {
    newValue = toRange[decValue % toBase] + newValue;
    decValue = (decValue - (decValue % toBase)) / toBase;
  }
  return newValue || "0";
}

function addB12(b12num: B12Num, scalar: number): B12Num {
  const idx = B12_NUMS.indexOf(b12num);
  if (idx === -1) throw new Error(`Base 12 invalid (${b12num})`);
  const n = B12_NUMS[idx + scalar];
  if (n === undefined) throw new Error(`Base 12 out of bounds (${b12num} + ${scalar})`);
  return n;
}

export function b12toBijective(b12num: B12): Biject {
  if (b12num.length === 1 && b12num[0] === "0") {
    return 0;
  }
  b12num = [...b12num].reverse();
  let flag = false;
  let bijective: BijectPositive = [];
  for (let i = 0; i < b12num.length; i++) {
    const c = b12num[i];
    if (flag) {
      if (c === "0") {
        bijective = ["E", ...bijective];
        continue;
      }
      const newC = addB12(c, -1);
      if (newC === "0" && i === b12num.length - 1) {
        continue;
      } else if (newC === "0") {
        bijective = ["T", ...bijective];
      } else {
        bijective = [newC, ...bijective];
        flag = false;
      }
    } else {
      if (c === "0") {
        bijective = ["T", ...bijective];
        flag = true;
      } else {
        bijective = [c, ...bijective];
      }
    }
  }
  return bijective;
}

export function bijectiveToB12(biject: Biject): B12 {
  if (biject === 0) {
    return ["0"];
  }
  biject = [...biject].reverse();
  let flag = false;
  let num: B12 = [];
  for (let i = 0; i < biject.length; i++) {
    const c = biject[i];
    if (flag) {
      if (c === "T") {
        num = ["1", ...num];
      } else if (c === "E") {
        num = ["0", ...num];
      } else {
        const newC = addB12(c, 1);
        num = [newC, ...num];
        flag = false;
      }
    } else {
      if (c === "T") {
        num = ["0", ...num];
        flag = true;
      } else {
        num = [c, ...num];
      }
    }
    if (flag && i === biject.length - 1) {
      num = ["1", ...num];
    }
  }
  return num;
}

export function b10ToB12(b10: B10): B12 {
  return convertBase(b10.join(""), 10, 12).split("") as B12;
}

export function b10Split(s: string): B10 | null {
  const arr = s.split("");
  if (arr.some((i) => !B10_NUMS.some((c) => i === c))) {
    return null;
  }
  return arr as B10;
}
