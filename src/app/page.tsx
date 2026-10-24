import type { Metadata } from "next";
import Image from "next/image";
import Script from "next/script";

// Career details come from the supplied resume; positioning reflects the owner's updates.
const profile = {
  name: "Artem Belyavsky",
  role: "AI Engineer",
  specialization: "AI agents, RAG, MCP",
  seniority: "Senior Software Engineer",
  technologies: "TypeScript, Go, React, NodeJS, Python",
  industry: "B2B SaaS",
  email: "artembell.dev@gmail.com",
  telegram: "https://t.me/green1antern",
  linkedin: "https://www.linkedin.com/in/artem-belyavsky/",
  github: "https://github.com/artembell",
  year: 2026,
};

const siteUrl = "https://artembell.github.io";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: `${profile.name} — ${profile.seniority} | ${profile.role}`,
    description: `${profile.technologies} · ${profile.specialization} · ${profile.industry}`,
    images: [{ url: "/artem-belyavsky.png", width: 400, height: 400, alt: profile.name }],
    locale: "en_US",
  },
  twitter: { card: "summary" },
  icons: { icon: "/icon.svg" },
  title: `${profile.name} — ${profile.seniority} | ${profile.role}`,
  description: `${profile.seniority} · ${profile.role} | ${profile.technologies} · ${profile.specialization} · ${profile.industry}`,
};

const socialLinks = [
  { label: "LinkedIn", href: profile.linkedin },
  { label: "Telegram", href: profile.telegram },
  { label: "GitHub", href: profile.github },
];

type ProjectScreenshot = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
};

type PersonalProject = {
  id: string;
  name: string;
  description: string;
  // Set owner/repository when its source is ready to be shared publicly.
  repository: string | null;
  achievements: readonly string[];
};

// Personal project details were supplied by the owner.
const personalProjects = [
  {
    id: "english-learning-app",
    name: "English learning and conversation practice app",
    description:
      "An AI-powered English learning app with conversation practice, dialogue history, and learning goals.",
    repository: null,
    achievements: [
      "Developed a personal English learning application with LLM-powered conversation practice, integrating OpenAI APIs and migrating from Chat Completions API to Responses API.",
      "Implemented AI agents with LangChain and LangGraph, preserving conversation history and learning goals while handling different dialogue scenarios.",
    ],
  },
  {
    id: "ecommerce-assistant",
    name: "AI-powered e-commerce assistant with a Telegram Mini App",
    description:
      "A Telegram bot and Mini App for product sales, with AI-assisted conversations, product comparisons, and interior visualizations.",
    repository: null,
    achievements: [
      "Built a Telegram bot and Mini App for product sales, using a Mastra AI agent to handle customer conversations and hand them over to a human manager when needed.",
      "Implemented semantic search over manager-prepared answers and RAG product comparisons using OpenAI embeddings, grounding responses in available product information.",
      "Integrated OpenAI image generation to visualize how products could look in customers' interiors.",
    ],
  },
  {
    id: "video-analysis-tool",
    name: "Video analysis and presentation generation tool",
    description:
      "A configurable pipeline that combines video transcripts and extracted screenshots to generate presentations.",
    repository: null,
    achievements: [
      "Built a video-processing pipeline that extracts audio with ffmpeg and supports transcription through a local Whisper model or OpenAI API, with a configurable processing mode.",
      "Combined transcripts with screenshots extracted from videos to capture visual context and generate presentations based on the video content.",
    ],
  },
  {
    id: "browser-agent-harness",
    name: "Browser agent harness",
    description:
      "A browser tab management agent with a custom runtime, local LLMs, command guardrails, and reproducible evaluations.",
    repository: "artembell/oh-my-tabs",
    achievements: [
      "Built a browser tab management agent with a custom TypeScript runtime, connecting local LLMs through Ollama to a Chrome extension over WebSockets.",
      "Implemented guardrails for tool names, argument schemas and URL protocols, rejecting invalid model-generated commands before they reach the browser.",
      "Built a reproducible eval suite for tool selection and arguments, surfacing mismatches, runtime errors and response latency to support model comparison and failure diagnosis.",
    ],
  },
] as const satisfies readonly PersonalProject[];

