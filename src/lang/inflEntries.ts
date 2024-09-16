import { useState, useEffect, useContext } from "react";
import { separateRoot, markStress } from "./extra";
import { applyFromSeparatedRoot } from "./inflection";
import { FullEntry, Dictionary } from "../dictionary";

export interface InflEntry {
  sol: string;
  old: boolean;
  form: number;
  original: FullEntry;
}

export function useInflEntries() {
  const { entries } = useContext(Dictionary);
  const [infl, setInfl] = useState<InflEntry[] | null>(null);

  const refresh = async () => {
    if (!entries) return;
    const infls: InflEntry[] = [];
    for (const i of entries) {
      if (i.part === null) continue;

      const s = separateRoot(i.sol, i.part);
      if (s === null) throw new Error("Failed to separate root");

      const forms = applyFromSeparatedRoot(s, markStress(i));
      forms.cur.forEach((f, fi) => infls.push({ sol: f, form: fi, original: i, old: false }));
      forms.old.forEach((f, fi) => infls.push({ sol: f, form: fi, original: i, old: true }));
    }
    setInfl(infls);
  };

  useEffect(() => {
    refresh();
  }, [entries]);

  return infl;
}