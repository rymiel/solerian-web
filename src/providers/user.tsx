import { createContext, PropsWithChildren, useEffect, useState } from "react";

import { apiFetch, ApiUser } from "api";
import { toastErrorHandler } from "App";

interface UserData {
  user: ApiUser | null;
  update: () => Promise<void>;
}

export const User = createContext<UserData>({
  user: null,
  update: () => {
    throw new Error("No user context provided");
  },
});

export function UserProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const update = async () => {
    try {
      const u = await apiFetch<ApiUser | null>("/me");
      setUser(u);

      try {
        localStorage.setItem("user", JSON.stringify(u));
      } catch (err) {
        if (err instanceof DOMException) {
          toastErrorHandler(new Error(`Failed to sync: ${err.name}: ${err.message}`));
        } else {
          throw err;
        }
      }
    } catch (err) {
      toastErrorHandler(err);
    }
  };

  useEffect(() => {
    update();

    const id = setInterval(() => update(), 1_000 * 60 * 10);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handle = (e: StorageEvent) => {
      if (e.key === "user" && e.newValue !== null) {
        const user = JSON.parse(e.newValue) as ApiUser | null;
        console.log("Synced user:", user);
        setUser(user);
      }
    };
    addEventListener("storage", handle);
    return () => removeEventListener("storage", handle);
  }, []);

  return <User.Provider value={{ user, update }}>{children}</User.Provider>;
}
