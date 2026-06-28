import { registerPlugin } from "@capacitor/core";

export interface ShareRecipeExtractorResult {
  url: string;
  jsonLd: string;
  length: number;
}

export interface ShareRecipeExtractorPlugin {
  extractJsonLd(options: {
    url: string;
  }): Promise<ShareRecipeExtractorResult>;
}

export const ShareRecipeExtractor =
  registerPlugin<ShareRecipeExtractorPlugin>("ShareRecipeExtractor");