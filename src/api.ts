export interface ApiUser {
  name: string;
}

export interface ApiBase {
  hash: string;
  created_at: string;
  updated_at: string;
}

export interface ApiWord extends ApiBase {
  sol: string;
  extra: string;
  tag: string | undefined;
  ex: string | undefined;
  meanings: string[];
  sections: string[];
}

export interface ApiMeaning extends ApiBase {
  eng: string;
  sections: string[];
}

export interface ApiSection extends ApiBase {
  title: string;
  content: string;
}

export interface ApiDictionary {
  words: ApiWord[];
  meanings: ApiMeaning[];
  sections: ApiSection[];
  etag?: string;
}

export class CustomApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const GENERAL_API_SUFFIX = "/api/v0";
export const LANG_API_SUFFIX = "/api/v1/solerian";

export const API_BASE =
  document.location.hostname === "localhost" ? `http://localhost:3000` : `https://solerian-api.rymiel.space`;

declare const WEB_VERSION: string;

type HTTPMethod = "GET" | "POST" | "DELETE";
type Body = FormData | Record<string, string | undefined> | string;

export async function apiGeneralFetch<T>(endpoint: string, method?: HTTPMethod, body?: Body): Promise<T> {
  return apiBaseFetch(API_BASE + GENERAL_API_SUFFIX + endpoint, method, body);
}
export async function apiLangFetch<T>(endpoint: string, method?: HTTPMethod, body?: Body): Promise<T> {
  return apiBaseFetch(API_BASE + LANG_API_SUFFIX + endpoint, method, body);
}

async function apiBaseFetch<T>(endpoint: string, method?: HTTPMethod, body?: Body): Promise<T> {
  const headers = new Headers();
  const key = localStorage.getItem("token");
  let formBody;
  if (key !== null) {
    headers.set("Authorization", key);
  }
  headers.set("X-Solerian-Client", `solerian web/${WEB_VERSION} rymiel`);
  if (body instanceof FormData) {
    formBody = body;
  } else if (typeof body === "string") {
    formBody = body;
  } else if (body !== undefined) {
    formBody = new FormData();
    for (const key in body) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        const v = body[key];
        if (v !== undefined) {
          formBody.set(key, v);
        }
      }
    }
  }
  method ??= "GET";
  const response = await fetch(endpoint, { method, body: formBody, headers, credentials: "include" });
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new CustomApiError(text, response.status);
    } else {
      throw error;
    }
  }
}
