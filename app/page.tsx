import Link from "next/link";
import {
  Shield,
  Camera,
  FileText,
  ArrowRight,
  Sparkles,
  Building2,
  Zap,
  Flame,
  Droplets,
  ClipboardList,
  CheckCircle2,
  Lock,
} from "lucide-react";

function FeatureCard({
  icon: Icon,
  title,
  desc,
  color,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-all hover:shadow-md">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div>
        <h3 className="font-semibold text-[var(--foreground)]">{title}</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">{desc}</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Nav */}
      <nav className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)]">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[var(--foreground)]">
              NTRU
            </span>
          </div>
          <Link
            href="#get-started"
            className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[var(--primary-light)] shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2a0e42] via-[#3D1556] to-[#2a0e42]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDF6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-purple-100 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Empowering Risk Solutions
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              AI-Powered
              <br />
              <span className="text-[var(--accent-light)]">Risk Surveys</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-purple-100">
              Complete GCC-standard property checklists, upload site photos, and
              generate professional Risk Inspection Reports in minutes. Built for
              insurance risk engineers.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/survey?role=surveyor"
                className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-7 py-3.5 text-base font-semibold text-[#1a0a2e] shadow-lg transition-all hover:bg-[var(--accent-light)] hover:shadow-xl"
              >
                <ClipboardList className="h-5 w-5" />
                Start Survey
              </Link>
              <Link
                href="/survey?role=analyst"
                className="flex items-center gap-2 rounded-xl bg-white/10 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                <Lock className="h-5 w-5" />
                Analyst Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[var(--foreground)]">
            How It Works
          </h2>
          <p className="mt-3 text-[var(--muted)]">
            From checklist to professional report in three steps
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {[
            {
              icon: ClipboardList,
              step: "01",
              title: "Complete Checklist",
              desc: "Fill in the property survey checklist covering construction, fire protection, EHS, and maintenance across 5 comprehensive sections.",
            },
            {
              icon: Camera,
              step: "02",
              title: "Upload Photos",
              desc: "Take or upload site photos and tag them by section. Our AI cross-references visual evidence with your checklist data.",
            },
            {
              icon: FileText,
              step: "03",
              title: "Get RI Report",
              desc: "Receive a professional Risk Inspection Report with section analysis, compliance tables, and prioritized recommendations.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="group relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 transition-all hover:shadow-lg hover:border-[var(--primary)]/30"
            >
              <span className="absolute top-5 right-5 text-4xl font-black text-gray-100">
                {item.step}
              </span>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 transition-colors group-hover:bg-purple-100">
                <item.icon className="h-6 w-6 text-[var(--primary)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* V2 Features */}
      <section className="border-t border-[var(--border)] bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[var(--foreground)]">
              Professional-Grade Reports
            </h2>
            <p className="mt-3 text-[var(--muted)]">
              Matching GCC insurance industry standards with AI-powered analysis
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Building2}
              title="5-Section Checklist"
              desc="General info, construction, fire protection, EHS hazards, and housekeeping"
              color="#3b82f6"
            />
            <FeatureCard
              icon={Flame}
              title="Fire Protection Analysis"
              desc="Detection systems, sprinklers, extinguishers, emergency exits, and brigade access"
              color="#ef4444"
            />
            <FeatureCard
              icon={CheckCircle2}
              title="Compliance Tables"
              desc="Color-coded compliance status for all critical safety and security items"
              color="#22c55e"
            />
            <FeatureCard
              icon={Zap}
              title="AI Photo Analysis"
              desc="Cross-references your checklist data with visual evidence from tagged photos"
              color="#f59e0b"
            />
            <FeatureCard
              icon={Droplets}
              title="Risk Scoring"
              desc="Section-by-section scoring (1-100) with overall risk grade and executive summary"
              color="#06b6d4"
            />
            <FeatureCard
              icon={FileText}
              title="PDF Export"
              desc="Download professional RI reports as PDF or print directly from your browser"
              color="#8b5cf6"
            />
          </div>
        </div>
      </section>

      {/* Get Started */}
      <section id="get-started" className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--foreground)]">
              Get Started
            </h2>
            <p className="mt-3 text-[var(--muted)]">
              Choose your role to begin
            </p>
          </div>

          <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
            {/* Surveyor Card */}
            <Link
              href="/survey?role=surveyor"
              className="group rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] p-8 text-left transition-all hover:border-[var(--primary)] hover:shadow-xl"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 transition-colors group-hover:bg-purple-200">
                <ClipboardList className="h-6 w-6 text-[var(--primary)]" />
              </div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">
                Surveyor
              </h3>
              <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
                Capture site photos, fill the property checklist, and download your survey data for submission.
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
                Start Survey <ArrowRight className="h-4 w-4" />
              </div>
            </Link>

            {/* Analyst Card */}
            <Link
              href="/survey?role=analyst"
              className="group rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] p-8 text-left transition-all hover:border-[var(--primary)] hover:shadow-xl"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 transition-colors group-hover:bg-purple-200">
                <Shield className="h-6 w-6 text-[var(--primary)]" />
              </div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">
                Analyst
              </h3>
              <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
                Import survey data, run AI-powered risk analysis, and generate professional RI reports.
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
                <Lock className="h-3.5 w-3.5" /> Enter with PIN <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-6xl px-6 py-6 text-center text-sm text-[var(--muted)]">
          NTRU &mdash; NewTech Reinsurance &amp; Underwriting Limited
        </div>
      </footer>
    </div>
  );
}
