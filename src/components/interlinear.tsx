import { ReactNode, useContext } from "react";
import { Link } from "react-router-dom";

import { uri } from "lang/util";
import { LangConfig } from "providers/langConfig";

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
const ABBR_SEP = /([-.() ])/;
const WORD_SEP = /([\u201c\u201d -])/;

export function Abbr({ children }: { children: string }): ReactNode {
  const parts = children.split(ABBR_SEP);

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

interface ILWord {
  text: string;
  index: number;
  bold: boolean;
}
const splitIntoWords = (s: string): ILWord[] => s.split(WORD_SEP).map((i, j) => ({ text: i, index: j, bold: false }));
const elem = (w: ILWord): ReactNode => (w.bold ? <b key={w.index}>{w.text}</b> : w.text);
const links = (w: ILWord): ReactNode =>
  WORD_SEP.test(w.text) ? (
    elem(w)
  ) : (
    <Link key={w.index} to={uri`/reverse/${w.text}`}>
      {elem(w)}
    </Link>
  );

const highlightAsterisk = (w: ILWord[]): ILWord[] =>
  w.map((i) => (i.text.startsWith("*") ? { ...i, text: i.text.slice(1), bold: true } : i));

export function InterlinearGloss({
  data,
  asterisk = false,
  link = false,
  indent = false,
  extra,
}: {
  data: InterlinearData;
  asterisk?: boolean;
  link?: boolean;
  indent?: boolean;
  extra?: ReactNode;
}) {
  const { soundChange } = useContext(LangConfig);
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
  const sol = solWords.map(link ? links : elem);
  const eng = engWords.map(elem);
  const solClean = data.sol.replaceAll("*", "");

  for (let i = 0; i < numParts; i++) {
    const eSol = solParts[i];
    const eEng = engParts[i];

    parts.push(
      <div className="box" key={i}>
        {eSol && <p className="original">{eSol}</p>}
        {eEng && (
          <p>
            <Abbr>{eEng}</Abbr>
          </p>
        )}
      </div>,
    );
  }

  const body = (
    <>
      {...parts}
      {soundChange && <p className="bottom">{soundChange.soundChangeSentence(solClean)}</p>}
      <p className="bottom">{eng}</p>
    </>
  );

  return (
    <div className="interlinear">
      <p className="original">{sol}{extra}</p>
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