// Only public repositories are linked. No GitHub credentials are sent or required.
// GitHub Pages serves static files; repository images are refreshed on each build.

async function loadRepositoryGallery(repository: string | null): Promise<{
  repositoryUrl: string | null;
  screenshots: ProjectScreenshot[];
}> {
  const empty: { repositoryUrl: string | null; screenshots: ProjectScreenshot[] } = {
    repositoryUrl: null, screenshots: [],
  };
  if (!repository || !/^[\w.-]+\/[\w.-]+$/.test(repository)) return empty;

  try {
    const options = {
      headers: { Accept: "application/vnd.github+json" },
      cache: "force-cache" as const,
    };
    const metadataResponse = await fetch(`https://api.github.com/repos/${repository}`, {
      ...options,
      signal: AbortSignal.timeout(4000),
    });
    if (!metadataResponse.ok) return empty;
    const metadata = await metadataResponse.json();
    if (metadata.private !== false) return empty;
    const repositoryUrl = `https://github.com/${repository}`;
    empty.repositoryUrl = repositoryUrl;
    const directoryResponse = await fetch(
      `https://api.github.com/repos/${repository}/contents/demo/images`,
      { ...options, signal: AbortSignal.timeout(4000) },
    );
    if (!directoryResponse.ok) return { repositoryUrl, screenshots: [] };
    const files: unknown = await directoryResponse.json();
    if (!Array.isArray(files)) return { repositoryUrl, screenshots: [] };

    const screenshots: ProjectScreenshot[] = files
      .filter((file) =>
        file?.type === "file" && typeof file.name === "string" &&
        /\.(png|jpe?g|webp|avif|gif)$/i.test(file.name) &&
        typeof file.download_url === "string" &&
        file.download_url.startsWith("https://raw.githubusercontent.com/"),
      )
      .sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }))
      .map((file) => {
        const label = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
        return { src: file.download_url, alt: label, caption: label, width: 1600, height: 1000 };
      });
    return { repositoryUrl, screenshots };
  } catch {
    // An unavailable repository must not prevent the portfolio from rendering.
    return empty;
  }
}

function CVInvitation({ className }: { className?: string }) {
  return (
    <p className={className}>
      Want to discuss my experience and get a detailed CV? Message me on{" "}
      <a href={profile.telegram} target="_blank" rel="noopener noreferrer">
        Telegram
        <span className="sr-only"> (opens in a new tab)</span>
      </a>{" "}
      or{" "}
      <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
        LinkedIn
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
      .
    </p>
  );
}

function HeadingLink({ href, children }: { href: string; children: string }) {
  return (
    <a className="heading-link" href={href} title={`Link to ${children}`}>
      {children}
      <svg
        className="heading-link-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    </a>
  );
}

