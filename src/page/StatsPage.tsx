import { Divider, H4, HTMLTable, NonIdealState, Spinner, SpinnerSize } from "@blueprintjs/core";
import { useContext } from "react";

import { Part } from "lang/extra";
import { Dictionary } from "providers/dictionary";
import { useTitle } from "providers/title";

const NOUN_GENDERS: Record<string, string> = {
  "1": "F",
  "2": "F",
  "3": "F",
  "4": "F",
  "5": "F",
  "6": "M",
  "7": "M",
  "8": "N",
  "9": "N",
};

const NOUN_EXPLANATIONS: Record<string, string> = {
  F: "Formerly feminine",
  M: "Formerly masculine",
  N: "Formerly neuter",
};

const VERB_BASES: Record<string, string> = {
  "1": "IT",
  "2": "TF",
  "3": "OT",
  "4": "ADJ",
  "5": "T",
};

const VERB_EXPLANATIONS: Record<string, string> = {
  T: "Transitive continuous actions",
  IT: "Intransitive continuous actions",
  TF: "Transformations",
  OT: "One-time actions, regardless of transitivity",
  ADJ: "Describing state or quality (adjectives)",
};

function increment(m: Record<string, number>, k: string): Record<string, number> {
  m[k] = (m[k] ?? 0) + 1;
  return m;
}

function Content() {
  const { entries } = useContext(Dictionary);

  let content = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;

  if (entries) {
    const nounClassTally: Record<string, number> = {};
    const nounGenderTally: Record<string, number> = {};
    const verbClassTally: Record<string, number> = {};
    const verbBaseTally: Record<string, number> = {};
    const extraTally: Record<string, number> = {};

    for (const e of entries) {
      increment(extraTally, e.extra);
      if (e.class === null) continue;
      if (e.part === Part.Noun) {
        increment(nounClassTally, e.class);
        const gender = NOUN_GENDERS[e.class];
        if (gender === undefined) continue;
        increment(nounGenderTally, gender);
      } else if (e.part === Part.Verb) {
        increment(verbClassTally, e.class);
        const base = VERB_BASES[e.class[0]];
        if (base === undefined) continue;
        increment(verbBaseTally, base);
      }
    }

    content = <div className="stats">
      <H4 className="n-header">Noun stats</H4>

      <HTMLTable className="n-left" compact striped>
        <thead>
          <th>Class</th>
          <th>Count</th>
        </thead>
        <tbody>
          {Object.keys(nounClassTally)
            .sort()
            .map((i) => <tr key={i}>
              <td>
                {i}
                {NOUN_GENDERS[i] ? ` (${NOUN_GENDERS[i]})` : undefined}
              </td>
              <td>{nounClassTally[i]}</td>
            </tr>)}
        </tbody>
      </HTMLTable>
      <HTMLTable className="n-right" compact striped>
        <thead>
          <th>Gender</th>
          <th>Count</th>
        </thead>
        <tbody>
          {Object.keys(NOUN_EXPLANATIONS).map((i) => <tr key={i}>
            <td>
              <abbr className="il" title={NOUN_EXPLANATIONS[i]}>
                {i}
              </abbr>
            </td>
            <td>{nounGenderTally[i]}</td>
          </tr>)}
        </tbody>
      </HTMLTable>
      <Divider className="divider-1" />
      <H4 className="v-header">Verb stats</H4>
      <HTMLTable className="v-left" compact striped>
        <thead>
          <th>Class</th>
          <th>Count</th>
        </thead>
        <tbody>
          {Object.keys(verbClassTally)
            .sort()
            .map((i) => <tr key={i}>
              <td>{i}</td>
              <td>{verbClassTally[i]}</td>
            </tr>)}
        </tbody>
      </HTMLTable>
      <HTMLTable className="v-right" compact striped>
        <thead>
          <th>Base</th>
          <th>Count</th>
        </thead>
        <tbody>
          {Object.keys(VERB_EXPLANATIONS).map((i) => <tr key={i}>
            <td>
              <abbr className="il" title={VERB_EXPLANATIONS[i]}>
                {i}
              </abbr>
            </td>
            <td>{verbBaseTally[i]}</td>
          </tr>)}
        </tbody>
      </HTMLTable>
      <Divider className="divider-2" />
      <H4 className="g-header">General stats</H4>
      <HTMLTable className="g-left" compact striped>
        <thead>
          <th>Extra</th>
          <th>Count</th>
        </thead>
        <tbody>
          {Object.keys(extraTally)
            .sort()
            .map((i) => <tr key={i}>
              <td>{i}</td>
              <td>{extraTally[i]}</td>
            </tr>)}
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td>{entries.length}</td>
          </tr>
        </tfoot>
      </HTMLTable>
    </div>;
  }

  return content;
}

export default function StatsPage() {
  useTitle("Stats");
  return <div className="inter">
    <Content />
  </div>;
}
