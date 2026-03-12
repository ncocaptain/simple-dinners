import React from "react";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error;
};

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("🚨 App crashed:", error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            background: "#f9fafb",
          }}
        >
          <div
            style={{
              maxWidth: 520,
              background: "white",
              borderRadius: 12,
              padding: 24,
              boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
              textAlign: "center",
            }}
          >
            <h2 style={{ marginTop: 0 }}>😬 Something went wrong</h2>

            <p style={{ opacity: 0.85 }}>
              Don’t worry — your data is safe.
            </p>

            {this.state.error && (
              <pre
                style={{
                  background: "#111827",
                  color: "#f9fafb",
                  padding: 12,
                  borderRadius: 8,
                  textAlign: "left",
                  overflowX: "auto",
                  fontSize: 12,
                }}
              >
                {this.state.error.message}
              </pre>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16 }}>
              <button
                onClick={this.reset}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: "#2563eb",
                  color: "white",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Try again
              </button>

              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  background: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Reload app
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
