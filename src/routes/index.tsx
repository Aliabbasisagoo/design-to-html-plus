import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import hero from "@/assets/hero.jpg";
import { ConcernHelper } from "@/components/ConcernHelper";

const WHATSAPP = "923499690647";
const PHONE = "+92 349 9690647";
const ADDRESS = "Office No. 11, 3rd Floor, Plot #12 N, Pakland Square, G-8 Markaz, Islamabad 44090";
const LANDMARK = "Pakland Square, G-8 Markaz";
const MAPS = "https://www.google.com/maps/place/Bite+Squad+Dental+Studio+Islamabad+G-8+Markaz/@33.6967052,73.0488842,17z/data=!3m1!4b1!4m6!3m5!1s0x38dfbf025e15c5f7:0x63f2cc33348ef90f!8m2!3d33.6967052!4d73.0514645!16s%2Fg%2F11njb8dc0b";
const wa = (t?: string) => `https://wa.me/${WHATSAPP}${t ? `?text=${encodeURIComponent(t)}` : ""}`;

const desc = `Trusted dental clinic in Islamabad with 5+ years experience. Checkups, cleaning, whitening, braces, implants. Book on WhatsApp ${PHONE}.`;
const title = "Smile Care Dental Clinic | Dentist in Islamabad — Book Appointment";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const services = [
  ["🩺", "Dental Checkup & Consultation", "Routine exams, X-rays, and treatment planning."],
  ["✨", "Teeth Cleaning (Scaling & Polishing)", "Professional cleaning to remove plaque and stains."],
  ["😁", "Teeth Whitening", "Safe, in-clinic whitening for a brighter smile."],
  ["🦷", "Fillings & Root Canal", "Tooth-colored fillings and painless root canal treatment."],
  ["🪥", "Tooth Extraction", "Simple and surgical extractions by experienced dentists."],
  ["😬", "Braces & Aligners", "Metal, ceramic, and clear aligner options."],
  ["🔩", "Dental Implants", "Permanent replacement for missing teeth."],
  ["👑", "Crowns & Bridges", "Restore damaged or missing teeth with custom fittings."],
  ["🧒", "Kids Dentistry", "Gentle, friendly dental care for children."],
  ["🚑", "Emergency Dental Care", "Same-day care for pain, swelling, or broken teeth."],
];
const why = [["🏅", "5+ Years of Experience"], ["👩‍⚕️", "Experienced Dentists"], ["🔬", "Modern Equipment"], ["🧼", "Clean & Sterile Environment"]];
const hours = [
  ["Monday – Friday", "9:00 AM – 1:00 PM · 3:00 PM – 8:00 PM"],
  ["Saturday", "10:00 AM – 2:00 PM"],
  ["Sunday", "Closed"],
];
const nav = [["Home", "#home"], ["Services", "#services"], ["Timings", "#timings"], ["About", "#about"], ["Contact", "#contact"]];

const btn = "inline-flex min-h-11 items-center justify-center rounded-lg px-5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const primary = `${btn} bg-primary text-primary-foreground hover:bg-primary/90`;
const outline = `${btn} border border-primary text-primary bg-background hover:bg-accent`;

