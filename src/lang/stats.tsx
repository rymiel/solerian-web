import { Divider, H4, HTMLTable } from "@blueprintjs/core";
import { increment, PartsContent, useData } from "@rymiel/conlang-web-components";
import { FC } from "react";

import { Part } from "./extra";

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

function ClassContent() {
  const { entries } = useData();

  const nounClassTally: Record<string, number> = {};
  const nounGenderTally: Record<string, number> = {};
  const verbClassTally: Record<string, number> = {};
  const verbBaseTally: Record<string, number> = {};

  for (const e of entries) {
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

  return <div className="stats-section stats-classes">
    <H4 className="noun-stats-title">Noun stats</H4>

    <HTMLTable className="noun-stats-left" compact striped>
      <thead>
        <tr>
          <th>Class</th>
          <th>Count</th>
        </tr>
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
    <HTMLTable className="noun-stats-right" compact striped>
      <thead>
        <tr>
          <th>Gender</th>
          <th>Count</th>
        </tr>
      </thead>
      <tbody>
        {Object.keys(NOUN_EXPLANATIONS).map((i) => <tr key={i}>
          <td>
            <abbr className="gloss-abbr" title={NOUN_EXPLANATIONS[i]}>
              {i}
            </abbr>
          </td>
          <td>{nounGenderTally[i]}</td>
        </tr>)}
      </tbody>
    </HTMLTable>
    <Divider className="class-stats-divider" />
    <H4 className="verb-stats-title">Verb stats</H4>
    <HTMLTable className="verb-stats-left" compact striped>
      <thead>
        <tr>
          <th>Class</th>
          <th>Count</th>
        </tr>
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
    <HTMLTable className="verb-stats-right" compact striped>
      <thead>
        <tr>
          <th>Base</th>
          <th>Count</th>
        </tr>
      </thead>
      <tbody>
        {Object.keys(VERB_EXPLANATIONS).map((i) => <tr key={i}>
          <td>
            <abbr className="gloss-abbr" title={VERB_EXPLANATIONS[i]}>
              {i}
            </abbr>
          </td>
          <td>{verbBaseTally[i]}</td>
        </tr>)}
      </tbody>
    </HTMLTable>
  </div>;
}

export const STATS_SECTIONS: readonly FC[] = [ClassContent, PartsContent];
