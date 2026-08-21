package com.ncocaptain.simpledinners;

import android.annotation.SuppressLint;
import android.os.Handler;
import android.os.Looper;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "ShareRecipeExtractor")
public class ShareRecipeExtractorPlugin extends Plugin {

    private static final long INSTAGRAM_RENDER_DELAY_MS = 8000L;

    @SuppressLint("SetJavaScriptEnabled")
    @PluginMethod
    public void extractJsonLd(PluginCall call) {
        String url = call.getString("url");

        if (url == null || url.trim().isEmpty()) {
            call.reject("URL required");
            return;
        }

        getActivity().runOnUiThread(() -> {
            WebView webView = new WebView(getContext());

            WebSettings settings = webView.getSettings();
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
            settings.setUserAgentString(
                "Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36"
            );

            webView.setWebViewClient(new WebViewClient() {
                private boolean extracted = false;

                @Override
                public void onPageFinished(WebView view, String finishedUrl) {
                    if (extracted) return;
                    extracted = true;

                    new Handler(Looper.getMainLooper()).postDelayed(() -> {
                        String script =
                            "(function() {" +
                            "  function findRecipe(value) {" +
                            "    if (!value) return null;" +
                            "    if (Array.isArray(value)) {" +
                            "      for (const item of value) {" +
                            "        const found = findRecipe(item);" +
                            "        if (found) return found;" +
                            "      }" +
                            "      return null;" +
                            "    }" +
                            "    if (typeof value !== 'object') return null;" +
                            "    const type = value['@type'];" +
                            "    const isRecipe = type === 'Recipe' || (Array.isArray(type) && type.includes('Recipe'));" +
                            "    const looksLikeRecipe = value.recipeIngredient || value.recipeInstructions || value.cookTime || value.prepTime;" +
                            "    if (isRecipe || looksLikeRecipe) return value;" +
                            "    for (const key of Object.keys(value)) {" +
                            "      const found = findRecipe(value[key]);" +
                            "      if (found) return found;" +
                            "    }" +
                            "    return null;" +
                            "  }" +
                            "  const scripts = Array.from(document.querySelectorAll('script[type=\"application/ld+json\"]'));" +
                            "  for (const s of scripts) {" +
                            "    try {" +
                            "      const parsed = JSON.parse(s.textContent || '');" +
                            "      const recipe = findRecipe(parsed);" +
                            "      if (recipe) return JSON.stringify(recipe);" +
                            "    } catch (e) {}" +
                            "  }" +
                            "  return '';" +
                            "})();";

                        view.evaluateJavascript(script, value -> {
                            String cleanedJsonLd = value == null ? "" : value;

                            if (cleanedJsonLd.startsWith("\"") && cleanedJsonLd.endsWith("\"")) {
                                cleanedJsonLd = cleanedJsonLd.substring(1, cleanedJsonLd.length() - 1)
                                    .replace("\\n", "\n")
                                    .replace("\\\"", "\"")
                                    .replace("\\\\", "\\");
                            }

                            JSObject result = new JSObject();
                            result.put("url", finishedUrl);
                            result.put("jsonLd", cleanedJsonLd);
                            result.put("length", cleanedJsonLd.length());

                            call.resolve(result);

                            try {
                                webView.destroy();
                            } catch (Exception ignored) {
                            }
                        });
                    }, 5000);
                }
            });

            webView.loadUrl(url.trim());
        });
    }

    @SuppressLint("SetJavaScriptEnabled")
    @PluginMethod
    public void extractInstagramCaption(PluginCall call) {
        String url = call.getString("url");

        if (url == null || url.trim().isEmpty()) {
            call.reject("URL required");
            return;
        }

        String trimmedUrl = url.trim();

        if (!isInstagramUrl(trimmedUrl)) {
            call.reject("Instagram URL required");
            return;
        }

        getActivity().runOnUiThread(() -> {
            WebView webView = new WebView(getContext());

            WebSettings settings = webView.getSettings();
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
            settings.setUserAgentString(
                "Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36"
            );

            webView.setWebViewClient(new WebViewClient() {
                private boolean extractionScheduled = false;

                @Override
                public boolean shouldOverrideUrlLoading(
                    WebView view,
                    android.webkit.WebResourceRequest request
                ) {
                    String scheme = request.getUrl().getScheme();

                    if (
                        "http".equalsIgnoreCase(scheme) ||
                        "https".equalsIgnoreCase(scheme)
                    ) {
                        return false;
                    }

                    // Keep Instagram from replacing the rendered HTTPS page
                    // with an instagram:// app deep link.
                    return true;
                }

                @Override
                public void onPageStarted(
                    WebView view,
                    String startedUrl,
                    android.graphics.Bitmap favicon
                ) {
                    if (extractionScheduled) return;
                    extractionScheduled = true;

                    new Handler(Looper.getMainLooper()).postDelayed(() -> {
                        String script =
                            "(function() {" +
                            "  const getMeta = (selector) =>" +
                            "    document.querySelector(selector)?.getAttribute('content') || '';" +
                            "  return JSON.stringify({" +
                            "    url: location.href || ''," +
                            "    captionText: getMeta('meta[name=\"description\"]')," +
                            "    photoUrl: getMeta('meta[property=\"og:image\"]')," +
                            "    ogTitle: getMeta('meta[property=\"og:title\"]')" +
                            "  });" +
                            "})();";

                        view.evaluateJavascript(script, value -> {
                            try {
                                String rawJson = decodeJavascriptString(value);
                                org.json.JSONObject payload = rawJson.isEmpty()
                                    ? new org.json.JSONObject()
                                    : new org.json.JSONObject(rawJson);

                                String captionText = payload.optString("captionText", "").trim();
                                String photoUrl = payload.optString("photoUrl", "").trim();
                                String ogTitle = payload.optString("ogTitle", "").trim();
                                String finalUrl = payload.optString("url", "").trim();

                                if (finalUrl.isEmpty()) {
                                    finalUrl = view.getUrl() == null ? trimmedUrl : view.getUrl();
                                }

                                JSObject result = new JSObject();
                                result.put("url", finalUrl);
                                result.put("captionText", captionText);
                                result.put("photoUrl", photoUrl);
                                result.put("ogTitle", ogTitle);
                                result.put("length", captionText.length());

                                call.resolve(result);
                            } catch (Exception error) {
                                call.reject("Could not read Instagram page metadata.");
                            } finally {
                                try {
                                    webView.destroy();
                                } catch (Exception ignored) {
                                }
                            }
                        });
                    }, INSTAGRAM_RENDER_DELAY_MS);
                }
            });

            webView.loadUrl(trimmedUrl);
        });
    }

    private boolean isInstagramUrl(String rawUrl) {
        try {
            android.net.Uri uri = android.net.Uri.parse(rawUrl);
            String scheme = uri.getScheme();
            String host = uri.getHost();

            if (
                scheme == null ||
                host == null ||
                !("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme))
            ) {
                return false;
            }

            String normalizedHost = host.toLowerCase();

            return normalizedHost.equals("instagram.com") ||
                normalizedHost.endsWith(".instagram.com");
        } catch (Exception ignored) {
            return false;
        }
    }

    private String decodeJavascriptString(String value) {
        if (value == null || value.trim().isEmpty() || "null".equals(value)) {
            return "";
        }

        try {
            Object decoded = new org.json.JSONTokener(value).nextValue();
            return decoded instanceof String ? (String) decoded : "";
        } catch (Exception ignored) {
            return "";
        }
    }
}
