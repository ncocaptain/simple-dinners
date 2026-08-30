import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Capacitor, CapacitorHttp } from "@capacitor/core";
import { ShareRecipeExtractor } from "../plugins/shareRecipeExtractor";
import { API_BASE } from "../core/api";
import { getStoredLanguage } from "../i18n";
import { usePlusAccess } from "../plus/usePlusAccess";


const SOURCE_STEPS_PLACEHOLDER = "Steps available at source link!";
const MAX_SCREENSHOT_FILES = 5;
const MAX_SCREENSHOT_FILE_BYTES = 8 * 1024 * 1024;
const MAX_SCREENSHOT_TOTAL_BYTES = 25 * 1024 * 1024;
const MAX_VIDEO_FILE_BYTES = 75 * 1024 * 1024;

const SCREENSHOT_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
]);

const VIDEO_FILE_EXTENSIONS = new Set([
  "mp4",
  "mov",
  "webm",
  "m4v",
]);

function getFileExtension(filename: string): string {
  const match = filename.trim().toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] || "";
}

function isSupportedVideoFile(file: File): boolean {
  if (VIDEO_MIME_TYPES.has(file.type)) {
    return true;
  }

  const hasGenericMimeType =
    !file.type || file.type === "application/octet-stream";

  return (
    hasGenericMimeType &&
    VIDEO_FILE_EXTENSIONS.has(getFileExtension(file.name))
  );
}

function formatFileSize(bytes: number): string {
  const megabytes = bytes / (1024 * 1024);
  return `${megabytes.toFixed(megabytes >= 10 ? 0 : 1)} MB`;
}

function extractFirstUrlFromSharedText(value: string | null): string {
  if (!value) return "";

  let text = value.trim().replace(/\+/g, " ");

  try {
    text = decodeURIComponent(text);
  } catch {
    // If already decoded, keep going.
  }

  const match = text.match(
    /(?:https?:\/\/|www\.|pin\.it\/|pinterest\.com\/)[^\s"'<>]+/i
  );

  if (!match) {
    return "";
  }

  let foundUrl = match[0]
    .replace(/[)\].,!?]+$/g, "")
    .replace(/&amp;/g, "&")
    .trim();

  if (foundUrl.startsWith("www.")) {
    foundUrl = `https://${foundUrl}`;
  }

  if (foundUrl.startsWith("pin.it/") || foundUrl.startsWith("pinterest.com/")) {
    foundUrl = `https://${foundUrl}`;
  }

  return foundUrl;
}

function isPinterestUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.toLowerCase();

    return (
      host === "pin.it" ||
      host === "pinterest.com" ||
      host === "www.pinterest.com" ||
      host.endsWith(".pinterest.com")
    );
  } catch {
    const lower = rawUrl.toLowerCase();

    return lower.includes("pinterest.com") || lower.includes("pin.it/");
  }
}

function isCaptionAssistSocialUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.toLowerCase();

    return (
      host.includes("instagram.com") ||
      host.includes("tiktok.com") ||
      host.includes("facebook.com") ||
      host.includes("fb.watch")
    );
  } catch {
    const lower = rawUrl.toLowerCase();

    return (
      lower.includes("instagram.com") ||
      lower.includes("tiktok.com") ||
      lower.includes("facebook.com") ||
      lower.includes("fb.watch")
    );
  }
}

function isInstagramRecipeUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.toLowerCase();

    return (
      host === "instagram.com" ||
      host.endsWith(".instagram.com")
    );
  } catch {
    return String(rawUrl || "")
      .toLowerCase()
      .includes("instagram.com");
  }
}

const INSTAGRAM_CAPTION_TIMEOUT_MS = 15000;

async function extractInstagramCaptionForShare(
  rawUrl: string
): Promise<string> {
  if (
    Capacitor.getPlatform() !== "android" ||
    !isInstagramRecipeUrl(rawUrl)
  ) {
    return "";
  }

  let timeoutId: number | undefined;

  try {
    const result = await Promise.race([
      ShareRecipeExtractor.extractInstagramCaption({
        url: rawUrl,
      }),
      new Promise<never>((_, reject) => {
        timeoutId = window.setTimeout(() => {
          reject(
            new Error(
              "Instagram caption extraction timed out."
            )
          );
        }, INSTAGRAM_CAPTION_TIMEOUT_MS);
      }),
    ]);

    const captionText = String(
      result?.captionText || ""
    ).trim();

    console.error(
      "ShareImport Instagram fallback metadata extracted:",
      JSON.stringify({
        captionLength: captionText.length,
        hasPhotoUrl: Boolean(result?.photoUrl),
        hasOgTitle: Boolean(result?.ogTitle),
      })
    );

    return captionText;
  } catch (error) {
    console.error(
      "Automatic ShareImport Instagram caption extraction failed:",
      error
    );

    return "";
  } finally {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
    }
  }
}

function isTikTokRecipeUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.toLowerCase();

    return (
      host === "tiktok.com" ||
      host.endsWith(".tiktok.com")
    );
  } catch {
    return String(rawUrl || "")
      .toLowerCase()
      .includes("tiktok.com");
  }
}

function isInstagramVideoUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.toLowerCase();

    const isInstagramHost =
      host === "instagram.com" ||
      host === "www.instagram.com" ||
      host.endsWith(".instagram.com");

    return (
      isInstagramHost &&
      /^\/(reel|reels|p)\//i.test(
        parsed.pathname
      )
    );
  } catch {
    return /instagram\.com\/(reel|reels|p)\//i.test(
      rawUrl
    );
  }
}

async function probeInstagramWithNativeHttp(rawUrl: string) {
  console.error(
    "Instagram native HTTP probe ENTER:",
    JSON.stringify({
      platform: Capacitor.getPlatform(),
      isNativePlatform: Capacitor.isNativePlatform(),
    })
  );

  if (!Capacitor.isNativePlatform()) {
    console.error(
      "Instagram native HTTP probe SKIPPED: not native"
    );
    return;
  }

  try {
    const response = await CapacitorHttp.get({
      url: rawUrl,
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
      },
      responseType: "text",
      connectTimeout: 15000,
      readTimeout: 15000,
    });

    const body =
      typeof response.data === "string"
        ? response.data
        : JSON.stringify(response.data ?? "");

    console.error(
      "Instagram native HTTP probe RESULT:",
      JSON.stringify({
        status: response.status,
        finalUrl: response.url,
        bodyLength: body.length,
        hasOgDescription:
          body.toLowerCase().includes("og:description"),
        hasLoginGate:
          body.toLowerCase().includes("/accounts/login"),
      })
    );
  } catch (error) {
    console.error(
      "Instagram native HTTP probe failed:",
      error
    );
  }
}

function getRawSharedValue(params: URLSearchParams): string {
  const knownKeys = [
    "url",
    "text",
    "title",
    "sharedUrl",
    "sharedText",
    "content",
    "message",
    "u",
  ];

  const knownValues = knownKeys
    .map((key) => params.get(key))
    .filter((value): value is string => Boolean(value && value.trim()));

  const allValues = Array.from(params.values()).filter((value) =>
    Boolean(value && value.trim())
  );

  return Array.from(new Set([...knownValues, ...allValues])).join("\n");
}

function countRecipeLines(value: unknown): number {
  const text = String(value || "").trim();

  if (!text || text === SOURCE_STEPS_PLACEHOLDER) {
    return 0;
  }

  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean).length;
}

function getResultSourceUrl(result: any): string {
  return String(
    result?.sourceUrl ||
    result?.importedFromUrl ||
    result?.recipe?.sourceUrl ||
    ""
  );
}

function isIncompleteSocialImport(result: any): boolean {
  const sourceUrl = getResultSourceUrl(result).toLowerCase();

  if (!isCaptionAssistSocialUrl(sourceUrl)) {
    return false;
  }

  const ingredientCount = Array.isArray(result?.ingredients)
    ? result.ingredients.length
    : countRecipeLines(result?.recipe?.ingredients);

  const instructionCount = Array.isArray(result?.instructions)
    ? result.instructions.length
    : countRecipeLines(result?.recipe?.instructions);

  return ingredientCount === 0 && instructionCount === 0;
}

