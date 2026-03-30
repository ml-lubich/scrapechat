import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import {
  MessageSquare,
  Code,
  ShieldCheck,
  Download,
  Zap,
  RefreshCw,
  ArrowRight,
  Check,
  Quote,
  ChevronDown,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Chat-Based Scraping",
    description:
      "Describe what you want to scrape in plain English. No code needed.",
  },
  {
    icon: Code,
    title: "AI Script Generation",
    description:
      "GPT-4o generates Playwright scripts tailored to your target site.",
  },
  {
    icon: ShieldCheck,
    title: "Schema Validation",
    description:
      "Zod schemas validate every piece of scraped data automatically.",
  },
  {
    icon: Download,
    title: "Export Anywhere",
    description: "Download results as JSON, CSV, or copy to clipboard instantly.",
  },
  {
    icon: Zap,
    title: "Fast Execution",
    description:
      "Playwright runs headless browsers server-side for blazing speed.",
  },
  {
    icon: RefreshCw,
    title: "Reusable Recipes",
    description:
      "Save scraping workflows as recipes and run them again with one click.",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "50 scrapes/month",
      "JSON & CSV export",
      "5 saved recipes",
      "Community support",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    features: [
      "Unlimited scrapes",
      "Priority execution",
      "Unlimited recipes",
      "Pagination & infinite scroll",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
];

const testimonials = [
  {
    quote:
      "I used to spend hours writing scrapers from scratch. Now I just describe what I need and ScrapeChatAI handles the rest. It saved our team 20+ hours a week.",
    name: "Marcus Chen",
    role: "Senior Data Engineer",
    company: "DataFlow Systems",
  },
  {
    quote:
      "We monitor competitor pricing across 50+ sites. ScrapeChatAI lets our non-technical marketers set up scrapers without bugging the dev team.",
    name: "Priya Sharma",
    role: "Growth Marketing Lead",
    company: "ShopMetrics",
  },
  {
    quote:
      "The Zod validation is a game-changer for research. I know every data point is typed and validated before it hits my analysis pipeline.",
    name: "Dr. James Okafor",
    role: "Computational Social Scientist",
    company: "University of Toronto",
  },
];

const faqs = [
  {
    question: "What sites can I scrape?",
    answer:
      "ScrapeChatAI works with any publicly accessible website. It uses headless Playwright browsers, so it handles JavaScript-rendered pages, SPAs, and dynamic content just like a real browser would.",
  },
  {
    question: "Is web scraping legal?",
    answer:
      "Scraping publicly available data is generally legal, but you should always respect a site's robots.txt and terms of service. ScrapeChatAI is a tool — you're responsible for using it in compliance with applicable laws and website policies.",
  },
  {
    question: "How does data validation work?",
    answer:
      "After scraping, ScrapeChatAI uses Zod schemas (generated automatically by GPT-4o) to validate every field of the extracted data. If a field is missing, has the wrong type, or doesn't match the expected format, you'll know immediately.",
  },
  {
    question: "Can I schedule recurring scrapes?",
    answer:
      "Not yet — but it's on our roadmap. Today you can save any scraping workflow as a recipe and re-run it with one click whenever you need fresh data.",
  },
  {
    question: "What export formats are supported?",
    answer:
      "You can export scraped data as JSON or CSV, or copy it directly to your clipboard. All exports include the validated, structured data so it's ready for your pipeline or spreadsheet.",
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-left font-medium">
        {question}
        <ChevronDown className="h-5 w-5 shrink-0 text-[var(--muted-foreground)] transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-6 pb-5 text-sm text-[var(--muted-foreground)] leading-relaxed">
        {answer}
      </div>
    </details>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-indigo-600/10 animate-gradient" />
        <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-600 dark:text-violet-400">
            <Zap className="h-3.5 w-3.5" />
            Powered by GPT-4o + Playwright
          </div>
          <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Scrape the web by{" "}
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              chatting with AI
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-[var(--muted-foreground)] sm:text-xl">
            Describe what you want in plain English. ScrapeChatAI writes the
            script, runs it, validates the data, and gives you clean structured
            results.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/login">
              <Button size="lg" className="gap-2 text-base px-8">
                Start Scraping Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="text-base px-8">
                See How It Works
              </Button>
            </Link>
          </div>

          {/* Chat preview */}
          <div className="mx-auto mt-16 max-w-2xl animate-float">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl shadow-violet-500/10">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-[var(--muted-foreground)]">
                  ScrapeChatAI
                </span>
              </div>
              <div className="space-y-3 text-left text-sm">
                <div className="flex justify-end">
                  <div className="rounded-2xl rounded-br-md bg-violet-600 px-4 py-2.5 text-white">
                    Scrape all restaurant names, ratings, and phone numbers from
                    this Yelp page
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md bg-[var(--secondary)] px-4 py-2.5 text-[var(--foreground)]">
                    Got it! I&apos;ll generate a Playwright script to extract
                    restaurant data from Yelp. Let me create the scraper and Zod
                    schema for validation...
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md bg-[var(--secondary)] px-4 py-2.5 text-[var(--foreground)]">
                    <span className="text-green-600 dark:text-green-400">
                      ✓ Found 24 restaurants
                    </span>{" "}
                    &mdash; All data validated. Ready to export!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Everything you need to scrape smarter
            </h2>
            <p className="text-lg text-[var(--muted-foreground)]">
              From natural language to structured data in seconds.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 transition-all hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 transition-colors group-hover:bg-violet-500/20">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-[var(--border)] bg-[var(--secondary)]/50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Three steps. That&apos;s it.
            </h2>
          </div>
          <div className="grid gap-12 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Describe",
                desc: "Tell ScrapeChatAI what data you need and from which website.",
              },
              {
                step: "02",
                title: "Review",
                desc: "See the generated Playwright script and Zod schema. Edit if needed.",
              },
              {
                step: "03",
                title: "Export",
                desc: "Get validated, structured data as JSON or CSV. Save as a recipe.",
              },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-2xl font-bold text-white">
                  {s.step}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{s.title}</h3>
                <p className="text-[var(--muted-foreground)]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-[var(--muted-foreground)]">
              Start free. Upgrade when you need more.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-8 ${
                  plan.highlighted
                    ? "border-violet-500 bg-gradient-to-b from-violet-500/5 to-transparent shadow-lg shadow-violet-500/10"
                    : "border-[var(--border)] bg-[var(--card)]"
                }`}
              >
                {plan.highlighted && (
                  <div className="mb-4 inline-block rounded-full bg-violet-600 px-3 py-1 text-xs font-medium text-white">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  <span className="text-[var(--muted-foreground)]">
                    {plan.period}
                  </span>
                </div>
                <ul className="mt-8 space-y-3">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="mt-8 block">
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-[var(--border)] bg-[var(--secondary)]/50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Loved by data teams everywhere
            </h2>
            <p className="text-lg text-[var(--muted-foreground)]">
              See what our users are building with ScrapeChatAI.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6"
              >
                <Quote className="mb-4 h-8 w-8 text-violet-500/40" />
                <p className="mb-6 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {t.role}, {t.company}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="text-lg text-[var(--muted-foreground)]">
              Everything you need to know about ScrapeChatAI.
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <FaqItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 px-8 py-16 shadow-2xl shadow-violet-500/20">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Ready to scrape smarter?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-lg text-violet-100">
              Join thousands of developers and analysts who extract web data in
              seconds — no boilerplate, no broken selectors, just results.
            </p>
            <Link href="/login">
              <Button
                size="lg"
                className="gap-2 bg-white text-violet-700 hover:bg-violet-50 text-base px-8"
              >
                Start Scraping Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold">ScrapeChatAI</span>
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">
                AI-powered web scraping. Describe it, scrape it, export it.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="mb-4 text-sm font-semibold">Product</h4>
              <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
                <li>
                  <Link href="#features" className="hover:text-[var(--foreground)] transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-[var(--foreground)] transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="hover:text-[var(--foreground)] transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="mb-4 text-sm font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
                <li>
                  <Link href="#" className="hover:text-[var(--foreground)] transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[var(--foreground)] transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[var(--foreground)] transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="mb-4 text-sm font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
                <li>
                  <Link href="#" className="hover:text-[var(--foreground)] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[var(--foreground)] transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-[var(--border)] pt-8 text-center text-sm text-[var(--muted-foreground)]">
            &copy; {new Date().getFullYear()} ScrapeChatAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
