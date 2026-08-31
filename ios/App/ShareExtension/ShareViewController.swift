import UIKit
import UniformTypeIdentifiers

class ShareViewController: UIViewController {

    private var hasHandledShare = false

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)

        guard !hasHandledShare else {
            return
        }

        hasHandledShare = true

        findSharedURL { urlString in
            guard let urlString else {
                self.extensionContext?.completeRequest(
                    returningItems: [],
                    completionHandler: nil
                )
                return
            }

            let encoded =
                urlString.addingPercentEncoding(
                    withAllowedCharacters: .urlQueryAllowed
                ) ?? urlString

            if let appUrl = URL(
                string: "simpledinners://share-import?url=\(encoded)"
            ) {
                self.openApp(url: appUrl)
            }

            self.extensionContext?.completeRequest(
                returningItems: [],
                completionHandler: nil
            )
        }
    }

    private func findSharedURL(completion: @escaping (String?) -> Void) {
        guard
            let extensionItems = extensionContext?.inputItems as? [NSExtensionItem]
        else {
            completion(nil)
            return
        }

        for item in extensionItems {
            guard let attachments = item.attachments else { continue }

            for provider in attachments {
                if provider.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
                    provider.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { item, _ in
                        if let url = item as? URL {
                            completion(url.absoluteString)
                        } else if let text = item as? String {
                            completion(text)
                        } else {
                            completion(nil)
                        }
                    }
                    return
                }

                if provider.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) {
                    provider.loadItem(forTypeIdentifier: UTType.plainText.identifier, options: nil) { item, _ in
                        if let text = item as? String {
                            completion(self.firstURL(from: text) ?? text)
                        } else {
                            completion(nil)
                        }
                    }
                    return
                }
            }
        }

        completion(nil)
    }

    private func firstURL(from text: String) -> String? {
        let pattern = #"https?://[^\s]+"#

        guard let regex = try? NSRegularExpression(pattern: pattern) else {
            return nil
        }

        let range = NSRange(text.startIndex..<text.endIndex, in: text)

        guard let match = regex.firstMatch(in: text, range: range),
              let matchRange = Range(match.range, in: text) else {
            return nil
        }

        return String(text[matchRange])
    }

    private func openApp(url: URL) {
        var responder: UIResponder? = self

        while responder != nil {
            if let application = responder as? UIApplication {
                application.open(url, options: [:], completionHandler: nil)
                return
            }

            responder = responder?.next
        }
    }
}
