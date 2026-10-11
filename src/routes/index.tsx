import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, ArrowDown, Phone, MapPin, Menu, X, Star, MoveUpRight, Clock, Plus, Minus, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DentalScene } from "@/components/DentalScene";
import { clinic } from "@/lib/clinic";
import clinicPhoto from "@/assets/cosmetico-clinic.jpg.asset.json";
import stillLife from "@/assets/dental-still-life.jpg";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Cosmetico Dental Clinic | F-7 Markaz, Islamabad" },
    { name: "description", content: "Visit Cosmetico Dental Clinic in F-7 Markaz, Islamabad. Call +92 339 8480200. Open Monday–Saturday, 10 AM–6 PM." },
    { property: "og:title", content: "Cosmetico Dental Clinic — Islamabad" },
    { property: "og:description", content: "Dental care in F-7 Markaz. Explore our clinic and call to arrange your visit." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

const nav = [["The clinic", "#clinic"], ["Your visit", "#visit"], ["Patient stories", "#reviews"]];
const faqs = [
  ["How do I book an appointment?", "Call +92 339 8480200 to speak with the clinic and confirm a convenient appointment time."],
  ["Where is the clinic located?", "Cosmetico Dental Clinic is at Cosmetico by Dr Kamal, F-7 Markaz, Islamabad, 44210. Use our directions link to open the exact Google Maps location."],
  ["When can I visit?", "The Google listing shows Monday to Saturday, 10:00 AM to 6:00 PM, with Sunday closed. Please call ahead to confirm your appointment."],
  ["Can I ask about treatments and fees?", "Yes. Call the clinic to discuss your dental concern, available treatments, and current fees. Your dentist will advise after an assessment."],
];
function Index() {
  const [menu, setMenu] = useState(false);
  const [faq, setFaq] = useState<number | null>(0);
  return <main>
    <a href="#home" className="skip-link">Skip to clinic content</a>
    <header className="relative z-20 border-b border-primary/10 bg-background">
      <div className="mx-auto grid h-[86px] max-w-[1400px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 sm:flex sm:justify-between md:px-12">
        <a href="#home" className="flex min-w-0 items-center gap-3 text-primary" aria-label="Cosmetico Dental Clinic home">
          <Sparkles className="size-8 shrink-0" strokeWidth={1.4} />
          <span className="min-w-0 text-xl font-bold leading-tight">cosmetico<span className="block text-[9px] font-medium uppercase tracking-[0.18em]">Dental Clinic · Islamabad</span></span>
        </a>
        <nav className="hidden items-center gap-8 lg:flex">{nav.map(([label, href]) => <a className="text-sm text-muted-foreground transition-colors hover:text-primary" href={href} key={href}>{label}</a>)}</nav>
        <div className="flex shrink-0 items-center gap-2">
          <Button asChild className="hidden h-11 rounded-full px-6 sm:inline-flex"><a href={`tel:${clinic.telephone}`}>Book a visit <ArrowUpRight /></a></Button>
           <Button variant="ghost" size="icon" className="size-11 lg:hidden" aria-label={menu ? "Close menu" : "Open menu"} aria-expanded={menu} aria-controls="clinic-navigation" onClick={() => setMenu(!menu)} onKeyDown={event => { if (event.key === "Escape") setMenu(false); }}>{menu ? <X /> : <Menu />}</Button>
        </div>
      </div>
       {menu && <nav id="clinic-navigation" aria-label="Clinic navigation" className="absolute inset-x-0 top-full flex flex-col gap-2 border-b bg-background p-6 lg:hidden" onKeyDown={event => { if (event.key === "Escape") { setMenu(false); document.querySelector<HTMLButtonElement>('[aria-controls="clinic-navigation"]')?.focus(); } }}>{nav.map(([l, h]) => <a className="flex min-h-11 items-center" key={h} href={h} onClick={() => setMenu(false)}>{l}</a>)}<a className="flex min-h-11 items-center" href={`tel:${clinic.telephone}`}>Call to book</a></nav>}
    </header>

    <section id="home" tabIndex={-1} aria-label="Cosmetico Dental Clinic" className="clinic-hero relative bg-secondary">
      <div className="scene-host"><DentalScene /></div>
      <div className="hero-copy relative mx-auto h-full max-w-[1400px] px-6 pt-14 md:px-12 md:pt-20">
        <div className="reveal max-w-[580px]">
          <p className="eyebrow flex items-center gap-2 text-primary"><span className="h-2 w-2 rounded-full bg-primary" /> Dental care in F-7 Markaz, Islamabad</p>
          <h1 className="clinic-wordmark mt-7 font-semibold text-primary">cosmetico<span className="mt-3 block text-2xl font-normal md:text-3xl">Dental Clinic</span></h1>
          <h2 className="mt-8 max-w-md text-3xl font-medium leading-[1.25] md:text-4xl">A little care.<br />A brighter smile.</h2>
          <p className="mt-5 max-w-[350px] text-base leading-7 text-muted-foreground">Make time for your smile. Dental care, a personal conversation, and your next step forward.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild className="h-12 rounded-full bg-primary px-6"><a href={`tel:${clinic.telephone}`}>Book an appointment <ArrowUpRight /></a></Button>
            <Button asChild variant="outline" className="h-12 rounded-full border-primary/20 bg-transparent px-5"><a href="#clinic">Discover our clinic <ArrowDown /></a></Button>
          </div>
          <a href={clinic.maps} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-3 text-sm">
            <span className="flex gap-0.5 text-primary">{[1,2,3,4,5].map(n => <Star key={n} className="size-3.5 fill-current" />)}</span>
            <span><strong>5.0</strong> <span className="text-muted-foreground">/ 11 Google reviews</span></span>
          </a>
        </div>
      </div>
      <div className="hero-footer absolute inset-x-6 bottom-6 flex items-center justify-between border-t border-primary/15 pt-4 text-xs text-muted-foreground md:inset-x-12">
        <span className="flex items-center gap-2"><MapPin className="size-3.5" /> F-7 Markaz, Islamabad</span>
        <a href="#clinic" className="flex items-center gap-2">A closer look <ArrowDown className="size-3.5" /></a>
      </div>
    </section>

    <div className="border-b bg-background">
      <div className="mx-auto grid max-w-[1400px] gap-5 px-6 py-7 text-sm sm:grid-cols-3 md:px-12">
        <span className="flex items-center gap-3"><Clock className="size-4 text-muted-foreground" /> Mon–Sat · 10 AM–6 PM</span>
        <a href={`tel:${clinic.telephone}`} className="flex items-center gap-3 sm:justify-center"><Phone className="size-4 text-muted-foreground" /> {clinic.phone}</a>
        <a href={clinic.maps} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 sm:justify-end">Find us in Islamabad <ArrowUpRight className="size-4" /></a>
      </div>
    </div>

    <section id="clinic" className="scroll-mt-8 px-6 py-20 md:px-12 md:py-28">
      <div className="mx-auto max-w-[1304px]">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="eyebrow text-muted-foreground">01 / The clinic</p><h2 className="mt-4 text-4xl font-medium leading-tight md:text-5xl">Your smile.<br />Our focus.</h2></div><p className="max-w-sm leading-7 text-muted-foreground">Visit Cosmetico Dental Clinic at Cosmetico by Dr Kamal in F-7 Markaz. A space to discuss your concerns and plan your dental care.</p></div>
        <figure className="mx-auto max-w-[1040px]"><img src={clinicPhoto.url} alt="The actual Cosmetico Dental Clinic treatment room, with dental chair and equipment" width={1200} height={900} loading="lazy" decoding="async" className="block h-auto w-full rounded-lg" /><figcaption className="mt-3 grid gap-2 text-xs leading-5 text-muted-foreground sm:grid-cols-[minmax(0,1fr)_auto]"><span>Inside Cosmetico Dental Clinic · Islamabad</span><a href="https://maps.google.com/maps/contrib/115726546594166315945" target="_blank" rel="noopener noreferrer">Photo: Cosmetico Dental · Google Maps ↗</a></figcaption></figure>
      </div>
    </section>

    <section id="visit" className="scroll-mt-8 bg-primary px-6 py-20 text-primary-foreground md:px-12 md:py-24">
      <div className="mx-auto grid max-w-[1304px] gap-12 md:grid-cols-2 md:gap-20">
        <div><p className="eyebrow text-primary-foreground/60">02 / Your visit</p><h2 className="mt-5 text-4xl font-medium leading-tight md:text-5xl">Good care starts<br />with a conversation.</h2><p className="mt-6 max-w-md leading-7 text-primary-foreground/70">Whether you have a concern or are planning your next dental visit, speak with the clinic about the right appointment for you.</p><Button asChild className="mt-8 h-12 rounded-full bg-accent px-6 text-accent-foreground hover:bg-accent/90"><a href={`tel:${clinic.telephone}`}>Let’s talk about your smile <ArrowUpRight /></a></Button></div>
        <div>{[["01", "Get in touch", "Call the clinic and share what brings you in."], ["02", "Arrange your visit", "Confirm a convenient time with the clinic team."], ["03", "Meet your dentist", "Discuss your concerns, treatment options, and fees in person."]].map(([n,t,d]) => <div key={n} className="flex gap-6 border-b border-primary-foreground/20 py-6 first:pt-0"><span className="pt-1 text-xs text-primary-foreground/50">{n}</span><div><h3 className="text-xl font-medium">{t}</h3><p className="mt-2 text-sm leading-6 text-primary-foreground/65">{d}</p></div><Check className="ml-auto mt-1 size-5 shrink-0 text-accent" /></div>)}</div>
      </div>
    </section>

    <section id="reviews" className="scroll-mt-8 px-6 py-20 md:px-12 md:py-28">
      <div className="mx-auto max-w-[1304px]"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow text-muted-foreground">03 / Patient stories</p><h2 className="mt-4 text-4xl font-medium md:text-5xl">Smiles say it best.</h2></div><a href={clinic.maps} target="_blank" rel="noopener noreferrer" className="text-sm">5.0 on Google · 11 reviews <ArrowUpRight className="inline size-4" /></a></div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">{[
          {name:"Syeda Areej Shah", text:"He’s incredibly thorough explaining every step of the process n making sure I’m comfortable throughout my appointments!!", url:"https://www.google.com/maps/contrib/102688568649485602513/reviews"},
          {name:"Farooq", text:"Suggested a composite buildup for a friend, and he is very happy with the results, worth visiting for dental procedures, good professional attitude", url:"https://www.google.com/maps/contrib/116630743544334749401/reviews"},
          {name:"Maryam 007", text:"Fully satisfied of doing my dental treatment by Dr. Shaharyar.", url:"https://www.google.com/maps/contrib/113202381222778240286/reviews"},
        ].map(r => <article key={r.name} className="flex flex-col border-t border-primary/20 pt-6"><div className="flex gap-1 text-primary">{[1,2,3,4,5].map(i => <Star key={i} className="size-3.5 fill-current" />)}</div><blockquote className="mt-6 flex-1 text-lg leading-8">“{r.text}”</blockquote><a className="mt-8 text-sm font-medium" href={r.url} target="_blank" rel="noopener noreferrer">{r.name}<span className="mt-1 block text-xs font-normal text-muted-foreground">Google review · Aug–Sep 2026 ↗</span></a></article>)}</div>
        <p className="mt-8 text-xs text-muted-foreground">Review excerpts from Google Maps. Rating checked {clinic.verified}.</p>
      </div>
    </section>

    <section className="border-t px-6 py-20 md:px-12"><div className="mx-auto grid max-w-[1304px] gap-12 md:grid-cols-2"><div><p className="eyebrow text-muted-foreground">Before you visit</p><h2 className="mt-4 text-4xl font-medium">A few things<br />you might ask.</h2><img src={stillLife} width={1440} height={960} loading="lazy" alt="Conceptual ceramic tooth and dental mirror still life" className="mt-8 aspect-[3/2] max-w-sm rounded-lg object-cover" /></div><div>{faqs.map(([q,a],i) => <div key={q} className="border-b py-4"><Button variant="ghost" className="h-auto w-full justify-between whitespace-normal px-0 py-3 text-left text-base hover:bg-transparent" onClick={() => setFaq(faq === i ? null : i)} aria-expanded={faq === i}>{q}{faq === i ? <Minus /> : <Plus />}</Button>{faq === i && <p className="pb-4 pr-6 text-sm leading-7 text-muted-foreground">{a}</p>}</div>)}</div></div></section>

    <section id="contact" className="bg-secondary px-6 py-20 md:px-12"><div className="mx-auto max-w-[1304px]"><p className="eyebrow text-muted-foreground">We look forward to seeing you</p><div className="mt-5 flex flex-col justify-between gap-8 md:flex-row md:items-center"><h2 className="text-4xl font-medium md:text-6xl">Your next smile<br />starts here.</h2><Button asChild className="h-14 rounded-full px-8 text-base"><a href={`tel:${clinic.telephone}`}>Call to book <ArrowUpRight /></a></Button></div><div className="mt-14 grid gap-8 border-t border-primary/15 pt-8 md:grid-cols-3"><div><p className="eyebrow text-muted-foreground">Visit</p><p className="mt-3 max-w-xs text-sm leading-7">{clinic.address}</p><a href={clinic.maps} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex gap-2 text-sm font-medium">Get directions <MoveUpRight className="size-4" /></a></div><div><p className="eyebrow text-muted-foreground">Opening hours</p><p className="mt-3 text-sm leading-7">{clinic.hours}<br />{clinic.closed}</p></div><div><p className="eyebrow text-muted-foreground">Contact</p><a href={`tel:${clinic.telephone}`} className="mt-3 block text-xl">{clinic.phone}</a><p className="mt-2 text-xs text-muted-foreground">Call ahead to confirm your visit.</p></div></div></div></section>
    <footer className="px-6 py-8 md:px-12"><div className="mx-auto flex max-w-[1304px] flex-wrap justify-between gap-4 text-xs text-muted-foreground"><span>© 2026 Cosmetico Dental Clinic</span><span>Clinic details sourced from Google Maps · {clinic.verified}</span><a href="#home">Back to top ↑</a></div></footer>
  </main>;
}
