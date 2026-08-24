import { useEffect } from "react";
import { Link, useRouteError, isRouteErrorResponse } from "react-router-dom";
import { Header } from "../components/Header";
import { SectionLabel } from "../components/editorial";

export const ErrorPage = (): JSX.Element => {
  const error = useRouteError();

  let title = "Something went wrong";
  let message = "An unexpected error occurred. Please try again.";
  let statusCode = 500;

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    if (error.status === 404) {
      title = "Page not found";
      message =
        "The page you're looking for doesn't exist or has been moved.";
    } else if (error.status === 403) {
      title = "Access denied";
      message = "You don't have permission to view this page.";
    } else {
      title = `Error ${error.status}`;
      message = error.statusText || message;
    }
  }

  useEffect(() => {
    document.title = `${title} — Project Work`;
  }, [title]);

  return (
    <div className="bg-paper w-full min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center px-5 sm:px-8 lg:px-14 pt-[var(--header-h)] pb-16">
        <div className="w-full max-w-2xl">
          <p
            aria-hidden="true"
            className="font-display font-light leading-none text-ink/[0.07] text-[clamp(120px,22vw,240px)] select-none tabular-nums -ml-2"
          >
            {statusCode}
          </p>

          <div className="-mt-[clamp(30px,7vw,80px)]">
            <SectionLabel>Error {statusCode}</SectionLabel>
            <h1 className="mt-4 font-display font-light tracking-[-0.01em] leading-tight text-ink text-[clamp(28px,3.6vw,44px)]">
              {title}
            </h1>
            <p className="mt-3 text-[14px] leading-relaxed text-ink/60 max-w-md">
              {message}
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

            {statusCode === 404 && (
              <nav
                aria-label="Quick links"
                className="mt-14 pt-6 border-t border-ink/10"
              >
                <p className="font-mono text-[8.5px] uppercase tracking-[0.26em] text-ink/40 mb-4">
                  ( Wayfinding )
                </p>
                <div className="flex flex-wrap gap-x-7 gap-y-2">
                  {[
                    { label: "Catalogue", to: "/case-studies" },
                    { label: "Atlas", to: "/map" },
                    { label: "Research", to: "/research" },
                    { label: "About", to: "/about" },
                    { label: "Contact", to: "/contact" },
                  ].map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/45 hover:text-brand transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </nav>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

ErrorPage.displayName = "ErrorPage";
