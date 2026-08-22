import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches render-time exceptions anywhere in the tree and shows a recoverable
 * full-page state instead of a blank screen.
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    console.error("Unhandled UI error:", error);
  }

  private handleReload = () => {
    window.location.href = "/";
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-white flex items-center justify-center px-4">
          <div className="max-w-md text-center">
            <p className="text-[10px] uppercase font-mono tracking-[0.25em] text-brand mb-3">
              Something went wrong
            </p>
            <h1 className="text-2xl font-bold text-black">
              This view failed to load
            </h1>
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">
              An unexpected error occurred while rendering this page. Your data
              is safe — reloading usually resolves it.
            </p>
            <button
              onClick={this.handleReload}
              className="mt-6 px-6 py-3 bg-brand hover:bg-brand-dark text-white text-[11px] uppercase font-mono font-bold tracking-wider transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
