import { createContext, PropsWithChildren, useState } from "react";

import { API } from "api";

export const ApiVersion = createContext<string | null>(null);

export function ApiVersionProvider({ children }: PropsWithChildren) {
  const [version, setVersion] = useState<string | null>(null);
  if (version === null) {
    API.version()
      .then((text) => setVersion(text))
      .catch((err) => console.error(err));
  }

  return <ApiVersion.Provider value={version}>{children}</ApiVersion.Provider>;
}
