import { ApiConfig, GenerationInstance, KeyValue, SoundChangeInstance } from "conlang-web-components";
import { createContext } from "react";

export interface LangConfigData {
  config: ApiConfig;
  soundChange: SoundChangeInstance;
  generation: GenerationInstance;
  abbreviations: KeyValue;
  parts: KeyValue;
  ipa: (sentence: string) => string;
  script: (sentence: string) => string;
}

export const LangConfig = createContext<LangConfigData | null>(null);
