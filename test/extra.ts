import { type RawEntry } from "../src/api";
import { defaultEntrySort, determineType, partOfExtra } from "../src/lang/extra";
import { scriptMultiUnicode } from "../src/lang/script";
import { soundChange } from "../src/lang/soundChange";

fetch("http://localhost:3000/api/temporary/v0/raw")
  .then((i) => i.json())
  .then((i) => i as RawEntry[])
  .then((i) =>
    i.sort(defaultEntrySort).map((i) => {
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
        ipa: soundChange(i)
      };
    })
  )
  .then((i) => i.map((e) => console.log(`${e.hash}|${e.eng}|${e.sol}|${e.script}|${e.extra}|${e.ipa}`)));
