import { createContext, PropsWithChildren, useState } from "react";

import { API_BASE, GENERAL_API_SUFFIX } from "api";

export const ApiVersion = createContext<string | null>(null);

export function ApiVersionProvider({ children }: PropsWithChildren) {
  const [version, setVersion] = useState<string | null>(null);
  if (version === null) {
    fetch(`${API_BASE}${GENERAL_API_SUFFIX}/version`)
      .then((resp) => resp.text())
      .then((text) => setVersion(text))
      .catch((err) => console.error(err));
  }

  return <ApiVersion.Provider value={version}>{children}</ApiVersion.Provider>;
}
