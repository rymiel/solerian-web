import React from "react";

export interface InterlinearData {
  sol: string;
  solSep: string;
  engSep: string;
  eng: string;
}

const ABBREVIATIONS: Record<string, string> = {
  "1SG": "first person singular",
  "2SG": "second person singular",
  "3SG": "third person singular",
  "1PL": "first person plural",
  "2PL": "second person plural",
  "3PL": "third person plural",
  PST: "past",
  PRS: "present",
  NOM: "nominative",
  ACC: "accusative",
  GEN: "genitive",
  NAME: "onomatonym",
  IMP: "imperative",
  NEG: "negative",
  ADV: "adverb",
  ECHO: "echo",
};

function convertAbbr(s: string): React.ReactNode[] {
  const parts = s.split(/([-.\(\)])/);

  console.log(parts);
  return parts.map((i, j) => {
    const abbr = ABBREVIATIONS[i] as string | undefined;
    if (abbr === undefined) {
      return i;
    } else {
      return (
        <abbr key={j} title={abbr}>
          {i}
        </abbr>
      );
    }
  });
}

export function InterlinearGloss({ data }: { data: InterlinearData }) {
  const solParts = data.solSep.split(" ");
  const engParts = data.engSep.split(" ");
  const numParts = Math.max(solParts.length, engParts.length);
  const parts = [];

  for (let i = 0; i < numParts; i++) {
    const eSol = solParts[i];
    const eEng = engParts[i];

    parts.push(
      <div className="box" key={i}>
        {eSol && <p className="original">{eSol}</p>}
        {eEng && <p>{convertAbbr(eEng)}</p>}
      </div>
    );
  }

  return (
    <div className="interlinear">
      <p className="original">{data.sol}</p>
      {...parts}
      <p className="translation">{data.eng}</p>
    </div>
  );
}