function Index() {
  const [open, setOpen] = useState(false);
  return (
    <div id="home">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <a href="#home" className="font-[Poppins] text-lg font-semibold text-primary">Smile Care Dental Clinic</a>
          <nav className="hidden gap-6 md:flex">
            {nav.map(([l, h]) => <a key={h} href={h} className="text-sm hover:text-primary">{l}</a>)}
          </nav>
          <a href={wa()} target="_blank" rel="noopener" className={`${primary} hidden md:inline-flex`}>Book Appointment</a>
          <button aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)} className="min-h-11 min-w-11 text-2xl md:hidden">☰</button>
        </div>
        {open && (
          <nav className="flex flex-col border-t px-4 pb-4 md:hidden">
            {nav.map(([l, h]) => <a key={h} href={h} onClick={() => setOpen(false)} className="py-3">{l}</a>)}
            <a href={wa()} target="_blank" rel="noopener" className={primary}>Book Appointment</a>
          </nav>
        )}
      </header>

      <section className="relative">
        <img src={hero} alt="Bright, clean reception area of a modern dental clinic" width={1600} height={1008} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-background/80 md:bg-gradient-to-r md:from-background md:via-background/85 md:to-background/10" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 md:py-36">
          <h1 className="max-w-xl text-4xl font-bold md:text-5xl">Healthy Smiles, Expert Care</h1>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">Trusted dental care in Islamabad for 5+ years. Book your appointment today.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={wa()} target="_blank" rel="noopener" className={primary}>Book on WhatsApp</a>
            <a href="#services" className={outline}>View Services</a>
          </div>
        </div>
      </section>

      <section id="services" className="scroll-mt-16 bg-secondary py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-semibold">Our Services</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map(([i, n, d]) => (
              <div key={n} className="flex flex-col rounded-xl border bg-card p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-2xl" aria-hidden>{i}</div>
                <h3 className="mt-4 text-lg font-semibold">{n}</h3>
                <p className="mt-1 flex-1 text-muted-foreground">{d}</p>
                <a href={wa(`Hi, I want to book ${n}`)} target="_blank" rel="noopener" className={`${outline} mt-5`}>Book on WhatsApp</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ConcernHelper wa={wa} btnPrimary={primary} />

      <section className="bg-secondary py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-semibold">Why Choose Us</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {why.map(([i, t]) => (
              <div key={t} className="rounded-xl bg-accent p-6 text-center">
                <div className="text-3xl" aria-hidden>{i}</div>
                <p className="mt-3 font-semibold">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="timings" className="scroll-mt-16 py-16">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-center text-3xl font-semibold">Clinic Hours</h2>
          <div className="mt-8 divide-y rounded-xl border bg-card">
            {hours.map(([d, h]) => (
              <div key={d} className="flex flex-col justify-between gap-1 p-5 sm:flex-row">
                <span className="font-semibold">{d}</span><span className="text-muted-foreground">{h}</span>
              </div>
            ))}
            <div className="flex flex-col justify-between gap-1 p-5 sm:flex-row">
              <span className="font-semibold">Emergency</span>
              <span>Available on call — <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="font-medium text-primary underline">{PHONE}</a></span>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="scroll-mt-16 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-semibold">About Smile Care Dental Clinic</h2>
          <p className="mt-6 text-lg text-muted-foreground">Smile Care Dental Clinic has been providing trusted dental care in Islamabad for 5+ years. Our team of qualified dentists uses modern equipment and follows strict hygiene standards to keep your smile healthy.</p>
        </div>
      </section>

      <section id="contact" className="scroll-mt-16 bg-accent py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-semibold">Book Your Appointment</h2>
          <a href={wa()} target="_blank" rel="noopener" className={`${primary} mt-8 min-h-14 px-8 text-lg`}>Chat on WhatsApp — {PHONE}</a>
          <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
            <p><strong>Phone:</strong> <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="text-primary underline">{PHONE}</a></p>
            <p><strong>Address:</strong> {ADDRESS}</p>
            <p><strong>Landmark:</strong> {LANDMARK}</p>
            <p><a href={MAPS} target="_blank" rel="noopener" className="text-primary underline">Open in Google Maps</a></p>
            <p className="sm:col-span-2"><strong>Timings:</strong> Mon–Fri 9–1 & 3–8 · Sat 10–2 · Sun closed</p>
          </div>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Smile Care Dental Clinic</p>
        <p className="mt-2">WhatsApp / Phone: {PHONE} · {ADDRESS}</p>
        <p className="mt-2">© 2026 Smile Care Dental Clinic. All rights reserved.</p>
      </footer>
    </div>
  );
}
