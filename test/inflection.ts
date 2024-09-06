import { RawEntry } from "../src/api";
import { defaultEntrySort, partOfExtra, separateRoot, Part } from "../src/lang/extra";
import { applyFromSeparatedRoot } from "../src/lang/inflection";
import { scriptMultiUnicode } from "../src/lang/script";
import { soundChange } from "../src/lang/soundChange";

fetch("http://localhost:3000/api/temporary/v0/raw")
  .then((i) => i.json())
  .then((i) => i as RawEntry[])
  .then((i) =>
    i.sort(defaultEntrySort).map((i) => {
      const part = partOfExtra(i.extra);
      if (part !== null) {
        const s = separateRoot(i.sol, part);
        if (s !== null) {
          const markStress = !i.extra.startsWith("NAME");
          const forms = applyFromSeparatedRoot(s, part, markStress) as string[];
          forms.forEach((f, fi) => {
            const script = scriptMultiUnicode(f).replace(/[^ ]/g, (c) => "&#x" + c.charCodeAt(0).toString(16));
            const ipa = soundChange({ sol: f, extra: i.extra });
            console.log(`${i.sol}|${part}|${fi}|${f}|${script}|${ipa}`);
          });
        }
      }
    })
  );
