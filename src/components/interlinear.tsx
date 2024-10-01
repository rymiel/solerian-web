import React from "react";
import { Link } from "react-router-dom";
import { soundChangeSentence } from "../lang/soundChange";
import { uri } from "..";

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
  "1": "first person",
  "2": "second person",
  "3": "third person",
  SG: "singular",
  PL: "plural",
  PST: "past",
  PRS: "present",
  NOM: "nominative",
  ACC: "accusative",
  GEN: "genitive",
  NAME: "onomatonym",
  IMP: "imperative",
  INF: "infinitive",
  GER: "gerund",
  NEG: "negative",
  ADV: "adverb",
  ECHO: "echo (marks that the subject of the sentence hasn't changed)",

  // old stuff
  M: "masculine",
  F: "feminine",
  N: "neuter",
};

export function convertAbbr(s: string): React.ReactNode[] {
  const parts = s.split(/([-.\(\) ])/);

  return parts.map((i, j) => {
    const abbr = ABBREVIATIONS[i] as string | undefined;
    if (abbr === undefined) {
      return i;
    } else {
      return (
        <abbr key={j} title={abbr} className="il">
          {i}
        </abbr>
      );
    }
  });
}

const SEP = /([\u201c\u201d -])/;
interface ILWord {
  text: string;
  index: number;
  bold: boolean;
}
const splitIntoWords = (s: string): ILWord[] => s.split(SEP).map((i, j) => ({ text: i, index: j, bold: false }));
const elem = (w: ILWord): React.ReactNode => (w.bold ? <b key={w.index}>{w.text}</b> : w.text);
const joinWords = (w: ILWord[]): React.ReactNode => w.map(elem);
const joinLinks = (w: ILWord[]): React.ReactNode =>
  w.map((i) =>
    SEP.test(i.text) ? (
      elem(i)
    ) : (
      <Link key={i.index} to={uri`/reverse/${i.text}`}>
        {elem(i)}
      </Link>
    )
  );

const highlightAsterisk = (w: ILWord[]): ILWord[] =>
  w.map((i) => (i.text.startsWith("*") ? { ...i, text: i.text.slice(1), bold: true } : i));

export function InterlinearGloss({
  data,
  asterisk = false,
  link = false,
  indent = false,
}: {
  data: InterlinearData;
  asterisk?: boolean;
  link?: boolean;
  indent?: boolean;
}) {
  const solParts = data.solSep.split(" ");
  const engParts = data.engSep.split(" ");
  const numParts = Math.max(solParts.length, engParts.length);
  const parts = [];

  let solWords = splitIntoWords(data.sol);
  let engWords = splitIntoWords(data.eng);
  if (asterisk) {
    solWords = highlightAsterisk(solWords);
    engWords = highlightAsterisk(engWords);
  }
  const sol = link ? joinLinks(solWords) : joinWords(solWords);
  const eng = joinWords(engWords);
  const solClean = data.sol.replaceAll("*", "");

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

  const body = (
    <>
      {...parts}
      <p className="bottom">{soundChangeSentence(solClean)}</p>
      <p className="bottom">{eng}</p>
    </>
  );

  return (
    <div className="interlinear">
      <p className="original">{sol}</p>
      {indent ? (
        <dl>
          <dd>{body}</dd>
        </dl>
      ) : (
        body
      )}
    </div>
  );
}
