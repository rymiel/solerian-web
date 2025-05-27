import { ApiConfig, GenerationInstance } from "conlang-web-components";
import { createContext } from "react";

import { SoundChangeInstance } from "lang/soundChange";

export interface LangConfigData {
  config: ApiConfig;
  soundChange: SoundChangeInstance;
  generation: GenerationInstance;
  ipa: (sentence: string) => string;
  script: (sentence: string) => string;
}

export const LangConfig = createContext<LangConfigData | null>(null);
