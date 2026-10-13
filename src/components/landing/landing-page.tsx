"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Compass,
  Code2,
  GraduationCap,
  FileText,
  BookOpen,
  Microscope,
  Rocket,
  TrendingUp,
  Zap,
  Menu,
  Play,
  ArrowRight,
  Check,
  Star,
  Github,
  Twitter,
  Linkedin,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

/* -------------------------------------------------------------------------- */
/*                                   Data                                     */
/* -------------------------------------------------------------------------- */

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    icon: Compass,
    title: "Career Guidance",
    description:
      "Personalized roadmaps, role transitions, salary insights, and negotiation playbooks from an AI mentor that thinks like a senior recruiter.",
  },
  {
    icon: Code2,
    title: "Coding Mentor",
    description:
      "Debug, generate, refactor, and review code across Python, TypeScript, React, Node, Java, Go, and more — with complexity analysis included.",
  },
  {
    icon: GraduationCap,
    title: "Interview Coach",
    description:
      "Run realistic mock interviews for DSA, system design, and behavioral rounds with instant scores, feedback, and improvement tips.",
  },
  {
    icon: FileText,
    title: "Resume Review",
    description:
      "Upload your resume for an ATS score, keyword gaps, and rewritten bullet points using the impact-driven XYZ formula.",
  },
  {
    icon: BookOpen,
    title: "Study Planner",
    description:
      "Get spaced-repetition schedules, exam countdowns, and phase-by-phase learning roadmaps calibrated to your time and goals.",
  },
  {
    icon: Microscope,
    title: "Research Assistant",
    description:
      "Summarize papers, compare architectures in tables, explain concepts at any depth, and generate APA/IEEE citations.",
  },
];

type PersonalityCard = {
  icon: LucideIcon;
  name: string;
  tagline: string;
};

const PERSONALITIES: PersonalityCard[] = [
  { icon: Compass, name: "Career Mentor", tagline: "Navigate your career with confidence" },
  { icon: Code2, name: "Coding Mentor", tagline: "Debug, generate, and master code" },
  { icon: GraduationCap, name: "Interview Coach", tagline: "Crack technical & HR interviews" },
  { icon: FileText, name: "Resume Reviewer", tagline: "ATS-ready resumes that get interviews" },
  { icon: Rocket, name: "Project Advisor", tagline: "From idea to deployable architecture" },
  { icon: TrendingUp, name: "Startup Advisor", tagline: "Validate, build, and scale your startup" },
  { icon: Microscope, name: "Research Assistant", tagline: "Summarize, compare, and cite papers" },
  { icon: BookOpen, name: "Study Coach", tagline: "Roadmaps, schedules, and exam prep" },
  { icon: Zap, name: "Productivity Coach", tagline: "Plan, prioritize, and ship daily" },
  { icon: Sparkles, name: "General AI", tagline: "Your all-purpose intelligent assistant" },
];

type Step = {
  number: string;
  title: string;
  description: string;
};

const STEPS: Step[] = [
  {
    number: "1",
    title: "Pick your mentor",
    description:
      "Choose from 10 specialized AI personalities — each tuned with its own expert system prompt.",
  },
  {
    number: "2",
    title: "Ask anything",
    description:
      "Type your question, paste code, or drop your resume. Responses stream in real time with rich Markdown.",
  },
  {
    number: "3",
    title: "Get expert guidance",
    description:
      "Receive structured, actionable advice with code blocks, tables, schedules, and citations you can use today.",
  },
];

type Testimonial = {
  name: string;
  role: string;
  quote: string;
  initials: string;
  color: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Ananya Sharma",
    role: "Final-year CSE Student",
    initials: "AS",
    color: "from-emerald-400 to-teal-500",
    quote:
      "The Interview Coach ran a full DSA mock with me and flagged the exact patterns I was weak at. I cleared my first FAANG round two weeks later.",
  },
  {
    name: "Rahul Verma",
    role: "Backend Engineer, 3 YOE",
    initials: "RV",
    color: "from-amber-400 to-orange-500",
    quote:
      "Resume Reviewer rewrote my bullets and my callback rate jumped from 8% to 31%. The ATS score breakdown was painfully honest — and exactly what I needed.",
  },
  {
    name: "Megha Iyer",
    role: "CS Researcher, IIT Madras",
    initials: "MI",
    color: "from-violet-400 to-fuchsia-500",
    quote:
      "Research Assistant summarizes papers in minutes and the comparison tables are genuinely useful for my literature reviews. It saves me hours every week.",
  },
];