function ProjectGallery({
  id,
  name,
  screenshots,
}: {
  id: string;
  name: string;
  screenshots: readonly ProjectScreenshot[];
}) {
  if (screenshots.length === 0) return null;

  return (
    <div className="project-gallery" data-gallery-name={name}>
      <p className="meta">
        Screenshots · Click to enlarge
      </p>
      <div className="gallery-preview">
        <ul id={`${id}-screenshots`} className="screenshot-grid" aria-label={`Screenshots of ${name}`}>
          {screenshots.map((screenshot, index) => (
            <li key={screenshot.src} hidden={index >= 3}>
              <figure>
                <a
                  className="screenshot-link"
                  href={screenshot.src}
                  data-screenshot
                  data-caption={screenshot.caption ?? screenshot.alt}
                  aria-label={`View screenshot: ${screenshot.alt}`}
                >
                  <Image
                    src={screenshot.src}
                    alt={screenshot.alt}
                    width={screenshot.width}
                    height={screenshot.height}
                    sizes="80px"
                    loading="lazy"
                    unoptimized={screenshot.src.startsWith("https://")}
                  />
                </a>
                <figcaption className="sr-only">{screenshot.caption ?? screenshot.alt}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
        {screenshots.length > 3 && (
          <button
            className="gallery-more"
            type="button"
            data-gallery-more
            aria-expanded="false"
            aria-controls={`${id}-screenshots`}
            aria-label={`Show ${screenshots.length - 3} more screenshots of ${name}`}
            disabled
          >
            + {screenshots.length - 3} more
          </button>
        )}
      </div>
    </div>
  );
}

export default async function Home() {
  const projects = await Promise.all(personalProjects.map(async (project) => ({
    ...project,
    ...await loadRepositoryGallery(project.repository),
  })));

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="site-header">
        <nav className="container" aria-label="Main navigation">
          <a href="#personal-projects">Projects</a>
          <a href="#experience">Experience</a>
          <a href="#education">Education</a>
          <a href="#contact">Contact</a>
          <a className="back-to-top" href="#home" aria-label="Back to top">
            <span aria-hidden="true">↑</span>
          </a>
        </nav>
      </header>

      <main id="main" className="container">
        <section className="hero" id="home" aria-labelledby="intro-title">
          <Image
            className="portrait"
            src="/artem-belyavsky.png"
            alt="Artem Belyavsky"
            width={400}
            height={400}
            sizes="(max-width: 600px) 120px, 160px"
            priority
          />
          <div className="hero-content">
            <h1 id="intro-title">{profile.name}</h1>
            <p className="hero-role">
              {profile.seniority} · {profile.role}
            </p>
            <p className="hero-technologies">
              {profile.technologies} · {profile.specialization} · {profile.industry}
            </p>
            <CVInvitation className="hero-contact" />
          </div>
          <div className="hero-summary" id="about">
            <p>
              I build and scale enterprise applications across the full stack,
              from user interfaces to backend services and cloud infrastructure.
              I take end-to-end ownership of features, from clarifying loosely
              defined requirements through design and implementation to deployment
              and production monitoring. I care about faster delivery, lower
              operational costs, and a better customer experience.
            </p>
            <p>
              I integrate AI and LLM capabilities into products and use AI coding
              agents throughout development. I set the technical direction, make
              architectural decisions, and guide their work, validating the results
              through code review and testing.
            </p>
          </div>
        </section>

        <section
          className="section"
          id="personal-projects"
          aria-labelledby="personal-projects-title"
        >
          <div className="section-heading">
            <h2 id="personal-projects-title">
              <HeadingLink href="#personal-projects">Personal projects</HeadingLink>
            </h2>
            <p>Independent projects and experiments.</p>
          </div>
          <nav className="project-index" aria-label="Project index">
            <ul>
              {projects.map((project) => (
                <li key={project.id}><a href={`#${project.id}`}>{project.name}</a></li>
              ))}
            </ul>
          </nav>
          <div className="personal-project-grid">
            {projects.map((project) => (
              <article
                className="personal-project-card"
                id={project.id}
                aria-labelledby={`${project.id}-title`}
                key={project.id}
              >
                <h3 id={`${project.id}-title`}>
                  <HeadingLink href={`#${project.id}`}>{project.name}</HeadingLink>
                </h3>
                <p>{project.description}</p>
                {project.repositoryUrl && (
                  <a className="repository-link" href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
                    View on GitHub ↗<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                )}
                <details>
                  <summary>
                    Implementation details
                    <span className="sr-only">{` for ${project.name}`}</span>
                  </summary>
                  <ul className="achievements">
                    {project.achievements.map((achievement) => (
                      <li key={achievement}>{achievement}</li>
                    ))}
                  </ul>
                </details>
                <ProjectGallery
                  id={project.id}
                  name={project.name}
                  screenshots={project.screenshots}
                />
              </article>
            ))}
          </div>
        </section>

        <section
          className="section"
          id="experience"
          aria-labelledby="experience-title"
        >
          <h2 id="experience-title">
            <HeadingLink href="#experience">Experience</HeadingLink>
          </h2>
          <CVInvitation />
        </section>

        <section
          className="section"
          id="education"
          aria-labelledby="education-title"
        >
          <h2 id="education-title">
            <HeadingLink href="#education">Education</HeadingLink>
          </h2>
          <p>
            Bachelor’s degree in Software Engineering (Information Technologies)
          </p>
          <p className="meta">
            Belarusian State University of Informatics and Radioelectronics
            <br />
            Faculty of Computer Systems and Networks
          </p>

          <h3 className="subheading">Languages</h3>
          <p>English — Fluent · Russian — Native</p>
        </section>

        <section
          className="section"
          id="contact"
          aria-labelledby="contact-title"
        >
          <h2 id="contact-title">
            <HeadingLink href="#contact">Contact</HeadingLink>
          </h2>
          <a className="contact-email" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
          <nav
            className="social-links"
            aria-label="Social and professional profiles"
          >
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}
          </nav>
        </section>
      </main>

      <footer className="site-footer container">
        <p>
          © {profile.year} {profile.name}
        </p>
        <a href="#home">Back to top ↑</a>
      </footer>
      <dialog className="screenshot-dialog" aria-labelledby="screenshot-title">
        <div className="screenshot-dialog-heading">
          <h2 id="screenshot-title">Project screenshots</h2>
          <form method="dialog">
            <button type="submit">Close</button>
          </form>
        </div>
        <figure>
          <div className="screenshot-dialog-media" />
          <figcaption id="screenshot-caption" />
        </figure>
        <div className="screenshot-dialog-controls">
          <button
            type="button"
            data-screenshot-previous
            aria-label="Previous screenshot"
          >
            <span aria-hidden="true">←</span>
            <span className="screenshot-button-label">Previous</span>
          </button>
          <p className="meta" data-screenshot-position aria-live="polite" />
          <button
            type="button"
            data-screenshot-next
            aria-label="Next screenshot"
          >
            <span className="screenshot-button-label">Next</span>
            <span aria-hidden="true">→</span>
          </button>
          <a data-screenshot-original target="_blank" rel="noopener noreferrer">
            Open original ↗
          </a>
        </div>
      </dialog>
      <Script id="section-navigation" strategy="afterInteractive">
        {navigationScript}
      </Script>
      <Script id="screenshot-gallery" strategy="afterInteractive">
        {galleryScript}
      </Script>
    </>
  );
}

const galleryScript = `
  (() => {
    document.querySelectorAll("[data-gallery-more]").forEach(button => {
      button.disabled = false;
      const list = document.getElementById(button.getAttribute("aria-controls"));
      const screenshots = Array.from(list.children);
      button.addEventListener("click", () => {
        const expanded = button.getAttribute("aria-expanded") !== "true";
        screenshots.forEach((item, index) => { item.hidden = !expanded && index >= 3; });
        button.setAttribute("aria-expanded", String(expanded));
        button.textContent = expanded ? "Show less" : "+ " + (screenshots.length - 3) + " more";
        button.setAttribute("aria-label", expanded
          ? "Show fewer screenshots of " + button.closest(".project-gallery").dataset.galleryName
          : "Show " + (screenshots.length - 3) + " more screenshots of " + button.closest(".project-gallery").dataset.galleryName);
      });
    });

    const dialog = document.querySelector(".screenshot-dialog");
    if (!dialog || typeof dialog.showModal !== "function") return;

    // Load an original image only when a visitor opens its preview.
    const image = document.createElement("img");
    image.decoding = "async";
    dialog.querySelector(".screenshot-dialog-media").append(image);
    const title = dialog.querySelector("#screenshot-title");
    const caption = dialog.querySelector("#screenshot-caption");
    const position = dialog.querySelector("[data-screenshot-position]");
    const previous = dialog.querySelector("[data-screenshot-previous]");
    const next = dialog.querySelector("[data-screenshot-next]");
    const original = dialog.querySelector("[data-screenshot-original]");
    let items = [];
    let index = 0;
    let trigger = null;
    let previousOverflow = "";

    function showImage(newIndex) {
      index = (newIndex + items.length) % items.length;
      const link = items[index];
      image.alt = link.querySelector("img").alt;
      image.src = link.href;
      caption.textContent = link.dataset.caption;
      position.textContent = (index + 1) + " / " + items.length;
      original.href = link.href;
      previous.hidden = next.hidden = items.length < 2;
    }

    document.addEventListener("click", event => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest("a[data-screenshot]");
      if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const gallery = link.closest(".project-gallery");
      items = Array.from(gallery.querySelectorAll("a[data-screenshot]"));
      trigger = link;
      title.textContent = gallery.dataset.galleryName;
      showImage(items.indexOf(link));
      previousOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = "hidden";
      dialog.showModal();
    });

    previous.addEventListener("click", () => showImage(index - 1));
    next.addEventListener("click", () => showImage(index + 1));
    dialog.addEventListener("keydown", event => {
      if (event.altKey || event.ctrlKey || event.metaKey || items.length < 2) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        showImage(index + (event.key === "ArrowRight" ? 1 : -1));
      }
    });
    dialog.addEventListener("click", event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
    dialog.addEventListener("close", () => {
      document.documentElement.style.overflow = previousOverflow;
      image.removeAttribute("src");
      trigger?.focus({ preventScroll: true });
    });
  })();
`;

// Enhance native anchor links after hydration; the page remains server-rendered.
const navigationScript = `
  (() => {
    const header = document.querySelector(".site-header");
    if (!header) return;

    const links = Array.from(header.querySelectorAll("a:not(.back-to-top)"));
    const sections = links.map(link => document.getElementById(link.hash.slice(1)));
    let activeSection = null;
    let scheduled = false;

    function updateCurrentSection() {
      scheduled = false;
      const offset = header.getBoundingClientRect().height + 24;
      let currentSection = null;

      sections.forEach(section => {
        if (section.getBoundingClientRect().top <= offset + 1) {
          currentSection = section.id;
        }
      });

      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        currentSection = sections[sections.length - 1].id;
      }

      if (activeSection === currentSection) return;
      activeSection = currentSection;
      links.forEach(link => {
        if (link.hash === "#" + currentSection) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    function scheduleUpdate() {
      if (!scheduled) {
        scheduled = true;
        window.requestAnimationFrame(updateCurrentSection);
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      document.documentElement.style.setProperty(
        "--navigation-height", header.getBoundingClientRect().height + "px"
      );
      scheduleUpdate();
    });
    resizeObserver.observe(header);
    resizeObserver.observe(document.querySelector("main"));
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", scheduleUpdate);
    scheduleUpdate();
  })();
`;

// Page styles stay in this file; system fonts load without network requests.
const styles = `
  :root {
    color-scheme: light;
    --ink: #202124;
    --muted: #62666d;
    --line: #e5e7eb;
    --link: #2457a7;
  }
  html {
    scroll-padding-top: calc(var(--navigation-height, 61px) + 24px);
  }
  body {
    margin: 0;
    background: #fff;
    color: var(--ink);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 16px;
    line-height: 1.7;
    -webkit-font-smoothing: antialiased;
  }
  *, *::before, *::after {
    box-sizing: border-box;
  }
  h1, h2, h3, p, ul, dl, dd, figure {
    margin: 0;
  }
  h1, h2, h3 {
    color: var(--ink);
    font-weight: 650;
    line-height: 1.3;
  }
  h1 {
    font-size: clamp(28px, 5vw, 38px);
    letter-spacing: -0.035em;
  }
  h2 {
    margin-bottom: 28px;
    font-size: 24px;
    letter-spacing: -0.02em;
  }
  h3 {
    font-size: 19px;
  }
  p + p {
    margin-top: 12px;
  }
  a {
    color: var(--link);
    text-decoration: underline;
    text-underline-offset: 4px;
    text-decoration-thickness: 1px;
  }
  a:hover {
    text-decoration-thickness: 2px;
  }
  a:focus-visible, summary:focus-visible, button:focus-visible {
    outline: 2px solid var(--link);
    outline-offset: 4px;
    border-radius: 2px;
  }
  .heading-link {
    color: inherit;
    text-decoration: none;
    overflow-wrap: anywhere;
  }
  .heading-link:hover {
    text-decoration: underline;
  }
  .heading-link-icon {
    display: inline-block;
    width: 0.8em;
    height: 0.8em;
    margin-left: 0.35em;
    vertical-align: -0.05em;
    color: var(--muted);
  }
  .heading-link:hover .heading-link-icon,
  .heading-link:focus-visible .heading-link-icon {
    color: var(--link);
  }
  .container {
    width: min(760px, calc(100% - 48px));
    margin-inline: auto;
  }
  .site-header {
    position: sticky;
    top: 0;
    z-index: 10;
    padding-block: 8px;
    border-bottom: 1px solid var(--line);
    background: #fff;
  }
  .site-header nav, .social-links {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 24px;
  }
  .site-header nav {
    justify-content: center;
    gap: 4px 8px;
  }
  .site-header a, .social-links a, .site-footer a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
  }
  .site-header a {
    padding: 8px;
    border-bottom: 2px solid transparent;
    color: var(--muted);
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
  }
  .site-header a:hover {
    color: var(--link);
  }
  .site-header a[aria-current="location"] {
    border-bottom-color: var(--link);
    color: var(--link);
  }
  .site-header .back-to-top {
    justify-content: center;
    width: 44px;
    font-size: 20px;
    line-height: 1;
  }
  .hero {
    display: grid;
    grid-template-columns: 160px minmax(0, 1fr);
    align-items: start;
    gap: 32px;
    padding-block: 48px;
  }
  .portrait {
    display: block;
    width: 160px;
    height: 160px;
    border-radius: 8px;
    background: #f3f4f6;
    object-fit: cover;
  }
  .hero-role {
    margin-top: 12px;
    font-size: 18px;
    font-weight: 600;
  }
  .hero-technologies {
    margin-top: 8px;
    color: var(--muted);
  }
  .hero-summary {
    grid-column: 1 / -1;
  }
  .hero-contact {
    margin-top: 16px;
  }
  .section {
    padding-block: 40px;
    border-top: 1px solid var(--line);
  }
  .section-heading {
    margin-bottom: 24px;
  }
  .section-heading h2 {
    margin-bottom: 8px;
  }
  .section-heading p {
    color: var(--muted);
  }
  .project-index { margin-bottom: 28px; }
  .project-index ul { padding-left: 22px; list-style: disc; }
  .project-index a { display: inline-block; padding-block: 6px; }
  .repository-link { width: fit-content; font-size: 14px; padding-block: 6px; }
  .personal-project-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
  }
  .personal-project-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
    padding: 24px;
    border: 1px solid var(--line);
    border-radius: 8px;
  }
  .personal-project-card p + p {
    margin-top: 0;
  }
  .personal-project-card details {
    margin-top: 0;
  }
  .project-gallery {
    align-self: flex-end;
    width: min(100%, 324px);
    margin-top: auto;
    padding-top: 8px;
  }
  .project-gallery > .meta {
    margin-bottom: 8px;
    text-align: right;
    font-size: 12px;
  }
  .gallery-preview {
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    gap: 8px;
  }
  .screenshot-grid {
    display: grid;
    flex: 1;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    max-width: 256px;
    padding: 0;
    list-style: none;
  }
  .screenshot-grid > li[hidden] { display: none; }
  .gallery-more {
    flex: 0 0 72px;
    white-space: nowrap;
    min-height: 44px;
    padding: 4px;
    border: 1px solid var(--line);
    border-radius: 6px;
    background: #fff;
    color: var(--link);
    font: inherit;
    font-size: 12px;
    cursor: pointer;
  }
  .gallery-more:hover { background: #f3f4f6; }
  .screenshot-link {
    display: block;
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: 6px;
    background: #f3f4f6;
    cursor: zoom-in;
  }
  .screenshot-link:hover {
    border-color: var(--link);
  }
  .screenshot-link img {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 10;
    object-fit: contain;
  }
  .project-gallery figcaption, .screenshot-dialog figcaption {
    margin-top: 8px;
    color: var(--muted);
    font-size: 14px;
    overflow-wrap: anywhere;
  }
  .screenshot-dialog {
    width: min(1100px, calc(100% - 32px));
    max-height: calc(100vh - 32px);
    max-height: calc(100dvh - 32px);
    margin: auto;
    padding: 20px;
    border: 1px solid var(--line);
    border-radius: 10px;
    background: #fff;
    color: var(--ink);
  }
  .screenshot-dialog::backdrop {
    background: rgb(17 24 39 / 75%);
  }
  .screenshot-dialog-heading, .screenshot-dialog-controls {
    display: flex;
    align-items: center;
    gap: 8px 16px;
  }
  .screenshot-dialog-heading {
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }
  .screenshot-dialog h2 {
    margin: 0;
    font-size: 18px;
  }
  .screenshot-dialog button, .screenshot-dialog-controls a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-width: 44px;
    min-height: 44px;
    padding: 8px 12px;
    border: 1px solid var(--line);
    border-radius: 5px;
    background: #fff;
    color: var(--link);
    font: inherit;
    font-size: 14px;
    white-space: nowrap;
    cursor: pointer;
  }
  .screenshot-dialog button:hover {
    background: #f3f4f6;
  }
  .screenshot-dialog button[hidden] {
    display: none;
  }
  .screenshot-dialog-media {
    display: grid;
    place-items: center;
    min-height: 80px;
    background: #f3f4f6;
  }
  .screenshot-dialog-media img {
    display: block;
    max-width: 100%;
    max-height: 65vh;
    max-height: 65dvh;
    object-fit: contain;
  }
  .screenshot-dialog-controls {
    flex-wrap: wrap;
    margin-top: 16px;
  }
  .screenshot-dialog-controls p {
    margin: 0;
  }
  .screenshot-dialog-controls a {
    margin-left: auto;
  }
  .meta {
    color: var(--muted);
    font-size: 14px;
  }
  details {
    margin-top: 8px;
  }
  summary {
    width: fit-content;
    max-width: 100%;
    min-height: 44px;
    padding-block: 8px;
    color: var(--link);
    cursor: pointer;
    font-size: 14px;
  }
  details p {
    margin-top: 4px;
  }
  .job-heading {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 4px 16px;
  }
  .job-role {
    margin-top: 4px;
    font-weight: 500;
  }
  .job-role + p {
    margin-top: 8px;
  }
  .achievements {
    margin-top: 16px;
    padding-left: 20px;
    list-style: disc;
  }
  .achievements li + li {
    margin-top: 8px;
  }
  .subheading {
    margin: 28px 0 12px;
    font-size: 17px;
  }
  .contact-email {
    display: inline-block;
    padding-block: 8px;
    overflow-wrap: anywhere;
  }
  .social-links {
    margin-top: 8px;
    font-size: 14px;
  }
  .site-footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 8px 24px;
    padding-block: 16px 32px;
    border-top: 1px solid var(--line);
    color: var(--muted);
    font-size: 13px;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
  .skip-link {
    position: fixed;
    top: 12px;
    left: 12px;
    z-index: 20;
    padding: 8px 16px;
    background: #fff;
    transform: translateY(-200%);
  }
  .skip-link:focus {
    transform: translateY(0);
  }
  @media (max-width: 600px) {
    .hero {
      grid-template-columns: minmax(0, 1fr);
      gap: 20px;
      padding-block: 32px;
    }
    .portrait {
      width: 120px;
      height: 120px;
    }
  }
  @media (max-width: 480px) {
    .container {
      width: calc(100% - 32px);
    }
    .site-header nav {
      width: calc(100% - 16px);
      column-gap: 2px;
    }
    .site-header a {
      padding-inline: 2px;
      font-size: 13px;
    }
    .site-header .back-to-top {
      width: 28px;
      font-size: 18px;
    }
    .section {
      padding-block: 32px;
    }
    .job-heading {
      flex-direction: column;
    }
    .screenshot-dialog {
      padding: 12px;
    }
    .screenshot-dialog-media img {
      max-height: 50vh;
      max-height: 50dvh;
    }
    .screenshot-button-label {
      display: none;
    }
    .screenshot-dialog-controls {
      justify-content: space-between;
      gap: 8px;
    }
    .screenshot-dialog-controls a {
      width: 100%;
      margin-left: 0;
    }
  }
  @media (max-width: 359px) {
    html {
      --navigation-height: 105px;
    }
    .site-header nav {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0 4px;
    }
    .site-header a {
      justify-content: center;
    }
    .site-header .back-to-top {
      width: auto;
    }
  }
`;
