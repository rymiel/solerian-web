export interface ApiUser {
  name: string;
}

export interface ApiBase {
  hash: string;
  created_at: string;
  updated_at: string;
}

export interface RawEntry extends ApiBase {
  sol: string;
  extra: string;
  tag: string | undefined;
  meanings: Meaning[];
  sections: Section[];
}

export interface Meaning extends ApiBase {
  eng: string;
  sections: Section[];
}

export interface Section extends ApiBase {
  title: string;
  content: string;
}

export class CustomApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const API_SUFFIX = "/api/v0";
// export const API =
//   document.location.hostname === "localhost"
//     ? `http://localhost:3000${API_SUFFIX}`
//     : `https://solerian-api.rymiel.space${API_SUFFIX}`;
// export const API = `https://s.rymiel.space${API_SUFFIX}`;
export const API = `http://localhost:3000${API_SUFFIX}`;

declare const WEB_VERSION: string;

type HTTPMethod = "GET" | "POST";
type Body = FormData | Record<string, string>;

export async function apiFetch<T>(endpoint: string, method?: HTTPMethod, body?: Body): Promise<T> {
  const headers = new Headers();
  const key = localStorage.getItem("token");
  let formBody;
  if (key !== null) {
    headers.set("Authorization", key);
  }
  headers.set("X-Solerian-Client", `solerian web/${WEB_VERSION} rymiel`);
  if (body instanceof FormData) {
    formBody = body;
  } else if (body !== undefined) {
    formBody = new FormData();
    for (const key in body) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        formBody.set(key, body[key]);
      }
    }
  }
  method ??= "GET";
  const response = await fetch(API + endpoint, { method, body: formBody, headers, credentials: "include" });
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
