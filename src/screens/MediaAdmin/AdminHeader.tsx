import { Link } from "react-router-dom";

interface AdminHeaderProps {
  breadcrumb?: string;
  onSignOut: () => void;
}

export const AdminHeader = ({ breadcrumb, onSignOut }: AdminHeaderProps): JSX.Element => {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white z-[100] flex items-center border-b border-hairline">
      <div className="w-full px-4 sm:px-6 flex items-center gap-4">
        <Link
          to="/"
          aria-label="Project Work — home"
          className="flex items-center gap-2 shrink-0 text-ink"
        >
          <span aria-hidden="true" className="h-3 w-3 shrink-0 bg-current" />
          <span className="font-sans font-medium text-[16px] leading-none tracking-[-0.01em]">
            Project Work
          </span>
        </Link>

        <span className="h-4 w-px bg-hairline" aria-hidden="true" />

        <nav aria-label="Admin location" className="flex items-center gap-1.5 min-w-0 text-[13px]">
          <span className="text-ink-soft shrink-0">Admin</span>
          <span aria-hidden="true" className="text-ink/30 shrink-0">
            /
          </span>
          <span className="text-ink truncate">{breadcrumb}</span>
        </nav>

        <div className="flex-1" />

        <Link
          to="/"
          className="f-caption text-ink-soft hover:text-ink transition-colors duration-200 ease-house inline-flex items-center gap-1.5 shrink-0"
        >
          <span aria-hidden="true">←</span>
          <span className="hidden sm:inline">View site</span>
          <span className="sm:hidden">Site</span>
        </Link>

        <span className="h-4 w-px bg-hairline" aria-hidden="true" />

        <button
          type="button"
          onClick={onSignOut}
          className="f-caption text-ink-soft hover:text-brand transition-colors duration-200 ease-house inline-flex items-center gap-1.5 shrink-0 disabled:cursor-not-allowed"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-7.5A2.25 2.25 0 003.75 5.25v13.5A2.25 2.25 0 006 21h7.5a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
            />
          </svg>
          <span className="hidden sm:inline">Sign out</span>
          <span className="sr-only sm:hidden">Sign out</span>
        </button>
      </div>
    </header>
  );
};
