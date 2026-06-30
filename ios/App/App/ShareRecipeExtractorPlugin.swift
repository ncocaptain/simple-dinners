import Capacitor
import WebKit

@objc(ShareRecipeExtractorPlugin)
public class ShareRecipeExtractorPlugin: CAPPlugin {
    private var extractorWebView: WKWebView?
    private var currentCall: CAPPluginCall?

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
