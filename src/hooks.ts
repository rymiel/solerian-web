import { useContext } from "react";
import { ApiUser } from "./api";

export function useUser(): ApiUser | undefined {
  const json = window.localStorage.getItem("user");
  if (!json) return undefined;
  return JSON.parse(json) as ApiUser;
}

export function useContextSafe<T>(context: React.Context<T | undefined>): T {
  const raw = useContext(context);
  if (raw === undefined) {
    throw new Error(`Context ${context.displayName} isn't present in the tree`);
  }

  return raw;
}
