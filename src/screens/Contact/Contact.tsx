import { useState } from "react";
import { Header } from "../../components/Header";
import { SiteFooter } from "../../components/SiteFooter";
import { Reveal } from "../../components/Reveal";
import { SectionLabel, MetaList } from "../../components/editorial";

const CONTACT_EMAIL = "ebenezer.ankudey@gmail.com";

export const Contact = (): JSX.Element => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(form.subject || `Enquiry from ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\n- ${form.name} (${form.email})`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  const fieldClass =
    "w-full bg-transparent border-b border-ink/20 focus:border-ink outline-none py-2.5 text-[14px] text-ink placeholder:text-ink/30 transition-colors duration-200 rounded-none";
  const labelClass = "block font-mono text-[9px] uppercase tracking-[0.22em] text-ink/45 mb-1";

  return (
    <div className="bg-paper min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-[calc(var(--header-h)+56px)] pb-24 px-5 sm:px-8 lg:px-14">
        <Reveal>
          <SectionLabel>Correspondence</SectionLabel>
          <h1 className="mt-4 font-display font-light tracking-[-0.015em] leading-[1.02] text-ink text-[clamp(38px,5.4vw,76px)] max-w-2xl">
            Write to the <em className="italic">archive</em>
          </h1>
          <p className="mt-6 text-[15px] leading-relaxed text-ink/60 max-w-xl">
            Questions about the platform, heritage data contributions,
            collaboration proposals or institutional partnerships.
          </p>
        </Reveal>

        <div className="grid lg:grid-cols-12 gap-x-12 gap-y-12 mt-14">
          {/* Form */}
          <Reveal delay={0.06} className="lg:col-span-7">
            {sent ? (
              <div className="border border-ink/15 p-8">
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-brand">
                  Message composed
                </p>
                <h2 className="mt-3 font-display font-light text-[24px] text-ink">
                  Your email client is opening
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-ink/60">
                  If nothing happened, write directly to{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand hover:underline underline-offset-2">
                    {CONTACT_EMAIL}
                  </a>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-7">
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-7">
                  <div>
                    <label htmlFor="contact-name" className={labelClass}>Name</label>
                    <input id="contact-name" required value={form.name} onChange={set("name")} className={fieldClass} placeholder="Your name" />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className={labelClass}>Email</label>
                    <input id="contact-email" type="email" required value={form.email} onChange={set("email")} className={fieldClass} placeholder="you@example.com" />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-subject" className={labelClass}>Subject</label>
                  <input id="contact-subject" value={form.subject} onChange={set("subject")} className={fieldClass} placeholder="What is this about?" />
                </div>
                <div>
                  <label htmlFor="contact-message" className={labelClass}>Message</label>
                  <textarea id="contact-message" required rows={6} value={form.message} onChange={set("message")} className={`${fieldClass} resize-none`} placeholder="Tell us more…" />
                </div>
                <button
                  type="submit"
                  className="group inline-flex items-center gap-2 bg-ink text-paper px-7 py-3.5 font-mono text-[10px] uppercase tracking-[0.22em] hover:bg-brand transition-colors duration-300"
                >
                  Send message
                  <span className="transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true">→</span>
                </button>
              </form>
            )}
          </Reveal>

          {/* Directory */}
          <Reveal delay={0.12} className="lg:col-span-4 lg:col-start-9">
            <SectionLabel>Directory</SectionLabel>
            <div>
              <MetaList className="border-t border-ink/10">
                <div className="flex items-baseline justify-between gap-6 py-2.5 border-b border-ink/10">
                  <dt className="shrink-0 font-mono text-[9px] uppercase tracking-[0.22em] text-ink/45">Email</dt>
                  <dd className="text-right min-w-0 break-all">
                    <a href={`mailto:${CONTACT_EMAIL}`} className="text-[12px] text-brand hover:underline underline-offset-2 break-all">
                      {CONTACT_EMAIL}
                    </a>
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-6 py-2.5 border-b border-ink/10">
                  <dt className="shrink-0 font-mono text-[9px] uppercase tracking-[0.22em] text-ink/45">Research team</dt>
                  <dd className="text-right text-[12px] text-ink/85 leading-relaxed">
                    Amoah-Yeboah Abena Pokua<br />
                    Ankudey Ebenezer<br />
                    Elorm Dei-Zanga Aku
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-6 py-2.5 border-b border-ink/10">
                  <dt className="shrink-0 font-mono text-[9px] uppercase tracking-[0.22em] text-ink/45">Supervisor</dt>
                  <dd className="text-right text-[12px] text-ink/85">Professor Quaye Ballard</dd>
                </div>
                <div className="flex items-baseline justify-between gap-6 py-2.5">
                  <dt className="shrink-0 font-mono text-[9px] uppercase tracking-[0.22em] text-ink/45">System</dt>
                  <dd className="text-right text-[12px] text-ink/85">Project Work · PostGIS</dd>
                </div>
              </MetaList>
            </div>
          </Reveal>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};
