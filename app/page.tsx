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
          <Link href="/demo">Try the demo</Link>
          <a
            href="https://github.com/HMDRAMS-DEV/margin"
            target="_blank"
            rel="noreferrer"
          >
            View source
          </a>
        </div>
      </nav>

      <section className="hero">
        <div className="heroCopy">
          <p className="eyebrow">NEWSLETTERS, DISTILLED</p>
          <h1>Read the point. Then decide if you want the rest.</h1>
          <p className="heroLead">
            Get a private email address for your newsletter subscriptions.
            Margin turns every issue into one sentence, three points, then ten
            details.
          </p>
          <SignupForm />
        </div>

        <div className="heroDemo" aria-label="Progressive summary example">
          <div className="demoLabel">
            <span>Start small</span>
            <span>Go deeper only when it earns your attention</span>
          </div>
          <ArticleCard article={demoArticles[0]} featured />
        </div>
      </section>

      <section className="howItWorks" aria-labelledby="how-heading">
        <h2 id="how-heading">A calmer reading loop.</h2>
        <ol>
          <li>
            <span>01</span>
            <strong>Save your address.</strong>
            <p>Use it when you subscribe to any email newsletter.</p>
          </li>
          <li>
            <span>02</span>
            <strong>Get one weekly note.</strong>
            <p>Each issue starts as a single useful sentence.</p>
          </li>
          <li>
            <span>03</span>
            <strong>Follow your curiosity.</strong>
            <p>Open three points, ten details, or the original article.</p>
          </li>
        </ol>
      </section>

      <section className="privacyNote">
        <span className="privacyMark" aria-hidden="true">×</span>
        <div>
          <h2>Less inbox, less data.</h2>
          <p>
            Margin does not persist newsletter bodies after summarization. It
            stores the summaries you need, verifies every inbound webhook, and
            keeps accounts separated with secure sign-in links.
          </p>
        </div>
      </section>

      <footer className="landingFooter">
        <p>Margin is open source.</p>
        <a
          href="https://github.com/HMDRAMS-DEV/margin"
          target="_blank"
          rel="noreferrer"
        >
          GitHub ↗
        </a>
      </footer>
    </main>
  );
}