type Plan = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "For curious minds getting started.",
    features: [
      "50 messages / month",
      "Access to 3 mentors",
      "Streaming responses",
      "Markdown + code rendering",
      "Community support",
    ],
    cta: "Start for free",
  },
  {
    name: "Pro",
    price: "₹499",
    period: "per month",
    description: "For students and professionals going all-in.",
    features: [
      "Unlimited messages",
      "All 10 AI mentors",
      "Resume upload & review",
      "Conversation history & folders",
      "Priority response speed",
      "Export chats as Markdown",
    ],
    cta: "Get Pro",
    popular: true,
  },
  {
    name: "Team",
    price: "₹1999",
    period: "per month",
    description: "For cohorts, bootcamps, and small teams.",
    features: [
      "Everything in Pro",
      "Up to 10 seats",
      "Shared prompt library",
      "Team usage analytics",
      "Mentor customization",
      "Dedicated support",
    ],
    cta: "Start with Team",
  },
];

type Faq = { q: string; a: string };

const FAQS: Faq[] = [
  {
    q: "What exactly is AI Mentor Pro?",
    a: "AI Mentor Pro is a premium AI assistant that pairs a polished ChatGPT-style interface with 10 specialized mentor personalities — career coach, coding mentor, interview coach, resume reviewer, and more. Each mentor has its own expert system prompt, so the advice you get is targeted and actionable instead of generic.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. Your conversations are stored locally in your browser by default and only synced to your account when you sign in. We never sell your data, never use your chats to train external models, and you can delete any conversation at any time.",
  },
  {
    q: "Which AI model powers AI Mentor Pro?",
    a: "AI Mentor Pro uses a high-capability large language model served through a secure streaming API. Each mentor personality wraps the model with a carefully engineered system prompt so responses are expert-grade and well-structured.",
  },
  {
    q: "Can I export my chats?",
    a: "Absolutely. Every conversation can be exported as clean Markdown, which preserves code blocks, tables, and formatting. This makes it easy to paste into Notion, GitHub, or your personal knowledge base.",
  },
  {
    q: "Does it actually help with coding?",
    a: "Yes — the Coding Mentor is fluent in Python, JavaScript/TypeScript, Java, C++, Go, Rust, React, Node, SQL, and more. It can debug, explain, generate, optimize, review, and write tests, and it always includes time/space complexity when relevant.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. The Free plan includes 50 messages per month and access to 3 mentors, which is plenty to evaluate the product. You can upgrade to Pro for unlimited messaging, all 10 mentors, and resume uploads at any time.",
  },
];

const TRUST_NAMES = [
  "IIT Bombay",
  "BITS Pilani",
  "NIT Trichy",
  "IIIT Hyderabad",
  "Microsoft",
  "Google",
];

/* -------------------------------------------------------------------------- */
/*                              Shared primitives                             */
/* -------------------------------------------------------------------------- */

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5 },
} as const;

