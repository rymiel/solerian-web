import { createApiClient } from "conlang-web-components";

export const LANGUAGE = "Solerian";
declare const WEB_VERSION: string;

export const API = createApiClient({ language: "solerian", version: WEB_VERSION });
