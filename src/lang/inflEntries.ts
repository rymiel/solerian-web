import { useCallback, useContext, useEffect, useState } from "react";

import { markStress, separateRoot } from "lang/extra";
import { applyFromSeparatedRoot } from "lang/inflection";
import { Dictionary, FullEntry } from "providers/dictionary";

export interface InflEntry {
  sol: string;
  old: boolean;
  form: number;
  original: FullEntry;
}

export function useInflEntries() {
  const { entries } = useContext(Dictionary);
  const [infl, setInfl] = useState<InflEntry[] | null>(null);

  const refresh = useCallback(async () => {
    if (!entries) return;
    const infls: InflEntry[] = [];
    for (const i of entries) {
      if (i.part === null) continue;

      if (i.ex) {
        const ex = i.ex.split(",");
        const old = ex.length / 2;

        ex.forEach((f, fi) => infls.push({ sol: f, form: fi % old, original: i, old: fi >= old }));
      } else {
        const s = separateRoot(i.sol, i.part);
        if (s === null) throw new Error("Failed to separate root");

        const forms = applyFromSeparatedRoot(s, markStress(i));
        forms.cur.forEach((f, fi) => infls.push({ sol: f, form: fi, original: i, old: false }));
        forms.old.forEach((f, fi) => infls.push({ sol: f, form: fi, original: i, old: true }));
      }
    }
    setInfl(infls);
  }, [entries]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return infl;
}