/** A reusable gradient circle that holds a lucide icon. */
function IconBadge({
  icon: Icon,
  className,
}: {
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={
        "flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-chart-4 text-primary-foreground shadow-lg shadow-primary/20 " +
        (className ?? "")
      }
    >
      <Icon className="size-6" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Navbar                                    */
/* -------------------------------------------------------------------------- */

function Navbar({ onLaunch }: { onLaunch: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = (
    <>
      {[
        { label: "Features", href: "#features" },
        { label: "Mentors", href: "#mentors" },
        { label: "Pricing", href: "#pricing" },
        { label: "FAQ", href: "#faq" },
      ].map((l) => (
        <a
          key={l.href}
          href={l.href}
          onClick={() => setOpen(false)}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {l.label}
        </a>
      ))}
    </>
  );

  return (
    <header
      className={
        "sticky top-0 z-50 w-full transition-all duration-300 " +
        (scrolled
          ? "glass-strong border-b border-border/60 shadow-sm"
          : "glass border-b border-transparent")
      }
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="#top" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-4 text-primary-foreground shadow-md shadow-primary/30">
            <Sparkles className="size-5" />
          </span>
          <span className="text-base font-semibold tracking-tight">
            AI Mentor Pro
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" onClick={onLaunch}>
            Sign in
          </Button>
          <Button size="sm" onClick={onLaunch} className="gap-1.5">
            Launch App
            <ArrowRight className="size-4" />
          </Button>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <div className="flex flex-col gap-1 px-2 pt-2">
                <div className="mb-3 flex items-center gap-2.5 px-2">
                  <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-4 text-primary-foreground">
                    <Sparkles className="size-5" />
                  </span>
                  <span className="text-base font-semibold">AI Mentor Pro</span>
                </div>
                {[
                  { label: "Features", href: "#features" },
                  { label: "Mentors", href: "#mentors" },
                  { label: "Pricing", href: "#pricing" },
                  { label: "FAQ", href: "#faq" },
                ].map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    {l.label}
                  </a>
                ))}
                <div className="mt-4 flex flex-col gap-2">
                  <Button variant="outline" onClick={onLaunch}>
                    Sign in
                  </Button>
                  <Button onClick={onLaunch} className="gap-1.5">
                    Launch App
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    Hero                                    */
/* -------------------------------------------------------------------------- */

function Hero({ onLaunch }: { onLaunch: () => void }) {
  return (
    <section
      id="top"
      className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:pt-28"
    >
      {/* Animated gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="animate-blob absolute -left-24 top-0 size-80 rounded-full bg-primary/30 blur-3xl dark:bg-primary/25" />
        <div
          className="animate-blob absolute right-0 top-10 size-96 rounded-full bg-chart-2/30 blur-3xl dark:bg-chart-2/25"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="animate-blob absolute -bottom-16 left-1/3 size-80 rounded-full bg-chart-3/30 blur-3xl dark:bg-chart-3/25"
          style={{ animationDelay: "4s" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--background)_75%)]" />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
        {/* Left: copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-start gap-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="size-3.5 text-primary" />
            10 specialized AI mentors in one app
          </span>

          <h1 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Your Personalized{" "}
            <span className="text-gradient">AI Career, Coding</span> &amp;{" "}
            <span className="text-gradient">Learning Mentor</span>
          </h1>

          <p className="max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
            AI Mentor Pro pairs a polished, ChatGPT-style interface with ten
            expert-grade AI personalities — from career coach to resume reviewer
            — so you always get advice that&apos;s sharp, structured, and
            actually useful.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={onLaunch} className="gap-2">
              Start for free
              <ArrowRight className="size-4" />
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Play className="size-4" />
              Watch demo
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3.5 text-primary" /> No credit card
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3.5 text-primary" /> 50 free messages
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3.5 text-primary" /> Cancel anytime
            </span>
          </div>
        </motion.div>

        {/* Right: chat preview mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          className="relative"
        >
          {/* Glow behind card */}
          <div className="absolute inset-0 -z-10 translate-y-6 scale-95 rounded-3xl bg-gradient-to-tr from-primary/30 via-chart-2/20 to-chart-3/30 blur-2xl" />

          <div className="glass-strong rounded-3xl border border-border/60 p-3 shadow-2xl shadow-primary/10 sm:p-4">
            {/* Mentor selector pills */}
            <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-border/50 pb-3">
              <div className="flex items-center gap-2 pr-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-4 text-primary-foreground">
                  <Sparkles className="size-3.5" />
                </span>
                <span className="text-sm font-semibold">AI Mentor Pro</span>
              </div>
              {[
                { icon: Compass, label: "Career", active: true },
                { icon: Code2, label: "Coding" },
                { icon: GraduationCap, label: "Interview" },
              ].map((p) => (
                <span
                  key={p.label}
                  className={
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors " +
                    (p.active
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground")
                  }
                >
                  <p.icon className="size-3" />
                  {p.label}
                </span>
              ))}
            </div>

            {/* Chat exchange */}
            <div className="flex flex-col gap-3">
              {/* User message */}
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-sm">
                  I&apos;m a fresher — how do I land my first SDE role in 2025?
                </div>
              </div>

              {/* AI message */}
              <div className="flex justify-start">
                <div className="glass max-w-[88%] rounded-2xl rounded-bl-md border border-border/50 px-4 py-3 text-sm shadow-sm">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary">
                    <Compass className="size-3.5" />
                    Career Mentor
                  </div>
                  <p className="mb-2 leading-relaxed">
                    Great question. Here&apos;s a focused{" "}
                    <strong>90-day plan</strong> for freshers targeting SDE
                    roles:
                  </p>
                  <ul className="mb-2 space-y-1.5 pl-4 text-sm leading-relaxed">
                    <li>
                      <strong>Days 1–30:</strong> Strengthen DSA fundamentals —
                      2 problems/day on arrays, strings, trees.
                    </li>
                    <li>
                      <strong>Days 31–60:</strong> Build 2 projects with a
                      backend + DB and ship them publicly.
                    </li>
                    <li>
                      <strong>Days 61–90:</strong> Resume polish, cold outreach
                      to 50 referrals/wk, mock interviews.
                    </li>
                  </ul>
                  <div className="rounded-lg bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
                    Target: 300 problems · 2 projects · 20 mocks
                  </div>
                </div>
              </div>

              {/* Typing indicator */}
              <div className="flex items-center gap-1.5 pl-1 text-muted-foreground">
                <span className="size-2 animate-pulse rounded-full bg-primary/60" />
                <span
                  className="size-2 animate-pulse rounded-full bg-primary/60"
                  style={{ animationDelay: "0.2s" }}
                />
                <span
                  className="size-2 animate-pulse rounded-full bg-primary/60"
                  style={{ animationDelay: "0.4s" }}
                />
                <span className="ml-1 text-xs">Generating…</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Trust bar                                  */
/* -------------------------------------------------------------------------- */

function TrustBar() {
  return (
    <section className="border-y border-border/50 bg-card/30 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Trusted by students and professionals from
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-12">
          {TRUST_NAMES.map((name) => (
            <span
              key={name}
              className="text-sm font-semibold tracking-tight text-muted-foreground/80 transition-colors hover:text-foreground sm:text-base"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Features                                  */
/* -------------------------------------------------------------------------- */

function Features() {
  return (
    <section id="features" className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Features
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to grow
          </h2>
          <p className="mt-4 text-muted-foreground">
            One polished app, ten expert mentors, and the depth of a senior
            coach available the moment you need it.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              className="group glass relative overflow-hidden rounded-2xl border border-border/60 p-6 transition-shadow hover:shadow-xl hover:shadow-primary/10"
            >
              {/* Hover glow */}
              <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                <IconBadge icon={f.icon} />
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Personalities                               */
/* -------------------------------------------------------------------------- */

function Personalities() {
  return (
    <section
      id="mentors"
      className="relative overflow-hidden border-y border-border/50 bg-card/30 px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
    >
      {/* soft accent */}
      <div className="pointer-events-none absolute -left-20 top-1/3 size-72 rounded-full bg-chart-3/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 size-72 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            AI Personalities
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            10 specialized AI mentors, one app
          </h2>
          <p className="mt-4 text-muted-foreground">
            Each mentor has its own expert system prompt. Pick the right one for
            the job and get advice tuned for that exact domain.
          </p>
        </motion.div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="mt-12 flex gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0">
          {PERSONALITIES.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              whileHover={{ y: -4 }}
              className="glass group relative w-64 shrink-0 overflow-hidden rounded-2xl border border-border/60 p-5 transition-shadow hover:shadow-lg hover:shadow-primary/10 lg:w-auto"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/90 to-chart-4 text-primary-foreground shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
                  <p.icon className="size-5" />
                </span>
                <h3 className="text-base font-semibold">{p.name}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {p.tagline}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                How it works                                */
/* -------------------------------------------------------------------------- */

function HowItWorks() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            How it works
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            From question to expert guidance in seconds
          </h2>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-6">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative flex flex-col items-center text-center"
            >
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="absolute left-1/2 top-8 hidden h-px w-full bg-gradient-to-r from-primary/40 to-transparent md:block" />
              )}

              <div className="relative flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-4 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/30">
                {s.number}
              </div>
              <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {s.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Testimonials                                */
/* -------------------------------------------------------------------------- */

function Testimonials() {
  return (
    <section className="border-y border-border/50 bg-card/30 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Testimonials
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by learners and professionals
          </h2>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass flex flex-col rounded-2xl border border-border/60 p-6"
            >
              <div className="flex items-center gap-1 text-chart-2">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} className="size-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="mt-5 flex items-center gap-3">
                <span
                  className={
                    "flex size-10 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-white " +
                    t.color
                  }
                >
                  {t.initials}
                </span>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Pricing                                  */
/* -------------------------------------------------------------------------- */

function Pricing({ onLaunch }: { onLaunch: () => void }) {
  return (
    <section id="pricing" className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Pricing
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start free, upgrade when you&apos;re ready. No hidden fees, cancel
            anytime.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={
                "relative flex flex-col rounded-2xl border p-6 transition-all " +
                (plan.popular
                  ? "glass-strong border-primary/60 shadow-2xl shadow-primary/20 lg:-mt-4 lg:mb-4"
                  : "glass border-border/60 hover:border-border")
              }
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-chart-4 px-3 py-1 text-xs font-semibold text-primary-foreground shadow-md">
                  Most Popular
                </span>
              )}

              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {plan.description}
              </p>

              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="text-4xl font-bold tracking-tight">
                  {plan.price}
                </span>
                <span className="text-sm text-muted-foreground">
                  /{plan.period}
                </span>
              </div>

              <Button
                onClick={onLaunch}
                variant={plan.popular ? "default" : "outline"}
                className="mt-5 w-full"
              >
                {plan.cta}
              </Button>

              <ul className="mt-6 space-y-3 text-sm">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Check className="size-3" />
                    </span>
                    <span className="text-foreground/90">{feat}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Prices shown in INR for demo purposes. Taxes may apply.
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                     FAQ                                    */
/* -------------------------------------------------------------------------- */

function FAQ() {
  return (
    <section
      id="faq"
      className="border-y border-border/50 bg-card/30 px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-3xl">
        <motion.div {...fadeUp} className="text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            FAQ
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-muted-foreground">
            Everything you need to know about AI Mentor Pro.
          </p>
        </motion.div>

        <motion.div
          {...fadeUp}
          className="glass mt-12 rounded-2xl border border-border/60 p-2 sm:p-4"
        >
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((f, i) => (
              <AccordionItem
                key={f.q}
                value={`item-${i}`}
                className="border-border/60 px-3"
              >
                <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  CTA block                                 */
/* -------------------------------------------------------------------------- */

function CtaBlock({ onLaunch }: { onLaunch: () => void }) {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <motion.div
        {...fadeUp}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border/60 px-6 py-16 text-center sm:px-12"
      >
        {/* Background gradient + blobs */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-chart-2/5 to-chart-3/15" />
        <div className="pointer-events-none absolute -left-10 -top-10 size-56 animate-blob rounded-full bg-primary/25 blur-3xl" />
        <div
          className="pointer-events-none absolute -bottom-10 -right-10 size-56 animate-blob rounded-full bg-chart-3/25 blur-3xl"
          style={{ animationDelay: "3s" }}
        />
        <div className="glass-strong absolute inset-0 -z-10 rounded-3xl" />

        <div className="relative">
          <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-chart-4 text-primary-foreground shadow-lg shadow-primary/30">
            <Sparkles className="size-7" />
          </span>
          <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to accelerate your growth?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Launch AI Mentor Pro and chat with your first mentor in under 10
            seconds. No credit card required.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" onClick={onLaunch} className="gap-2">
              Launch AI Mentor Pro
              <ArrowRight className="size-4" />
            </Button>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="size-3.5 text-primary" />
              Free forever plan available
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Footer                                   */
/* -------------------------------------------------------------------------- */

function Footer() {
  const columns: { title: string; links: string[] }[] = [
    {
      title: "Product",
      links: ["Features", "Pricing", "Mentors", "Changelog"],
    },
    {
      title: "Resources",
      links: ["Docs", "Blog", "Guides", "API"],
    },
    {
      title: "Company",
      links: ["About", "Careers", "Contact", "Privacy"],
    },
  ];

  return (
    <footer className="border-t border-border/60 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2">
            <a href="#top" className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-4 text-primary-foreground">
                <Sparkles className="size-5" />
              </span>
              <span className="text-base font-semibold">AI Mentor Pro</span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Your personalized AI career, coding &amp; learning mentor. Ten
              specialized personalities, one beautiful app.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {[
                { icon: Github, label: "GitHub" },
                { icon: Twitter, label: "Twitter" },
                { icon: Linkedin, label: "LinkedIn" },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="flex size-9 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                >
                  <s.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold">{col.title}</h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row">
          <p className="text-center text-xs text-muted-foreground sm:text-left">
            © 2025 AI Mentor Pro. Built for IBM × Bharat Cares Vibe Coding.
          </p>
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <a href="#" className="transition-colors hover:text-foreground">
              Terms
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Status
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Page shell                                  */
/* -------------------------------------------------------------------------- */

export default function LandingPage({
  onLaunch,
}: {
  onLaunch: () => void;
}) {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <Navbar onLaunch={onLaunch} />
      <main>
        <Hero onLaunch={onLaunch} />
        <TrustBar />
        <Features />
        <Personalities />
        <HowItWorks />
        <Testimonials />
        <Pricing onLaunch={onLaunch} />
        <FAQ />
        <CtaBlock onLaunch={onLaunch} />
      </main>
      <Footer />
    </div>
  );
}
