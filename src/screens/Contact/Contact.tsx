import { useState } from "react";
import { Header } from "../../components/Header";

const CONTACT_EMAIL = "ebenezer.ankudey@gmail.com";

export const Contact = (): JSX.Element => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(form.subject || `Enquiry from ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  const inputClass =
    "w-full px-3 py-2.5 text-sm bg-black/[0.03] rounded-lg border border-black/10 outline-none focus:border-brand transition-colors";
  const labelClass = "block text-[10px] font-bold uppercase tracking-wider text-black/50 mb-1.5";

  return (
    <div className="bg-white w-full min-h-screen">
      <Header />

      <main className="pt-20 pb-16">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand mb-2">
            Get in Touch
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-black tracking-tight">
            Contact the Project Team
          </h1>
          <p className="mt-4 text-gray-700 leading-relaxed max-w-2xl">
            Questions about the platform, heritage data contributions, collaboration proposals, or
            institutional partnerships — we would love to hear from you.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 mt-10">
            {/* Form */}
            <div className="lg:col-span-3">
              {sent ? (
                <div className="rounded-xl border border-black/10 bg-black/[0.02] p-8 text-center">
                  <svg className="w-10 h-10 mx-auto text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <h2 className="text-lg font-bold text-black mt-4">Your email client is opening</h2>
                  <p className="text-sm text-gray-600 mt-2">
                    If nothing happened, write to us directly at{" "}
                    <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand font-semibold hover:underline">
                      {CONTACT_EMAIL}
                    </a>
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className={labelClass}>Name</label>
                      <input id="contact-name" required value={form.name} onChange={set("name")} className={inputClass} placeholder="Your name" />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className={labelClass}>Email</label>
                      <input id="contact-email" type="email" required value={form.email} onChange={set("email")} className={inputClass} placeholder="you@example.com" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="contact-subject" className={labelClass}>Subject</label>
                    <input id="contact-subject" value={form.subject} onChange={set("subject")} className={inputClass} placeholder="What is this about?" />
                  </div>
                  <div>
                    <label htmlFor="contact-message" className={labelClass}>Message</label>
                    <textarea id="contact-message" required rows={6} value={form.message} onChange={set("message")} className={`${inputClass} resize-none`} placeholder="Tell us more…" />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 bg-brand hover:bg-brand-dark text-white text-[11px] uppercase font-mono font-bold tracking-wider transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-2 space-y-6">
              <div className="rounded-xl border border-black/10 p-6">
                <h3 className="text-sm font-bold text-black">Project Epoch — SCHIS</h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  A Spatial Cultural Heritage Information System documenting Ghana's museums,
                  monuments and material culture through geomatics technology.
                </p>
              </div>
              <div className="rounded-xl border border-black/10 p-6 space-y-4">
                <div>
                  <p className="text-[9px] uppercase font-mono tracking-wider text-gray-400">Email</p>
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-sm text-brand font-semibold hover:underline">
                    {CONTACT_EMAIL}
                  </a>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-mono tracking-wider text-gray-400">Research Team</p>
                  <p className="text-sm text-gray-800 mt-0.5">
                    Amoah-Yeboah Abena Pokua<br />
                    Ankudey Ebenezer<br />
                    Elorm Dei-Zanga Aku
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-mono tracking-wider text-gray-400">Supervisor</p>
                  <p className="text-sm text-gray-800 mt-0.5">Professor Quaye Ballard</p>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
};
