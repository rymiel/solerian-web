import { NonIdealState, Spinner, SpinnerSize } from "@blueprintjs/core";
import { useContext } from "react";
import { App } from "../App";
import { Dictionary } from "../dictionary";
import { User } from "../user";

export default function ValidatePage() {
  const { entries } = useContext(Dictionary);
  const { user } = useContext(User);

  let content = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;

  if (!user) {
    content = <NonIdealState icon="error" title="You cannot access this page" />;
  } else if (entries) {
  }

  return App(content, "Validate");
}
