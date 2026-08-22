import { Link } from "react-router-dom";

interface AdminHeaderProps {
  breadcrumb?: string;
}

export const AdminHeader = ({ breadcrumb }: AdminHeaderProps): JSX.Element => {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-[#1A1A1A] z-[100] flex items-center px-6 border-b border-white/10">
      <div className="flex items-center gap-4 w-full">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="font-black text-base text-brand">SCHIS</span>
        </Link>

        <div className="h-4 w-px bg-white/20" />

        <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Admin</span>

        {breadcrumb && (
          <>
            <div className="h-4 w-px bg-white/20" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">{breadcrumb}</span>
          </>
        )}

        <div className="flex-1" />

        <Link
          to="/"
          className="text-[10px] font-bold uppercase tracking-wider text-white/50 hover:text-white transition-colors flex items-center gap-1.5"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Site
        </Link>
      </div>
    </header>
  );
};
