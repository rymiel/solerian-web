import { ApiData } from "conlang-web-components";
import { PropsWithChildren, useCallback, useEffect, useRef, useState } from "react";

import { transformConfig } from "lang/config";
import { transformDictionary } from "lang/dictionary";
import { Dictionary, FullEntry } from "providers/dictionary";
import { LangConfig, LangConfigData } from "providers/langConfig";
import { API } from "api";
import { toastErrorHandler } from "App";

export function DataProvider({ children }: PropsWithChildren) {
  const [entries, setEntries] = useState<FullEntry[] | null>(null);
  const [config, setConfig] = useState<LangConfigData | null>(null);
  const etag = useRef(localStorage.getItem("etag") ?? "undefined");

  const refresh = useCallback(async () => {
    try {
      const data = await API.lang<ApiData>("/data");
      const config = transformConfig(data.config ?? {});
      const entries = transformDictionary(config, data);
      setEntries(entries);
      setConfig(config);

      try {
        const newEtag = data.etag ?? "undefined";
        if (newEtag != etag.current) {
          console.log(`Broadcasting new data etag: ${etag.current} -> ${newEtag}`);
          etag.current = newEtag;
          localStorage.setItem("etag", newEtag);
        }
      } catch (err) {
        if (err instanceof DOMException) {
          toastErrorHandler(new Error(`Failed to sync: ${err.name}: ${err.message}`));
        } else {
          throw err;
        }
      }
    } catch (error) {
      toastErrorHandler(error);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handle = (e: StorageEvent) => {
      if (e.key === "etag" && e.newValue !== etag.current) {
        console.log(`Synced new data etag: ${etag.current} -> ${e.newValue}`);
        refresh();
      }
    };
    addEventListener("storage", handle);
    return () => removeEventListener("storage", handle);
  }, [refresh]);

  // TODO: remove me later
  useEffect(() => {
    localStorage.removeItem("entries");
  }, []);

  return <Dictionary.Provider value={{ entries, refresh }}>
    <LangConfig.Provider value={config}>{children}</LangConfig.Provider>
  </Dictionary.Provider>;
}
