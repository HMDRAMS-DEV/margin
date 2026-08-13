import Link from "next/link";

import { ArticleCard } from "@/components/ArticleCard";
import { Logo } from "@/components/Logo";
import { SignupForm } from "@/components/SignupForm";
import { demoArticles } from "@/lib/demo";

export default function HomePage() {
  return (
    <main className="landingPage">
      <nav className="landingNav">
        <Logo />
        <div>
          <Link href="/demo">Demo</Link>
          <a
            href="https://github.com/HMDRAMS-DEV/margin"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </nav>

      <section className="hero">
        <div className="heroCopy">
          <h1>
            <span className="revealLine"><span>Read the point.</span></span>
            <span className="revealLine"><span>Skip the rest.</span></span>
          </h1>
          <p className="heroLead">One private email. Every newsletter, distilled.</p>
          <SignupForm />
        </div>

        <div className="heroDemo" aria-label="Progressive summary example">
          <ArticleCard article={demoArticles[0]} featured />
        </div>
      </section>

      <footer className="landingFooter">
        <a
          href="https://github.com/HMDRAMS-DEV/margin"
          target="_blank"
          rel="noreferrer"
        >
          Open source on GitHub <span aria-hidden="true">↗</span>
        </a>
      </footer>
    </main>
  );
}
