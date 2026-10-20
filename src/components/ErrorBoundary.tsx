import React from "react";
import { Link } from "react-router-dom";
import { Header } from "./Header";
import { SectionLabel } from "./editorial";
import { Reveal } from "./Reveal";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches render-time exceptions anywhere in the tree and shows a recoverable
 * full-page state instead of a blank screen. Layout mirrors ErrorPage.tsx —
 * the Pentagram editorial system: giant ghost numeral, parenthesised label,
 * display heading, underline-only link actions.
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

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="bg-paper w-full min-h-screen flex flex-col">
          <Header />

          <main className="flex-1 flex items-center px-5 sm:px-8 lg:px-14 pt-[calc(var(--header-h)+40px)] pb-16">
            <div className="w-full max-w-2xl">
              <Reveal>
                <p
                  aria-hidden="true"
                  className="font-display font-light leading-none text-ink/[0.07] text-[clamp(120px,22vw,240px)] select-none tabular-nums -ml-2"
                >
                  500
                </p>
              </Reveal>

              <Reveal delay={0.08}>
                <div className="-mt-[clamp(30px,7vw,80px)]">
                  <SectionLabel>Error 500</SectionLabel>
                  <h1 className="mt-4 font-display font-light tracking-[-0.01em] leading-tight text-ink text-[clamp(28px,3.6vw,44px)]">
                    This view failed to load
                  </h1>
                  <p className="mt-3 text-[14px] leading-relaxed text-ink/60 max-w-md">
                    An unexpected error occurred while rendering this page. Your
                    data is safe — reloading usually resolves it.
                  </p>

                  <div className="mt-9 flex flex-wrap gap-x-8 gap-y-3">
                    <Link
                      to="/"
                      className="group inline-flex items-baseline gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-ink border-b border-ink pb-1 hover:text-brand hover:border-brand transition-colors duration-300"
                    >
                      Return home
                    </Link>
                    <button
                      onClick={() => window.location.reload()}
                      className="inline-flex items-baseline gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-ink/50 border-b border-transparent pb-1 hover:text-ink transition-colors duration-300"
                    >
                      Try again ↻
                    </button>
                  </div>
                </div>
              </Reveal>
            </div>
          </main>
        </div>
      );
    }
    return this.props.children;
  }
}
