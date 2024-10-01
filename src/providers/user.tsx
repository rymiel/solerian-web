import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { apiFetch, ApiUser } from "../api";
import { toastErrorHandler } from "../App";

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
    } catch (err) {
      toastErrorHandler(err);
    }
  };
  useEffect(() => {
    update();
  }, []);

  return <User.Provider value={{ user, update }}>{children}</User.Provider>;
}
