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
}