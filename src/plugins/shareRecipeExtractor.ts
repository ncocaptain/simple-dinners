import { registerPlugin } from "@capacitor/core";

export interface ShareRecipeExtractorResult {
  url: string;
  jsonLd: string;
  length: number;
}

export interface InstagramCaptionExtractorResult {
  url: string;
  captionText: string;
  photoUrl: string;
  ogTitle: string;
  length: number;
}

export interface ShareRecipeExtractorPlugin {
  extractJsonLd(options: {
    url: string;
  }): Promise<ShareRecipeExtractorResult>;

  extractInstagramCaption(options: {
    url: string;
  }): Promise<InstagramCaptionExtractorResult>;
}

export const ShareRecipeExtractor =
  registerPlugin<ShareRecipeExtractorPlugin>(
    "ShareRecipeExtractor"
  );
