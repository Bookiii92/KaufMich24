import SwiftUI
import WebKit

@main
struct KaufMich24App: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

final class BrowserModel: ObservableObject {
    static let homeURL = URL(string: "https://kaufmich24.ch/")!

    @Published var currentURL = BrowserModel.homeURL
    @Published var canGoBack = false
    @Published var isLoading = false
    @Published var loadFailed = false

    weak var webView: WKWebView?

    func sync(from webView: WKWebView) {
        currentURL = webView.url ?? Self.homeURL
        canGoBack = webView.canGoBack
    }

    func back() { webView?.goBack() }
    func home() { webView?.load(URLRequest(url: Self.homeURL)) }
    func refresh() { webView?.reload() }
}

struct WebsiteView: UIViewRepresentable {
    @ObservedObject var model: BrowserModel

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()
        config.allowsInlineMediaPlayback = true

        let browser = WKWebView(frame: .zero, configuration: config)
        browser.navigationDelegate = context.coordinator
        browser.uiDelegate = context.coordinator
        browser.allowsBackForwardNavigationGestures = true

        let refresh = UIRefreshControl()
        refresh.addTarget(context.coordinator, action: #selector(Coordinator.pullToRefresh), for: .valueChanged)
        browser.scrollView.refreshControl = refresh

        model.webView = browser
        browser.load(URLRequest(url: BrowserModel.homeURL))
        return browser
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    func makeCoordinator() -> Coordinator { Coordinator(model: model) }

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        private let model: BrowserModel

        init(model: BrowserModel) { self.model = model }

        @objc func pullToRefresh() { model.refresh() }

        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            model.isLoading = true
            model.loadFailed = false
            model.sync(from: webView)
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            model.isLoading = false
            model.loadFailed = false
            model.sync(from: webView)
            webView.scrollView.refreshControl?.endRefreshing()
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            finishWithError(error, webView: webView)
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            finishWithError(error, webView: webView)
        }

        private func finishWithError(_ error: Error, webView: WKWebView) {
            if (error as NSError).code == NSURLErrorCancelled { return }
            model.isLoading = false
            model.loadFailed = true
            model.sync(from: webView)
            webView.scrollView.refreshControl?.endRefreshing()
        }

        // Open target=_blank inside the same web context until OAuth is fully
        // tested and the web app supports an explicit native auth callback.
        func webView(_ webView: WKWebView,
                     createWebViewWith configuration: WKWebViewConfiguration,
                     for navigationAction: WKNavigationAction,
                     windowFeatures: WKWindowFeatures) -> WKWebView? {
            if navigationAction.targetFrame == nil {
                webView.load(navigationAction.request)
            }
            return nil
        }
    }
}

struct ContentView: View {
    @StateObject private var browser = BrowserModel()

    var body: some View {
        NavigationStack {
            ZStack {
                WebsiteView(model: browser)
                if browser.loadFailed {
                    VStack(spacing: 12) {
                        Image(systemName: "wifi.exclamationmark")
                            .font(.largeTitle)
                        Text("Verbindung fehlgeschlagen")
                            .font(.headline)
                        Text("Bitte Internetverbindung prüfen und erneut versuchen.")
                            .multilineTextAlignment(.center)
                        Button("Erneut versuchen") { browser.refresh() }
                            .buttonStyle(.borderedProminent)
                    }
                    .padding(24)
                    .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
                    .padding()
                }
            }
            .navigationTitle("KaufMich24")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItemGroup(placement: .bottomBar) {
                    Button { browser.back() } label: {
                        Label("Zurück", systemImage: "chevron.left")
                    }
                    .disabled(!browser.canGoBack)
                    Spacer()
                    Button { browser.home() } label: {
                        Label("Start", systemImage: "house")
                    }
                    Button { browser.refresh() } label: {
                        Label("Aktualisieren", systemImage: "arrow.clockwise")
                    }
                    Spacer()
                    ShareLink(item: browser.currentURL) {
                        Label("Teilen", systemImage: "square.and.arrow.up")
                    }
                }
            }
            .overlay(alignment: .top) {
                if browser.isLoading {
                    ProgressView().progressViewStyle(.linear)
                }
            }
        }
    }
}
