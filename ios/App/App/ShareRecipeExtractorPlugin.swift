import Capacitor
import WebKit

@objc(ShareRecipeExtractorPlugin)
public class ShareRecipeExtractorPlugin: CAPPlugin {
    private var extractorWebView: WKWebView?
    private var currentCall: CAPPluginCall?

    private var instagramWebView: WKWebView?
    private var instagramCall: CAPPluginCall?
    private var instagramExtractionScheduled = false


    @objc func extractJsonLd(_ call: CAPPluginCall) {
        guard let urlString = call.getString("url"),
              let url = URL(string: urlString) else {
            call.reject("URL required")
            return
        }

        currentCall = call

        DispatchQueue.main.async {
            let config = WKWebViewConfiguration()
            let hiddenWebView = WKWebView(frame: .zero, configuration: config)

            self.extractorWebView = hiddenWebView
            hiddenWebView.navigationDelegate = self
            hiddenWebView.load(URLRequest(url: url))
        }
    }

    @objc func extractInstagramCaption(_ call: CAPPluginCall) {
        guard
            let urlString = call.getString("url"),
            let url = URL(string: urlString),
            isInstagramURL(url)
        else {
            call.reject("Instagram URL required")
            return
        }

        instagramCall = call
        instagramExtractionScheduled = false

        DispatchQueue.main.async {
            let config = WKWebViewConfiguration()
            let hiddenWebView = WKWebView(
                frame: .zero,
                configuration: config
            )

            hiddenWebView.customUserAgent =
                "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) " +
                "AppleWebKit/605.1.15 (KHTML, like Gecko) " +
                "Version/17.0 Mobile/15E148 Safari/604.1"

            self.instagramWebView = hiddenWebView
            hiddenWebView.navigationDelegate = self
            hiddenWebView.load(URLRequest(url: url))
        }
    }

    private func isInstagramURL(_ url: URL) -> Bool {
        guard
            let scheme = url.scheme?.lowercased(),
            scheme == "http" || scheme == "https",
            let host = url.host?.lowercased()
        else {
            return false
        }

        return host == "instagram.com" ||
            host.hasSuffix(".instagram.com")
    }

    private func finishInstagramExtraction(
        captionText: String,
        photoUrl: String,
        ogTitle: String,
        url: String
    ) {
        instagramCall?.resolve([
            "url": url,
            "captionText": captionText,
            "photoUrl": photoUrl,
            "ogTitle": ogTitle,
            "length": captionText.count
        ])

        instagramCall = nil
        instagramExtractionScheduled = false
        instagramWebView?.navigationDelegate = nil
        instagramWebView = nil
    }

    private func finish(jsonLd: String, url: String) {
        currentCall?.resolve([
            "url": url,
            "jsonLd": jsonLd,
            "length": jsonLd.count
        ])

        currentCall = nil
        extractorWebView?.navigationDelegate = nil
        extractorWebView = nil
    }
}

extension ShareRecipeExtractorPlugin: WKNavigationDelegate {
    public func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        if webView === instagramWebView {
            if instagramExtractionScheduled {
                return
            }

            instagramExtractionScheduled = true

            let instagramScript = """
            (function() {
              const getMeta = (selector) =>
                document.querySelector(selector)?.getAttribute('content') || '';

              return JSON.stringify({
                url: location.href || '',
                captionText: getMeta('meta[name="description"]'),
                photoUrl: getMeta('meta[property="og:image"]'),
                ogTitle: getMeta('meta[property="og:title"]')
              });
            })();
            """

            DispatchQueue.main.asyncAfter(deadline: .now() + 8.0) {
                webView.evaluateJavaScript(instagramScript) { result, _ in
                    let rawJson = result as? String ?? ""

                    var captionText = ""
                    var photoUrl = ""
                    var ogTitle = ""
                    var finalUrl =
                        webView.url?.absoluteString ?? ""

                    if
                        let jsonData = rawJson.data(using: .utf8),
                        let payload =
                            try? JSONSerialization.jsonObject(
                                with: jsonData
                            ) as? [String: Any]
                    {
                        captionText =
                            (payload["captionText"] as? String ?? "")
                            .trimmingCharacters(
                                in: .whitespacesAndNewlines
                            )

                        photoUrl =
                            (payload["photoUrl"] as? String ?? "")
                            .trimmingCharacters(
                                in: .whitespacesAndNewlines
                            )

                        ogTitle =
                            (payload["ogTitle"] as? String ?? "")
                            .trimmingCharacters(
                                in: .whitespacesAndNewlines
                            )

                        let payloadUrl =
                            (payload["url"] as? String ?? "")
                            .trimmingCharacters(
                                in: .whitespacesAndNewlines
                            )

                        if !payloadUrl.isEmpty {
                            finalUrl = payloadUrl
                        }
                    }

                    self.finishInstagramExtraction(
                        captionText: captionText,
                        photoUrl: photoUrl,
                        ogTitle: ogTitle,
                        url: finalUrl
                    )
                }
            }

            return
        }

        let script = """
        (function() {
          function findRecipe(value) {
            if (!value) return null;
            if (Array.isArray(value)) {
              for (const item of value) {
                const found = findRecipe(item);
                if (found) return found;
              }
              return null;
            }
            if (typeof value !== 'object') return null;
            const type = value['@type'];
            const isRecipe = type === 'Recipe' || (Array.isArray(type) && type.includes('Recipe'));
            const looksLikeRecipe = value.recipeIngredient || value.recipeInstructions || value.cookTime || value.prepTime;
            if (isRecipe || looksLikeRecipe) return value;
            for (const key of Object.keys(value)) {
              const found = findRecipe(value[key]);
              if (found) return found;
            }
            return null;
          }

          const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));

          for (const s of scripts) {
            try {
              const parsed = JSON.parse(s.textContent || '');
              const recipe = findRecipe(parsed);
              if (recipe) return JSON.stringify(recipe);
            } catch (e) {}
          }

          return '';
        })();
        """

        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            webView.evaluateJavaScript(script) { result, _ in
                let jsonLd = result as? String ?? ""
                self.finish(jsonLd: jsonLd, url: webView.url?.absoluteString ?? "")
            }
        }
    }
}
