import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep diagnostics local and avoid sending user data to third parties.
    console.error("ARD Workspace application error", error, info.componentStack);
  }

  private handleReset = () => {
    window.location.assign("/");
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="foundation-state" role="alert">
          <div className="foundation-state__content">
            <span className="foundation-state__eyebrow">ARD WORKSPACE</span>
            <h1>Something went wrong</h1>
            <p>The page could not be rendered. Return to the Project Hub and try again.</p>
            <button className="foundation-state__link" onClick={this.handleReset}>
              Return to Project Hub
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
