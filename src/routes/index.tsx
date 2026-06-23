import { createFileRoute } from "@tanstack/react-router";
import { createContext, useContext, useState, type FormEvent } from "react";
import { toast } from "sonner";
import heroImg from "@/assets/hero-yoga.jpg";
import sunImg from "@/assets/sun-texture.jpg";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";

// Web3Forms delivers the form to a fixed inbox bound to this access key on their side,
// so the destination email never appears in the client bundle. Get a key (free) at
// https://web3forms.com using the destination email, then paste it here.
const WEB3FORMS_ACCESS_KEY = "YOUR_ACCESS_KEY_HERE";

// Lets any CTA across the page open the shared booking modal with a session label.
const BookingContext = createContext<(session: string) => void>(() => {});
const useBooking = () => useContext(BookingContext);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Neha — Yoga & Yog Nidra Guide" },
      {
        name: "description",
        content:
          "1:1 yoga, breathwork and yog nidra sessions for anxiety, sleep and emotional balance. Book a discovery call or breathwork session online.",
      },
      { property: "og:title", content: "Neha — Yoga & Yog Nidra Guide" },
      {
        property: "og:description",
        content:
          "1:1 yoga, breathwork and yog nidra sessions for anxiety, sleep and emotional balance.",
      },
    ],
  }),
  component: Index,
});

type Offering = {
  eyebrow: string;
  title: string;
  duration: string;
  description: string;
  price?: string;
  cta: string;
  featured?: boolean;
};

const offerings: Offering[] = [
  {
    eyebrow: "Discovery",
    title: "Discovery Call",
    duration: "20 min · Video",
    description:
      "A gentle first conversation to understand where you are and shape a practice that feels like yours.",
    price: "Complimentary",
    cta: "Book a free call",
  },
  {
    eyebrow: "Signature",
    title: "1:1 Breathwork for Anxiety",
    duration: "45 min · Video",
    description:
      "For work pressure, emotional overwhelm or sleep disturbances. Guided pranayama and nervous-system regulation.",
    price: "₹499",
    cta: "Book a session",
    featured: true,
  },
  {
    eyebrow: "Deep Rest",
    title: "Yog Nidra Journey",
    duration: "45 min · Video",
    description:
      "A guided yogic-sleep practice to dissolve fatigue, quiet the mind and restore the body — done lying down.",
    price: "₹599",
    cta: "Reserve your spot",
  },
  {
    eyebrow: "Movement",
    title: "Personal Yoga Flow",
    duration: "60 min · Video",
    description:
      "A tailored hatha + slow-flow class built around your body, breath and the season you're moving through.",
    price: "₹799",
    cta: "Book a class",
  },
];

function Index() {
  // null = closed; otherwise holds the session label for the open modal.
  const [session, setSession] = useState<string | null>(null);
  return (
    <BookingContext.Provider value={setSession}>
      <div className="min-h-screen bg-background text-foreground">
        <Nav />
        <Hero />
        <Offerings />
        <About />
        <Testimonials />
        <Footer />
      </div>
      <BookingModal session={session} onClose={() => setSession(null)} />
      <Toaster richColors position="top-center" />
    </BookingContext.Provider>
  );
}

