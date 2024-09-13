import { API, RawEntry, Meaning } from "../src/api";
import { entrySort } from "../src/dictionary";
import { determineType, markStress, partOfExtra } from "../src/lang/extra";
import { scriptMultiUnicode } from "../src/lang/script";
import { soundChange } from "../src/lang/soundChange";

const join = (s: Meaning[]) => s.reduce((a, b) => `${a}; ${b.eng}`, s[0].eng);

fetch(`${API}/raw`)
  .then((i) => i.json())
  .then((i) => i as RawEntry[])
  .then((i) =>
    i.sort(entrySort).map((i) => {
      const part = partOfExtra(i.extra);
      if (part !== null) {
        const cls = determineType(i.sol, part) ?? "?";
        return { ...i, extra: `${i.extra}-${cls}` };
      }
      return i;
    })
  )
  .then((i) =>
    i.map((i) => {
      return {
        ...i,
        script: scriptMultiUnicode(i.sol).replace(/[^ ]/g, (c) => "&#x" + c.charCodeAt(0).toString(16)),
        ipa: soundChange(i.sol, markStress(i)),
      };
    })
  )
  .then((i) => i.map((e) => console.log(`${e.hash}|${join(e.meanings)}|${e.sol}|${e.script}|${e.extra}|${e.ipa}`)));
