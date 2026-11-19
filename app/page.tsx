import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Code2,
  Workflow,
  ShieldCheck,
  Sparkles,
  MapPin,
  MessageSquare,
  Layers3,
  Route,
  Plane,
  MoveUpRight,
  Mail,
  Phone,
  Clock3,
} from "lucide-react";
import { ServiceRail } from "@/components/service-rail";
import { ContactForm } from "@/components/contact-form";
import Image from "next/image";
import { business } from "@/lib/config";
const services = [
  {
    icon: Code2,
    title: "Custom Software Development",
    text: "Software shaped around your business. Turn an idea or everyday bottleneck into a reliable, easy-to-use application.",
    items: [
      "Business applications & web platforms",
      "Startup MVP development",
      "Internal tools & dashboards",
    ],
  },
  {
    icon: Workflow,
    title: "Business Process Automation",
    text: "Give your time back to the work that matters. Connect your systems and take repetitive tasks off your plate.",
    items: [
      "Workflow automation & integrations",
      "Data processing & reporting",
      "AI-assisted workflows",
    ],
  },
  {
    icon: ShieldCheck,
    title: "QA & Test Automation",
    text: "Release with greater confidence. Find issues earlier and build quality into your software, from API to interface.",
    items: [
      "API automation & web testing",
      "Test framework development",
      "Quality engineering & regression testing",
    ],
  },
  {
    icon: Sparkles,
    title: "AI & Technology Solutions",
    text: "Make technology useful, not complicated. Find practical ways to improve how your business works.",
    items: [
      "AI-powered business tools",
      "AI workflow integration",
      "Process improvement & consulting",
    ],
  },
];
const problems = [
  "Spending too much time on repetitive tasks?",
  "Managing customer information manually?",
  "Losing track of orders, payments or follow-ups?",
  "Working with spreadsheets and disconnected systems?",
  "Need a website or application for your business?",
  "Have a startup idea but need help building an MVP?",
];
export default function Home() {
  const structured = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: business.name,
    alternateName: "DS2",
    url: business.url,
    logo: new URL("/brand/ds2-logo.png", business.url).href,
    description:
      "Independent software development, automation, quality engineering and technology consulting business based in Chennai, India.",
    founder: { "@type": "Person", name: business.founder },
    areaServed: [
      { "@type": "City", name: "Chennai" },
      { "@type": "Country", name: "India" },
    ],
    ...(business.email ? { email: business.email } : {}),
  };
  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structured).replace(/</g, "\\u003c"),
        }}
      />
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-artwork" aria-hidden="true">
            <Image
              src="/images/hero-technology-f9f8d6cc294d.png"
              alt=""
              fill
              priority
              sizes="(max-width: 760px) calc(100vw - 40px), 55vw"
            />
          </div>
          <div className="hero-title">
            <div className="eyebrow">
              <span className="status-dot" /> BUILT AROUND YOUR BUSINESS
            </div>
            <h1>
              Your Business Problem.
              <br />
              <span>Our Technology Solution.</span>
            </h1>
          </div>
          <div className="hero-copy">
            <p className="hero-description">
              Turn your everyday business challenges into opportunities for
              growth. We help you simplify your work, connect with more
              customers and turn enquiries into sales through practical
              technology solutions.
            </p>
            <div className="hero-actions">
              <a href="#contact" className="button">
                <span className="cta-monogram" aria-hidden="true">
                  SK
                </span>
                Discuss Your Business Problem <ArrowUpRight size={17} />
              </a>
              <a href="#services" className="button button-outline">
                Explore Our Services <ArrowRight size={17} />
              </a>
            </div>
            <p className="hero-location">
              <MapPin size={15} /> Independent technology solutions business
              based in Chennai, India.
            </p>
          </div>
        </div>
        <div className="trust-strip container">
          <p>Practical thinking. Experience you can build on.</p>
          <div className="trust-facts">
            <span>
              <strong>15+ years</strong> of industry experience
            </span>
            <span>
              <strong>Business-first</strong> technology thinking
            </span>
            <span>
              <strong>Chennai-based.</strong> Global perspective.
            </span>
          </div>
        </div>
      </section>
      <section id="services" className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">01 / DS2 SERVICES</p>
              <h2>
                The right technology.
                <br />A better way to work.
              </h2>
            </div>
            <p>
              From your first idea to your everyday operations,
              <br className="desktop-break" /> we build solutions that move your
              business forward.
            </p>
          </div>
          <ServiceRail>
            {services.map(({ icon: Icon, title, text, items }) => (
              <article className="service-card" key={title}>
                <div className="card-top">
                  <span className="icon-box">
                    <Icon size={24} />
                  </span>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
                <ul>
                  {items.map((x) => (
                    <li key={x}>
                      <Check size={15} />
                      {x}
                    </li>
                  ))}
                </ul>
                <a className="text-link" href="#contact">
                  Let’s explore what you need <ArrowUpRight size={17} />
                </a>
              </article>
            ))}
          </ServiceRail>
        </div>
      </section>
      <section className="problems section">
        <div className="container problems-grid">
          <div>
            <p className="eyebrow">A GOOD PLACE TO START</p>
            <h2>
              Tell us what’s
              <br />
              slowing your
              <br />
              <span>business down.</span>
            </h2>
            <p>
              You don’t need to know which technology to use. Start by telling
              us the problem.
            </p>
            <a href="#contact" className="button">
              Let’s Discuss Your Challenge <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="problem-list">
            {problems.map((x, i) => (
              <div key={x}>
                <span>0{i + 1}</span>
                <p>{x}</p>
                <ArrowUpRight size={18} />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="approach" className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">02 / OUR APPROACH</p>
              <h2>
                Clear steps.
                <br />
                Shared expectations.
              </h2>
            </div>
            <p>
              No unnecessary complexity.
              <br />
              Just a practical path from problem to solution.
            </p>
          </div>
          <div className="steps">
            {[
              [
                "Understand",
                "Learn about your business, how you work and what’s getting in the way.",
              ],
              [
                "Recommend",
                "Identify practical, cost-effective solutions that fit your priorities.",
              ],
              [
                "Build",
                "Develop, automate or integrate the right technology for your needs.",
              ],
              [
                "Deliver",
                "Test thoroughly, launch thoughtfully and hand over a solution ready to use.",
              ],
              [
                "Support",
                "Help you use the solution, resolve issues and adapt as your business grows.",
              ],
            ].map(([title, text], i) => (
              <article key={title}>
                <div className="step-number">
                  0{i + 1}
                  <ArrowRight size={18} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="products" className="section products">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">03 / DS2 PRODUCTS</p>
              <h2>
                Beyond services.
                <br />
                Building products that matter.
              </h2>
            </div>
            <p>
              We don’t just build for others. We identify real-world problems
              and develop our own digital products.
            </p>
          </div>
          <article className="product-card">
            <div className="travel-art" aria-hidden="true">
              <div className="travel-ring ring-one" />
              <div className="travel-ring ring-two" />
              <div className="travel-ring ring-three" />
              <span className="travel-pin pin-one">
                <MapPin size={26} />
              </span>
              <span className="travel-pin pin-two">
                <MapPin size={26} />
              </span>
              <div className="travel-path" />
              <div className="plane">
                <Plane size={44} />
              </div>
              <div className="travel-caption">
                A little help.
                <br />
                <strong>A better journey.</strong>
              </div>
              <span className="travel-coordinates">
                CONNECTING PEOPLE. MAKING JOURNEYS EASIER.
              </span>
            </div>
            <div className="product-copy">
              <span className="pill">AN INDEPENDENT DS2 PRODUCT</span>
              <div className="product-title">
                <Route size={30} />
                <h3>
                  NammaTravelAssist<span>NTA</span>
                </h3>
              </div>
              <p>
                A travel-tech platform connecting travellers with people who
                need assistance during their journeys, helping make travel
                easier through verified traveller profiles and community
                connections.
              </p>
              <a
                className="text-link"
                href={business.product.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Explore NammaTravelAssist <ArrowUpRight size={18} />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          </article>
        </div>
      </section>
      <section id="about" className="section about-section">
        <div className="container about-grid">
          <div className="about-story">
            <p className="eyebrow">04 / ABOUT DS2</p>
            <h2>
              Technology that
              <br />
              solves real problems.
            </h2>
            <div className="about-promise">
              <span>YOUR BUSINESS, UNDERSTOOD.</span>
              <strong>
                Practical ideas.
                <br />
                Purposeful technology.
              </strong>
            </div>
            <p className="about-lead">
              Good technology starts with understanding your business.
            </p>
            <p>
              DurgaSoftwareSolutions is an independent technology services and
              product development business. We take the time to understand the
              challenge before recommending a solution — with practical
              thinking, transparent communication and quality at every step.
            </p>
            <p>
              Our mission is simple: solve real problems and deliver solutions
              that work. We build for lasting value and long-term relationships.
            </p>
          </div>
          <div className="founder-card">
            <div className="founder-top">
              <Image
                className="founder-photo"
                src="/team/sasikumar-karikalan.png"
                alt="Sasikumar Karikalan, founder of DurgaSoftwareSolutions"
                width={1254}
                height={1254}
                sizes="(max-width: 760px) 104px, 128px"
              />
              <span className="pill">FOUNDER. BUILDER. PROBLEM SOLVER.</span>
            </div>
            <h3>{business.founder}</h3>
            <p className="founder-title">{business.title}</p>
            <div className="founder-experience">
              <strong>
                15<span>+</span>
              </strong>
              <p>
                years of software
                <br />
                industry experience
              </p>
            </div>
            <p>
              My journey includes six years in corporate technology roles in
              India and six years in Boston, USA, with experience at Wipro and
              working with international clients.
            </p>
            <p>
              Today, I work as an independent tech builder through DS2 —
              building software, automating workflows and developing digital
              products that solve real-world business problems. I bring hands-on
              experience in quality engineering, automation and web development
              to every project.
            </p>
            <ul>
              {[
                "Software quality engineering & automation",
                "Modern software application development",
                "Independent product building & problem-solving",
              ].map((x) => (
                <li key={x}>
                  <Check size={16} />
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="container values">
          <div className="values-heading">
            <span className="eyebrow">WHY WORK WITH DS2?</span>
            <h3>A foundation of trust.</h3>
          </div>
          {[
            [MessageSquare, "Problem-first thinking"],
            [Layers3, "Transparent communication"],
            [ShieldCheck, "Quality-focused delivery"],
            [MoveUpRight, "Practical and scalable solutions"],
          ].map(([Icon, title]) => {
            const I = Icon as typeof MessageSquare;
            return (
              <div className="value" key={String(title)}>
                <I size={21} />
                <span>{String(title)}</span>
              </div>
            );
          })}
        </div>
      </section>
      <section id="contact" className="section contact">
        <div className="container contact-grid">
          <div>
            <p className="eyebrow">LET’S BUILD SOMETHING USEFUL</p>
            <h2>
              Let’s solve your
              <br />
              next business
              <br />
              <span>challenge.</span>
            </h2>
            <p>
              Whether you’re running a small business, building a startup or
              looking to automate a workflow, let’s start with a conversation.
            </p>
            <div className="contact-note">
              <Clock3 size={22} />
              <div>
                <strong>A clear next step for your business.</strong>
                <span>We’ll get back to you within hours or the same day.</span>
              </div>
            </div>
            <a className="contact-phone" href={`tel:${business.phone}`}>
              <span className="contact-phone-icon">
                <Phone size={24} />
              </span>
              <span>
                <small>Let’s talk about what you need</small>
                <strong>{business.phoneDisplay}</strong>
              </span>
            </a>
            <div className="contact-location">
              <MapPin size={17} />
              {business.location}
            </div>
            {business.email && (
              <a className="contact-method" href={`mailto:${business.email}`}>
                <Mail size={18} />
                {business.email}
              </a>
            )}
            {business.whatsapp && (
              <a
                className="contact-method"
                href={`https://wa.me/${business.whatsapp}`}
              >
                Chat on WhatsApp <ArrowUpRight size={18} />
              </a>
            )}
          </div>
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
