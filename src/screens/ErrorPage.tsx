import { useEffect } from "react";
import { Link, useRouteError, isRouteErrorResponse } from "react-router-dom";
import { Header } from "../components/Header";

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
    document.title = `${title} — SCHIS`;
  }, [title]);

  return (
    <div className="bg-white w-full min-h-screen">
      <Header />

      <main className="flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="max-w-lg mx-auto text-center">
          <div className="mb-8">
            <span className="inline-block text-[120px] sm:text-[160px] font-black text-brand/10 leading-none select-none">
              {statusCode}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-black mb-3">
            {title}
          </h1>
          <p className="text-black/60 text-sm sm:text-base leading-relaxed mb-8 max-w-md mx-auto">
            {message}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-brand text-white text-[11px] uppercase font-bold tracking-wider px-6 py-3 hover:bg-[#C0392B] transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Back to Home
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 border border-black/15 text-black text-[11px] uppercase font-bold tracking-wider px-6 py-3 hover:bg-black/[0.03] transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </button>
          </div>

          {statusCode === 404 && (
            <div className="mt-12 pt-8 border-t border-black/10">
              <p className="text-[10px] uppercase font-bold text-black/30 mb-3">
                Quick links
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                {[
                  { label: "Catalogue", to: "/case-studies" },
                  { label: "Map", to: "/map" },
                  { label: "Gallery", to: "/gallery" },
                  { label: "About", to: "/about" },
                  { label: "Contact", to: "/contact" },
                ].map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-[11px] uppercase font-bold text-black/40 hover:text-brand transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

ErrorPage.displayName = "ErrorPage";
