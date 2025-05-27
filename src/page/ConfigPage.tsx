import { NonIdealState, Spinner, SpinnerSize } from "@blueprintjs/core";
import { ConfigPage as Content, useTitle } from "conlang-web-components";
import { useContext } from "react";

import { Dictionary } from "providers/dictionary";
import { LangConfig } from "providers/langConfig";
import { User } from "providers/user";

export default function ConfigPage() {
  const { user } = useContext(User);
  const { refresh } = useContext(Dictionary);
  const lang = useContext(LangConfig);
  useTitle("Config");

  if (!user) {
    return <NonIdealState icon="error" title="You cannot access this page" />;
  } else if (lang === null) {
    return <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;
  } else {
    return <div className="inter">
      <Content config={lang.config} refresh={refresh} />
    </div>;
  }
}