function BookingModal({
  session,
  onClose,
}: {
  session: string | null;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `New booking: ${session}`,
          from_name: "Neha Yoga website",
          botcheck: "",
          Session: session,
          Name: name,
          Phone: phone,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success !== false) {
        toast.success("Thanks! Neha will reach out to you shortly.");
        setName("");
        setPhone("");
        onClose();
      } else {
        toast.error("Couldn't send your request — please try again in a moment.");
      }
    } catch {
      toast.error("Couldn't send your request — please check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={session !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl tracking-tight">
            Book your session
          </DialogTitle>
          <DialogDescription>
            {session === "General enquiry"
              ? "Leave your details and Neha will get back to you."
              : `Leave your details for ${session} and Neha will get back to you to confirm.`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="booking-name">Your name</Label>
            <Input
              id="booking-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              placeholder="e.g. Priya Sharma"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="booking-phone">Phone number</Label>
            <Input
              id="booking-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              minLength={8}
              autoComplete="tel"
              placeholder="e.g. +91 98765 43210"
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-medium text-background transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? "Sending…" : "Request booking"}
            {!sending && <span aria-hidden>→</span>}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Nav() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <a href="#" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-sun-gradient text-primary-foreground font-serif text-lg italic">
            n
          </span>
          <span className="font-serif text-xl tracking-tight">Dr Neha</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#offerings" className="hover:text-foreground transition-colors">
            Offerings
          </a>
          <a href="#about" className="hover:text-foreground transition-colors">
            About
          </a>
          <a href="#words" className="hover:text-foreground transition-colors">
            Words
          </a>
        </nav>
        <a
          href="#offerings"
          className="rounded-full border border-foreground/15 bg-background/60 px-4 py-2 text-sm backdrop-blur-sm transition-colors hover:bg-foreground hover:text-background"
        >
          Book a call
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-warm-gradient pb-20 pt-32 md:pb-32 md:pt-40">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full bg-no-repeat bg-center bg-contain opacity-20 mix-blend-multiply md:opacity-30"
        style={{ backgroundImage: `url(${sunImg})` }}
      />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/60 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Yoga · Pranayama · Yog Nidra
          </p>
          <h1 className="text-balance font-serif text-5xl leading-[1.05] tracking-tight md:text-7xl">
            Return to the <em className="text-amber-deep">stillness</em> beneath the noise.
          </h1>
          <p className="text-balance mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            I'm Neha — a yoga and yog nidra guide. Together we'll use breath, movement and deep
            rest to soften anxiety, restore sleep and bring you home to yourself.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#offerings"
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
            >
              Book a session
              <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </a>
            <a
              href="#offerings"
              className="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-7 py-3.5 text-sm font-medium transition-colors hover:bg-foreground/5"
            >
              Free 20-min discovery call
            </a>
          </div>
          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-foreground/10 pt-8">
            <Stat value="500+" label="Sessions held" />
            <Stat value="6 yrs" label="Teaching practice" />
            <Stat value="1:1" label="Always personal" />
          </dl>
        </div>
        <div className="md:col-span-5">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-[2rem] shadow-[0_30px_80px_-20px_oklch(0.5_0.18_50/0.35)]">
            <img
              src={heroImg}
              alt="Neha meditating in lotus pose at sunrise"
              width={1080}
              height={1440}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-background/85 px-5 py-4 backdrop-blur-md">
              <p className="font-serif text-base italic leading-snug">
                "The breath is the bridge between the body you have and the peace you forgot."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="font-serif text-3xl text-amber-deep">{value}</dt>
      <dd className="mt-1 text-xs uppercase tracking-[0.15em] text-muted-foreground">{label}</dd>
    </div>
  );
}

function Offerings() {
  return (
    <section id="offerings" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="mb-4 text-xs uppercase tracking-[0.25em] text-amber-deep">Offerings</p>
            <h2 className="text-balance font-serif text-4xl leading-tight md:text-5xl">
              Practices, shaped around <em>you</em>.
            </h2>
          </div>
          <p className="max-w-sm text-muted-foreground">
            Every session is held online, 1:1, in a quiet container. Choose what your body is asking
            for today.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {offerings.map((o) => (
            <OfferingCard key={o.title} offering={o} />
          ))}
        </div>
      </div>
    </section>
  );
}

function OfferingCard({ offering }: { offering: Offering }) {
  const featured = offering.featured;
  const openBooking = useBooking();
  return (
    <article
      className={
        "group relative flex flex-col justify-between overflow-hidden rounded-3xl border p-8 transition-all hover:-translate-y-1 md:p-10 " +
        (featured
          ? "border-transparent bg-sun-gradient text-primary-foreground shadow-[0_25px_60px_-25px_oklch(0.5_0.18_50/0.6)]"
          : "border-foreground/10 bg-card hover:border-foreground/25")
      }
    >
      <div>
        <div className="flex items-center justify-between">
          <span
            className={
              "text-xs uppercase tracking-[0.2em] " +
              (featured ? "text-primary-foreground/80" : "text-amber-deep")
            }
          >
            {offering.eyebrow}
          </span>
          <span
            className={
              "text-xs " + (featured ? "text-primary-foreground/80" : "text-muted-foreground")
            }
          >
            {offering.duration}
          </span>
        </div>
        <h3 className="mt-6 font-serif text-3xl leading-tight md:text-4xl">{offering.title}</h3>
        <p
          className={
            "mt-4 max-w-md leading-relaxed " +
            (featured ? "text-primary-foreground/90" : "text-muted-foreground")
          }
        >
          {offering.description}
        </p>
      </div>
      <div className="mt-10 flex items-center justify-between gap-4 border-t pt-6"
        style={{ borderColor: featured ? "oklch(1 0 0 / 0.25)" : undefined }}
      >
        <span className="font-serif text-2xl">{offering.price}</span>
        <button
          type="button"
          onClick={() => openBooking(offering.title)}
          className={
            "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-transform group-hover:translate-x-0.5 " +
            (featured
              ? "bg-background text-foreground"
              : "bg-foreground text-background")
          }
        >
          {offering.cta}
          <span aria-hidden>→</span>
        </button>
      </div>
    </article>
  );
}

