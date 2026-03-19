import {
  NonIdealState,
  Spinner,
  SpinnerSize,
} from "@blueprintjs/core";
import { SoundChangePage as Content, useTitle } from "conlang-web-components";
import { useContext } from "react";

import { useInflEntries } from "lang/inflEntries";
import { Change } from "lang/soundChange";
import { Dictionary } from "providers/dictionary";
import { LangConfig } from "providers/langConfig";

// TODO: bring back InflEntry support

export default function SoundChangePage() {
  const { entries } = useContext(Dictionary);
  const lang = useContext(LangConfig);
  const infl = useInflEntries()?.filter((i) => i.old === false);
  useTitle("Sound changes");

  let content;

  if (entries === null || infl === undefined || lang === null) {
    content = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;
  } else {
    const makeLocal = (changes: readonly Change[]) => lang.soundChange.copyWithChanges(changes);
    content = <div className="inter">
      <Content entries={entries} makeLocal={makeLocal} soundChange={lang.soundChange} />
    </div>;
  }

  return content;
}
