const SERVICES = [
  {
    n: "01",
    title: "Agent architecture",
    body: "Autonomous agents that hold a task end to end — tool selection, retries, and escalation paths designed up front, not bolted on.",
    tags: ["LangGraph", "MCP", "Evals"],
  },
  {
    n: "02",
    title: "Retrieval that holds up",
    body: "Hybrid search over your actual corpus, with citations that survive review. If it can't show its sources, it doesn't ship.",
    tags: ["RAG", "pgvector", "Hybrid"],
  },
  {
    n: "03",
    title: "Fine-tuning & distillation",
    body: "When prompting stops paying, we train. Distilled models at a fraction of the latency and cost, tuned on your data.",
    tags: ["LoRA", "Distillation", "H100"],
  },
  {
    n: "04",
    title: "Inference at scale",
    body: "Batching, caching, routing and fallback chains so serving cost follows volume instead of eating the margin.",
    tags: ["vLLM", "Caching", "Routing"],
  },
]

export default function Hero() {
  return (
    <>
      <section className="relative flex min-h-screen flex-col justify-center px-6 md:px-16">
        <div className="max-w-2xl">
          <p className="mb-6 font-mono text-xs uppercase tracking-[0.35em] text-signal">
            Applied AI engineering
          </p>
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            Intelligence
            <br />
            <span className="bg-gradient-to-r from-neural via-signal to-synapse bg-clip-text text-transparent">
              you can deploy.
            </span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/60">
            We build the AI layer for companies that need it to work on a Tuesday
            afternoon, not just demo on a stage. Agents, retrieval, and serving
            infrastructure — engineered end to end.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#services"
              className="rounded-full bg-white px-7 py-3 font-medium text-ink transition hover:bg-signal"
            >
              See capabilities
            </a>
            <a
              href="#contact"
              className="glass rounded-full px-7 py-3 font-medium text-white/80 transition hover:border-white/30"
            >
              Book a consult
            </a>
          </div>
        </div>

        <p className="mt-16 font-mono text-xs text-white/30">
          Move your cursor — the network responds. Scroll to wake it up.
        </p>
      </section>

      <section id="services" className="relative px-6 py-32 md:px-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-3xl font-semibold md:text-5xl">
            What we build
          </h2>
          <p className="mt-4 max-w-2xl text-white/50">
            Four things we're asked for most. Each one scoped as a deliverable,
            not a retainer.
          </p>

          <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2">
            {SERVICES.map((s) => (
              <article key={s.n} className="group bg-ink p-8 transition hover:bg-white/[0.03] md:p-10">
                <p className="font-mono text-xs text-signal">{s.n}</p>
                <h3 className="mt-4 font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-3 leading-relaxed text-white/50">{s.body}</p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {s.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-white/40"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="relative px-6 py-32 text-center md:px-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-4xl font-semibold md:text-6xl">
            Let's find the gap
            <br />
            in your stack.
          </h2>
          <p className="mt-6 text-white/50">
            A 30-minute call. We'll tell you honestly whether you need this built
            or whether a script would do.
          </p>
          <a
            href="mailto:hello@example.com"
            className="mt-10 inline-block rounded-full bg-white px-8 py-4 font-medium text-ink transition hover:bg-signal"
          >
            hello@example.com
          </a>
        </div>
      </section>

      <footer className="relative border-t border-white/10 px-6 py-10 text-center font-mono text-xs text-white/30 md:px-16">
        © {new Date().getFullYear()} — Applied AI engineering
      </footer>
    </>
  )
}