function About() {
  return (
    <section id="about" className="relative bg-secondary px-6 py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-16 md:grid-cols-12 md:gap-20">
        <div className="md:col-span-5">
          <p className="mb-4 text-xs uppercase tracking-[0.25em] text-amber-deep">The Guide</p>
          <h2 className="font-serif text-4xl leading-tight md:text-5xl">
            Soft hands, steady breath, a quiet room.
          </h2>
        </div>
        <div className="space-y-6 text-lg leading-relaxed text-muted-foreground md:col-span-7">
          <p>
            For six years I've held space for people moving through anxiety, burnout and broken
            sleep. My practice draws from classical hatha yoga, pranayama and the deeply restorative
            tradition of <em className="text-foreground not-italic font-serif">yog nidra</em>.
          </p>
          <p>
            We won't chase poses or perfection. We'll listen — to breath, body, and the quiet
            wisdom underneath. You'll leave each session a little softer, a little more home.
          </p>
          <ul className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2">
            {[
              "500-hr Hatha & Pranayama certified",
              "Trained in Bihar School Yog Nidra",
              "Trauma-informed practice",
              "Sessions in English & Hindi",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-foreground">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span className="text-base">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    {
      q: "I came for sleep. I stayed because I finally felt like I could breathe again.",
      a: "Riya M., Bengaluru",
    },
    {
      q: "Neha's yog nidra is the most rested 45 minutes of my week. It's medicine.",
      a: "Dev K., Mumbai",
    },
    {
      q: "Gentle, deeply knowledgeable, and never performative. A rare teacher.",
      a: "Sara P., London",
    },
  ];
  return (
    <section id="words" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <p className="mb-4 text-xs uppercase tracking-[0.25em] text-amber-deep">In their words</p>
        <h2 className="mb-16 max-w-2xl font-serif text-4xl leading-tight md:text-5xl">
          From the people who sit with me.
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {quotes.map((t) => (
            <figure
              key={t.a}
              className="flex h-full flex-col justify-between rounded-3xl border border-foreground/10 bg-card p-8"
            >
              <blockquote className="font-serif text-xl leading-snug italic text-balance">
                "{t.q}"
              </blockquote>
              <figcaption className="mt-8 text-sm uppercase tracking-[0.15em] text-muted-foreground">
                — {t.a}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const openBooking = useBooking();
  return (
    <footer className="relative overflow-hidden bg-foreground px-6 py-20 text-background">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-40 h-[480px] w-[480px] rounded-full bg-no-repeat bg-center bg-contain opacity-10"
        style={{ backgroundImage: `url(${sunImg})` }}
      />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-12 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="mb-4 text-xs uppercase tracking-[0.25em] text-background/60">Begin</p>
          <h2 className="text-balance font-serif text-4xl leading-tight md:text-6xl">
            One breath is enough to start.
          </h2>
          <div className="mt-10 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => openBooking("Discovery Call")}
              className="rounded-full bg-background px-7 py-3.5 text-sm font-medium text-foreground transition-transform hover:-translate-y-0.5"
            >
              Book a free discovery call
            </button>
            <button
              type="button"
              onClick={() => openBooking("General enquiry")}
              className="rounded-full border border-background/30 px-7 py-3.5 text-sm font-medium transition-colors hover:bg-background/10"
            >
              Say hello
            </button>
          </div>
        </div>
        <div className="space-y-3 text-sm text-background/70 md:col-span-5 md:text-right">
          <p className="font-serif text-2xl italic text-background">neha</p>
          <p>Online sessions worldwide</p>
          <p>Mon — Sat · 7am to 8pm IST</p>
          <p className="pt-6 text-xs uppercase tracking-[0.2em] text-background/40">
            © {new Date().getFullYear()} Neha Yoga
          </p>
        </div>
      </div>
    </footer>
  );
}