async function importFromUrl(recipeUrl: string, captionText = "") {
  const response = await fetch(`${API_BASE}/import-recipe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: recipeUrl,
      language: getStoredLanguage(),
      ...(captionText.trim() ? { captionText: captionText.trim() } : {}),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Recipe import failed");
  }

  return data;
}

async function importFromPublicVideoUrl(
  videoUrl: string
) {
  const response = await fetch(
    `${API_BASE}/import-video-url`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        url: videoUrl,
        language:
          navigator.language || "en",
      }),
    }
  );

  let data: any;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "Simple Dinners could not read the public video response."
    );
  }

  if (
    !response.ok ||
    !data?.success ||
    !data?.recipe
  ) {
    throw new Error(
      data?.error ||
      "Simple Dinners could not read that Instagram video."
    );
  }

  return data;
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(message));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
  }
}

async function importFromJsonLd(recipeUrl: string, jsonLd: string) {
  const response = await fetch(`${API_BASE}/import-jsonld`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: recipeUrl,
      jsonLd,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "JSON-LD import failed");
  }

  return data;
}

export default function ShareImport() {
  const [params] = useSearchParams();
  const rawSharedValue = getRawSharedValue(params);
  const url = extractFirstUrlFromSharedText(rawSharedValue);

  const navigate = useNavigate();
  const {
    plusLoading,
    requirePlus,
  } = usePlusAccess();

  const [status, setStatus] = useState("Ready to save recipe...");
  const [jsonLdLength, setJsonLdLength] = useState<number | null>(null);
  const [captionAssistResult, setCaptionAssistResult] = useState<any | null>(
    null
  );
  const [captionAssistText, setCaptionAssistText] = useState("");
  const [captionAssistLoading, setCaptionAssistLoading] = useState(false);
  const screenshotInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [screenshotPreviewUrls, setScreenshotPreviewUrls] = useState<string[]>(
    []
  );
  const [screenshotSelectionError, setScreenshotSelectionError] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("");
  const [videoSelectionError, setVideoSelectionError] = useState("");

  useEffect(() => {
    const previewUrls = screenshotFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setScreenshotPreviewUrls(previewUrls);

    return () => {
      previewUrls.forEach((previewUrl) => {
        URL.revokeObjectURL(previewUrl);
      });
    };
  }, [screenshotFiles]);

  useEffect(() => {
    if (!videoFile) {
      setVideoPreviewUrl("");
      return;
    }

    const previewUrl = URL.createObjectURL(videoFile);
    setVideoPreviewUrl(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [videoFile]);

  const finishImport = useCallback(
    (data: any) => {
      setScreenshotFiles([]);
      setScreenshotSelectionError("");
      setVideoFile(null);
      setVideoSelectionError("");
      setStatus(`Recipe found: ${data.recipe.name || data.name || "Recipe"}`);

      setTimeout(() => {
        navigate("/cookbook", {
          replace: true,
          state: {
            sharedImportedRecipe: data.recipe,
          },
        });
      }, 500);
    },
    [navigate]
  );

  function chooseScreenshots() {
    screenshotInputRef.current?.click();
  }

  function chooseVideo() {
    videoInputRef.current?.click();
  }

  function handleScreenshotSelection(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const selectedFiles = Array.from(event.currentTarget.files || []);

    // Allow the same image to be selected again after removal.
    event.currentTarget.value = "";

    if (selectedFiles.length === 0) {
      return;
    }

    const invalidType = selectedFiles.find(
      (file) => !SCREENSHOT_MIME_TYPES.has(file.type)
    );

    if (invalidType) {
      setScreenshotSelectionError(
        "Please choose JPEG, PNG, or WebP screenshots."
      );
      return;
    }

    const oversizedFile = selectedFiles.find(
      (file) => file.size > MAX_SCREENSHOT_FILE_BYTES
    );

    if (oversizedFile) {
      setScreenshotSelectionError(
        `${oversizedFile.name} is larger than 8 MB.`
      );
      return;
    }

    if (
      screenshotFiles.length + selectedFiles.length >
      MAX_SCREENSHOT_FILES
    ) {
      setScreenshotSelectionError(
        `Choose up to ${MAX_SCREENSHOT_FILES} screenshots total.`
      );
      return;
    }

    const combinedFiles = [...screenshotFiles, ...selectedFiles];

    const totalBytes = combinedFiles.reduce(
      (total, file) => total + file.size,
      0
    );

    if (totalBytes > MAX_SCREENSHOT_TOTAL_BYTES) {
      setScreenshotSelectionError(
        "Those screenshots are larger than 25 MB combined. Try fewer or smaller images."
      );
      return;
    }

    setScreenshotFiles(combinedFiles);
    setScreenshotSelectionError("");
    setVideoFile(null);
    setVideoSelectionError("");
  }

  function removeScreenshot(indexToRemove: number) {
    setScreenshotFiles((currentFiles) =>
      currentFiles.filter((_, index) => index !== indexToRemove)
    );

    setScreenshotSelectionError("");
  }

  function handleVideoSelection(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.currentTarget.files?.[0] || null;

    // Allow the same video to be selected again after removal.
    event.currentTarget.value = "";

    if (!selectedFile) {
      return;
    }

    if (!isSupportedVideoFile(selectedFile)) {
      setVideoSelectionError(
        "Please choose an MP4, MOV, WebM, or M4V video."
      );
      return;
    }

    if (selectedFile.size > MAX_VIDEO_FILE_BYTES) {
      setVideoSelectionError(
        `${selectedFile.name} is larger than 75 MB.`
      );
      return;
    }

    setVideoFile(selectedFile);
    setVideoSelectionError("");
    setScreenshotFiles([]);
    setScreenshotSelectionError("");
  }

  function removeVideo() {
    setVideoFile(null);
    setVideoSelectionError("");
  }

  async function finishWithCaptionAssist() {
    if (!captionAssistResult) return;

    if (!captionAssistText.trim()) {
      setStatus("Paste the recipe caption first.");
      return;
    }

    const sourceUrl = getResultSourceUrl(captionAssistResult) || url;

    if (!sourceUrl) {
      setStatus("Missing source link for this recipe.");
      return;
    }

    setCaptionAssistLoading(true);
    setStatus("Finishing recipe from caption...");

    try {
      const cleanedCaptionText = captionAssistText.trim();

      const captionPayload = {
        url: sourceUrl,
        captionText: cleanedCaptionText,
        sharedText: cleanedCaptionText,
      };

      const captionResponse = await fetch(`${API_BASE}/import-recipe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(captionPayload),
      });

      const assistedData = await captionResponse.json();

      if (!captionResponse.ok) {
        throw new Error(
          assistedData?.error || "Caption Assist failed."
        );
      }

      if (!assistedData?.success || !assistedData?.recipe) {
        throw new Error(
          assistedData?.error || "Caption Assist failed."
        );
      }

      const ingredientCount = countRecipeLines(
        assistedData.recipe.ingredients
      );

      const instructionCount = countRecipeLines(
        assistedData.recipe.instructions
      );

      if (ingredientCount === 0 || instructionCount === 0) {
        setStatus(
          "We still couldn't finish this recipe from the caption. Try pasting the full caption, including Ingredients and How to Make."
        );
        return;
      }

      setCaptionAssistResult(null);
      setCaptionAssistText("");
      setScreenshotFiles([]);
      setScreenshotSelectionError("");
      setVideoFile(null);
      setVideoSelectionError("");

      finishImport(assistedData);
    } catch (error) {
      console.error("Caption Assist failed:", error);

      setStatus(
        "We couldn’t finish this recipe from the caption. You can still save it and edit it manually."
      );
    } finally {
      setCaptionAssistLoading(false);
    }
  }

  async function finishWithScreenshotAssist() {
    if (!captionAssistResult) return;

    if (screenshotFiles.length === 0) {
      setScreenshotSelectionError("Choose at least one screenshot.");
      return;
    }

    const sourceUrl = getResultSourceUrl(captionAssistResult) || url;

    const rawSourceTitle = String(
      captionAssistResult?.recipe?.name ||
      captionAssistResult?.name ||
      ""
    ).trim();

    const sourceTitle =
      /^(instagram|tiktok|facebook|social|saved|imported)( recipe)?$/i.test(
        rawSourceTitle
      )
        ? ""
        : rawSourceTitle;

    setCaptionAssistLoading(true);
    setScreenshotSelectionError("");

    setStatus(
      screenshotFiles.length === 1
        ? "Reading recipe screenshot..."
        : `Combining ${screenshotFiles.length} recipe screenshots...`
    );

    try {
      const formData = new FormData();

      screenshotFiles.forEach((file) => {
        formData.append("screenshots", file, file.name);
      });

      if (sourceUrl) {
        formData.append("sourceUrl", sourceUrl);
      }

      if (sourceTitle) {
        formData.append("sourceTitle", sourceTitle);
      }

      formData.append("language", navigator.language || "en");

      const response = await fetch(
        `${API_BASE}/import-screenshots`,
        {
          method: "POST",
          body: formData,
        }
      );

      let data: any;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Simple Dinners could not read the screenshot import response."
        );
      }

      if (!response.ok || !data?.success || !data?.recipe) {
        throw new Error(
          data?.error ||
          "Simple Dinners could not read a recipe from those screenshots."
        );
      }

      const existingPhotoUrl = String(
        captionAssistResult?.recipe?.photoUrl ||
        captionAssistResult?.image ||
        ""
      ).trim();

      const mergedData = {
        ...data,
        recipe: {
          ...data.recipe,
          photoUrl:
            data.recipe.photoUrl || existingPhotoUrl,
          sourceUrl:
            data.recipe.sourceUrl || sourceUrl,
        },
      };

      setCaptionAssistResult(null);
      setCaptionAssistText("");
      setScreenshotFiles([]);
      setScreenshotSelectionError("");
      setVideoFile(null);
      setVideoSelectionError("");

      finishImport(mergedData);
    } catch (error) {
      console.error("Screenshot Assist failed:", error);

      setStatus(
        error instanceof Error
          ? error.message
          : "We couldn’t read a recipe from those screenshots. You can try again or save it as Needs Finishing."
      );
    } finally {
      setCaptionAssistLoading(false);
    }
  }

  async function finishWithVideoAssist() {
    if (!captionAssistResult) return;

    if (!videoFile) {
      setVideoSelectionError("Choose a saved recipe video first.");
      return;
    }

    const sourceUrl = getResultSourceUrl(captionAssistResult) || url;

    setCaptionAssistLoading(true);
    setVideoSelectionError("");
    setStatus("Reading and listening to recipe video...");

    try {
      const formData = new FormData();

      // Keep ordinary fields before the file for multipart processing.
      if (sourceUrl) {
        formData.append("sourceUrl", sourceUrl);
      }

      formData.append("language", navigator.language || "en");
      formData.append("video", videoFile, videoFile.name);

      const response = await fetch(`${API_BASE}/import-video`, {
        method: "POST",
        body: formData,
      });

      let data: any;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Simple Dinners could not read the video import response."
        );
      }

      if (!response.ok || !data?.success || !data?.recipe) {
        throw new Error(
          data?.error ||
          "Simple Dinners could not build a recipe from that video."
        );
      }

      const existingPhotoUrl = String(
        captionAssistResult?.recipe?.photoUrl ||
        captionAssistResult?.image ||
        ""
      ).trim();

      const mergedData = {
        ...data,
        recipe: {
          ...data.recipe,
          photoUrl: data.recipe.photoUrl || existingPhotoUrl,
          sourceUrl: data.recipe.sourceUrl || sourceUrl,
        },
      };

      setCaptionAssistResult(null);
      setCaptionAssistText("");
      setScreenshotFiles([]);
      setScreenshotSelectionError("");
      setVideoFile(null);
      setVideoSelectionError("");

      finishImport(mergedData);
    } catch (error) {
      console.error("Video Assist failed:", error);

      setStatus(
        error instanceof Error
          ? error.message
          : "We couldn’t build a recipe from that video. Try a shorter screen recording that clearly shows or says the ingredients and steps."
      );
    } finally {
      setCaptionAssistLoading(false);
    }
  }

  function saveNeedsFinishing() {
    if (!captionAssistResult) return;

    const fallbackResult = captionAssistResult;

    setCaptionAssistResult(null);
    setCaptionAssistText("");

    finishImport(fallbackResult);
  }

  useEffect(() => {
    async function runShareImport() {
      if (!url) {
        setStatus("No shared URL found.");
        return;
      }

      if (plusLoading) {
        setStatus("Checking Simple Dinners Plus...");
        return;
      }

      try {
        let data;

        const platform = Capacitor.getPlatform();
        const pinterestShare = isPinterestUrl(url);
        const captionAssistSocialShare = isCaptionAssistSocialUrl(url);

        if (
          captionAssistSocialShare &&
          !requirePlus({
            feature: "social-recipe-import",
          })
        ) {
          setStatus("Simple Dinners Plus is required for social recipe importing.");
          return;
        }

        if (pinterestShare) {
          setStatus("Finding the original recipe from Pinterest...");
          data = await importFromUrl(url);
        } else if (captionAssistSocialShare) {
          setStatus("Finding post details...");

          const instagramCaptionText =
            await extractInstagramCaptionForShare(
              url
            );

          data = await importFromUrl(
            url,
            instagramCaptionText
          );
        } else if (platform === "android") {
          try {
            setStatus("Opening recipe page securely to read recipe details...");

            const result = await withTimeout(
              ShareRecipeExtractor.extractJsonLd({ url }),
              12000,
              "Device recipe extraction timed out"
            );

            setJsonLdLength(result.length);
            setStatus("Saving recipe details to Simple Dinners...");

            data = await importFromJsonLd(url, result.jsonLd);

            if (!data?.success || !data?.recipe) {
              throw new Error(data?.error || "JSON-LD import failed");
            }
          } catch {
            setStatus("Trying to find the recipe another way...");
            data = await importFromUrl(url);
          }
        } else {
          setStatus("Finding recipe details...");
          data = await importFromUrl(url);
        }

        if (!data?.success || !data?.recipe) {
          throw new Error(data?.error || "Recipe import failed");
        }

        if (isIncompleteSocialImport(data)) {
          const instagramVideoShare =
            isInstagramVideoUrl(url);

          const tiktokVideoShare =
            isTikTokRecipeUrl(url);

          if (
            instagramVideoShare ||
            tiktokVideoShare
          ) {
            try {
              if (instagramVideoShare) {
                await probeInstagramWithNativeHttp(
                  url
                );
              }

              setStatus(
                instagramVideoShare
                  ? "Reading and listening to the Instagram video..."
                  : "Reading and listening to the TikTok video..."
              );

              const videoData =
                await importFromPublicVideoUrl(
                  url
                );

              const existingPhotoUrl = String(
                data?.recipe?.photoUrl ||
                data?.image ||
                ""
              ).trim();

              const sourceUrl =
                getResultSourceUrl(data) ||
                url;

              const mergedVideoData = {
                ...videoData,

                recipe: {
                  ...videoData.recipe,

                  photoUrl:
                    videoData.recipe.photoUrl ||
                    existingPhotoUrl,

                  sourceUrl:
                    videoData.recipe.sourceUrl ||
                    sourceUrl,
                },
              };

              finishImport(mergedVideoData);
              return;
            } catch (videoError) {
              console.error(
                instagramVideoShare
                  ? "Automatic Instagram video import failed:"
                  : "Automatic TikTok video import failed:",
                videoError
              );

              // Continue into the existing caption,
              // screenshot, and saved-video fallbacks.
            }
          }

          setCaptionAssistResult(data);
          setCaptionAssistText("");
          setScreenshotFiles([]);
          setScreenshotSelectionError("");
          setVideoFile(null);
          setVideoSelectionError("");

          setStatus(
            "We found the post, but not the full recipe text."
          );

          return;
        }

        finishImport(data);
      } catch (error) {
        console.error("Share recipe failed:", error);

        if (isPinterestUrl(url)) {
          setStatus(
            "We couldn’t open this Pinterest link. Try opening the pin, copying the full Pinterest link, and pasting it into Simple Dinners."
          );
          return;
        }

        setStatus(
          "We couldn’t save this shared recipe link. Try copying the recipe link and pasting it into Simple Dinners."
        );
      }
    }

    runShareImport();
  }, [url, finishImport, plusLoading]);

  return (
    <div style={{ padding: 24, paddingBottom: 140, maxWidth: 900, margin: "0 auto" }}>
      <h1>📥 Saving Recipe</h1>

      <p>{status}</p>

      {captionAssistResult && (
        <div
          style={{
            marginTop: 20,
            padding: 18,
            borderRadius: 18,
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.14)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Paste caption to finish</h2>

          <p style={{ lineHeight: 1.5 }}>
            We found the post, but not the full recipe text. Paste the caption text if you can, and Simple Dinners will try to finish the recipe.
          </p>

          <textarea
            value={captionAssistText}
            onChange={(event) => setCaptionAssistText(event.target.value)}
            placeholder="Paste the recipe caption here..."
            rows={9}
            style={{
              width: "100%",
              boxSizing: "border-box",
              borderRadius: 14,
              border: "1px solid rgba(255, 255, 255, 0.22)",
              background: "#0f172a",
              color: "#f8fafc",
              padding: 12,
              fontSize: 16,
              resize: "vertical",
              minHeight: 180,
            }}
          />
          <div
            style={{
              marginTop: 18,
              paddingTop: 18,
              borderTop: "1px solid rgba(255, 255, 255, 0.14)",
            }}
          >
            <h3 style={{ margin: "0 0 6px" }}>Or use screenshots</h3>

            <p
              style={{
                margin: "0 0 12px",
                lineHeight: 1.5,
                opacity: 0.82,
              }}
            >
              Add screenshots showing the ingredients and instructions. Choose them
              in recipe order.
            </p>

            <input
              ref={screenshotInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              multiple
              onChange={handleScreenshotSelection}
              style={{ display: "none" }}
            />

            <button
              type="button"
              onClick={chooseScreenshots}
              disabled={
                captionAssistLoading ||
                screenshotFiles.length >= MAX_SCREENSHOT_FILES
              }
              style={{
                padding: "12px 16px",
                borderRadius: 999,
                border: "1px solid rgba(255, 255, 255, 0.22)",
                background: "rgba(255, 255, 255, 0.08)",
                color: "inherit",
                fontWeight: 700,
                cursor:
                  captionAssistLoading ||
                    screenshotFiles.length >= MAX_SCREENSHOT_FILES
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  captionAssistLoading ||
                    screenshotFiles.length >= MAX_SCREENSHOT_FILES
                    ? 0.55
                    : 1,
              }}
            >
              {screenshotFiles.length > 0
                ? "Add More Screenshots"
                : "Choose Screenshots"}
            </button>

            <span
              style={{
                marginLeft: 10,
                fontSize: 13,
                opacity: 0.72,
              }}
            >
              {screenshotFiles.length} of {MAX_SCREENSHOT_FILES} selected
            </span>

            {screenshotSelectionError && (
              <p
                role="alert"
                style={{
                  margin: "10px 0 0",
                  color: "#fca5a5",
                  fontSize: 14,
                  lineHeight: 1.4,
                }}
              >
                {screenshotSelectionError}
              </p>
            )}

            {screenshotFiles.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(110px, 1fr))",
                  gap: 10,
                  marginTop: 14,
                }}
              >
                {screenshotFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      borderRadius: 14,
                      border: "1px solid rgba(255, 255, 255, 0.16)",
                      background: "rgba(15, 23, 42, 0.7)",
                    }}
                  >
                    <img
                      src={screenshotPreviewUrls[index]}
                      alt={`Recipe screenshot ${index + 1}`}
                      style={{
                        display: "block",
                        width: "100%",
                        aspectRatio: "4 / 5",
                        objectFit: "cover",
                      }}
                    />

                    <div
                      style={{
                        position: "absolute",
                        left: 7,
                        top: 7,
                        minWidth: 26,
                        height: 26,
                        padding: "0 7px",
                        borderRadius: 999,
                        display: "grid",
                        placeItems: "center",
                        background: "rgba(15, 23, 42, 0.88)",
                        color: "#ffffff",
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      {index + 1}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeScreenshot(index)}
                      disabled={captionAssistLoading}
                      aria-label={`Remove screenshot ${index + 1}`}
                      style={{
                        position: "absolute",
                        right: 7,
                        top: 7,
                        width: 30,
                        height: 30,
                        borderRadius: 999,
                        border: 0,
                        background: "rgba(15, 23, 42, 0.88)",
                        color: "#ffffff",
                        fontSize: 18,
                        lineHeight: 1,
                        cursor: captionAssistLoading
                          ? "not-allowed"
                          : "pointer",
                      }}
                    >
                      ×
                    </button>

                    <div
                      style={{
                        padding: "8px 9px",
                        fontSize: 11,
                        opacity: 0.75,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={file.name}
                    >
                      {file.name}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {screenshotFiles.length > 0 && (
              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: 12,
                  opacity: 0.68,
                  lineHeight: 1.4,
                }}
              >
                Screenshot 1 will be read first. You can remove images and select
                them again to change the order.
              </p>
            )}
            {screenshotFiles.length > 0 && (
              <button
                type="button"
                onClick={finishWithScreenshotAssist}
                disabled={captionAssistLoading}
                style={{
                  width: "100%",
                  marginTop: 14,
                  padding: "14px 18px",
                  borderRadius: 16,
                  border: "1px solid rgba(139, 92, 246, 0.45)",
                  background: captionAssistLoading
                    ? "rgba(148, 163, 184, 0.35)"
                    : "rgba(139, 92, 246, 0.18)",
                  color: captionAssistLoading ? "#cbd5e1" : "#ddd6fe",
                  fontWeight: 800,
                  cursor: captionAssistLoading ? "not-allowed" : "pointer",
                }}
              >
                {captionAssistLoading
                  ? "Reading Screenshots..."
                  : "Finish with Screenshots"}
              </button>
            )}
          </div>

          <div
            style={{
              marginTop: 18,
              paddingTop: 18,
              borderTop: "1px solid rgba(255, 255, 255, 0.14)",
            }}
          >
            <h3 style={{ margin: "0 0 6px" }}>Or use a saved video</h3>

            <p
              style={{
                margin: "0 0 12px",
                lineHeight: 1.5,
                opacity: 0.82,
              }}
            >
              Choose a saved recipe clip or screen recording. Simple Dinners will
              read visible recipe text and listen for spoken ingredients and steps.
            </p>

            <input
              ref={videoInputRef}
              type="file"
              accept=".mp4,.mov,.webm,.m4v,video/mp4,video/quicktime,video/webm,video/x-m4v"
              onChange={handleVideoSelection}
              style={{ display: "none" }}
            />

            {!videoFile && (
              <button
                type="button"
                onClick={chooseVideo}
                disabled={captionAssistLoading}
                style={{
                  padding: "12px 16px",
                  borderRadius: 999,
                  border: "1px solid rgba(255, 255, 255, 0.22)",
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "inherit",
                  fontWeight: 700,
                  cursor: captionAssistLoading ? "not-allowed" : "pointer",
                  opacity: captionAssistLoading ? 0.55 : 1,
                }}
              >
                Choose Video
              </button>
            )}

            {videoSelectionError && (
              <p
                role="alert"
                style={{
                  margin: "10px 0 0",
                  color: "#fca5a5",
                  fontSize: 14,
                  lineHeight: 1.4,
                }}
              >
                {videoSelectionError}
              </p>
            )}

            {videoFile && (
              <div
                style={{
                  marginTop: 14,
                  overflow: "hidden",
                  borderRadius: 16,
                  border: "1px solid rgba(255, 255, 255, 0.16)",
                  background: "rgba(15, 23, 42, 0.7)",
                }}
              >
                {videoPreviewUrl && (
                  <video
                    src={videoPreviewUrl}
                    controls
                    preload="metadata"
                    style={{
                      display: "block",
                      width: "100%",
                      maxHeight: 360,
                      background: "#020617",
                    }}
                  />
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: 12,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={videoFile.name}
                    >
                      {videoFile.name}
                    </div>
                    <div style={{ marginTop: 3, fontSize: 12, opacity: 0.68 }}>
                      {formatFileSize(videoFile.size)} · 75 MB maximum
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={removeVideo}
                    disabled={captionAssistLoading}
                    style={{
                      flex: "0 0 auto",
                      padding: "9px 12px",
                      borderRadius: 999,
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      background: "transparent",
                      color: "inherit",
                      fontWeight: 700,
                      cursor: captionAssistLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {videoFile && (
              <button
                type="button"
                onClick={finishWithVideoAssist}
                disabled={captionAssistLoading}
                style={{
                  width: "100%",
                  marginTop: 14,
                  padding: "14px 18px",
                  borderRadius: 16,
                  border: "1px solid rgba(14, 165, 233, 0.45)",
                  background: captionAssistLoading
                    ? "rgba(148, 163, 184, 0.35)"
                    : "rgba(14, 165, 233, 0.18)",
                  color: captionAssistLoading ? "#cbd5e1" : "#bae6fd",
                  fontWeight: 800,
                  cursor: captionAssistLoading ? "not-allowed" : "pointer",
                }}
              >
                {captionAssistLoading
                  ? "Reading Video..."
                  : "Finish with Video"}
              </button>
            )}

            <p
              style={{
                margin: "10px 0 0",
                fontSize: 12,
                opacity: 0.68,
                lineHeight: 1.4,
              }}
            >
              For best results, use a short clip that clearly shows or says the
              ingredients and cooking steps.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 14,
            }}
          >
            <button
              type="button"
              onClick={finishWithCaptionAssist}
              disabled={captionAssistLoading || !captionAssistText.trim()}
              style={{
                padding: "12px 16px",
                borderRadius: 999,
                border: 0,
                background:
                  captionAssistLoading || !captionAssistText.trim()
                    ? "rgba(148, 163, 184, 0.45)"
                    : "#22c55e",
                color: "#ffffff",
                fontWeight: 700,
                cursor:
                  captionAssistLoading || !captionAssistText.trim()
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {captionAssistLoading ? "Finishing..." : "Finish with Caption"}
            </button>

            <button
              type="button"
              onClick={saveNeedsFinishing}
              disabled={captionAssistLoading}
              style={{
                padding: "12px 16px",
                borderRadius: 999,
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "transparent",
                color: "inherit",
                fontWeight: 700,
                cursor: captionAssistLoading ? "not-allowed" : "pointer",
              }}
            >
              Save Needs Finishing
            </button>
          </div>

          <p style={{ fontSize: 13, opacity: 0.72, lineHeight: 1.45 }}>
            Can’t paste the caption? Save it as Needs Finishing and edit the
            ingredients and steps later.
          </p>
        </div>
      )}

      {jsonLdLength !== null && (
        <p>Recipe data found: {jsonLdLength} characters</p>
      )}

      {url && (
        <p style={{ fontSize: 12, opacity: 0.7, wordBreak: "break-all" }}>
          {url}
        </p>
      )}
    </div>
  );
}