import { API, RawEntry } from "../src/api";
import { rawEntrySort } from "../src/dictionary";
import { partOfExtra, separateRoot, Part, markStress } from "../src/lang/extra";
import { applyFromSeparatedRoot } from "../src/lang/inflection";
import { scriptMultiUnicode } from "../src/lang/script";
import { soundChange } from "../src/lang/soundChange";

fetch(`${API}/raw`)
  .then((i) => i.json())
  .then((i) => i as RawEntry[])
  .then((i) =>
    i.sort(rawEntrySort).map((i) => {
      const part = partOfExtra(i.extra);
      if (part !== null) {
        const s = separateRoot(i.sol, part);
        if (s !== null) {
          const stress = markStress(i);
          const forms = applyFromSeparatedRoot(s, stress);
          let fi = 0;
          const out = (f: string) => {
            const script = scriptMultiUnicode(f).replace(/[^ ]/g, (c) => "&#x" + c.charCodeAt(0).toString(16));
            const ipa = soundChange(f, stress);
            console.log(`${i.sol}|${part}|${fi}|${f}|${script}|${ipa}`);
            fi++;
          };
          forms.cur.forEach(out);
          forms.old.forEach(out);
        }
      }
    })
  );
