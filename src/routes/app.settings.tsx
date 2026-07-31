import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "../components/app-shell";
import { Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — AI Research Copilot" },
      { name: "description", content: "Manage your profile, theme, notifications, AI models and API keys." },
      { property: "og:title", content: "Settings — AI Research Copilot" },
      { property: "og:description", content: "Tune your copilot." },
    ],
  }),
  component: Settings,
});

const sections = ["Profile", "Theme", "Language", "Notifications", "AI Models", "API Keys", "Export"] as const;

function Settings() {
  const [tab, setTab] = useState<(typeof sections)[number]>("Profile");
  return (
    <div>
      <PageHeader title="Settings" subtitle="Personalise your copilot to match your workflow." />
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="card-premium h-fit p-3">
          <ul className="space-y-0.5">
            {sections.map((s) => (
              <li key={s}>
                <button onClick={() => setTab(s)} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${tab === s ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>{s}</button>
              </li>
            ))}
          </ul>
        </aside>
        <div className="card-premium p-8">
          {tab === "Profile" && <Profile />}
          {tab === "Theme" && <Theme />}
          {tab === "Language" && <Simple title="Language" desc="Choose your interface language." items={["English (US)", "Español", "Deutsch", "Français", "हिन्दी", "日本語"]} />}
          {tab === "Notifications" && <Notifications />}
          {tab === "AI Models" && <Models />}
          {tab === "API Keys" && <Keys />}
          {tab === "Export" && <Export />}
        </div>
      </div>
    </div>
  );
}

function Profile() {
  return (
    <form onSubmit={(e) => { e.preventDefault(); toast.success("Profile updated"); }} className="max-w-lg space-y-4">
      <h2 className="text-lg font-bold">Profile</h2>
      <div className="flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-brand text-xl font-bold text-white">AR</div>
        <button type="button" className="rounded-lg border border-border/70 bg-white px-3 py-1.5 text-xs font-medium hover:bg-accent">Change avatar</button>
      </div>
      {[
        { l: "Full name", v: "Harshal Mahajan" },
        { l: "Email", v: "team@indiapreneur.com" },
        { l: "Role", v: "Research Lead" },
      ].map((f) => (
        <label key={f.l} className="block">
          <span className="text-xs font-medium">{f.l}</span>
          <input defaultValue={f.v} className="mt-1 w-full rounded-xl border border-border/70 bg-white px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10" />
        </label>
      ))}
      <button className="rounded-xl bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow">Save changes</button>
    </form>
  );
}

function Theme() {
  const [t, setT] = useState("Light");
  return (
    <div>
      <h2 className="text-lg font-bold">Theme</h2>
      <p className="mt-1 text-sm text-muted-foreground">Bright, professional and easy on the eyes.</p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {["Light", "Dim", "Auto"].map((x) => (
          <button key={x} onClick={() => setT(x)}
            className={`rounded-2xl border p-4 text-left ${t === x ? "border-primary bg-primary/5" : "border-border/70 bg-white"}`}>
            <div className="mb-2 h-16 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200" />
            <div className="text-sm font-semibold">{x}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Simple({ title, desc, items }: { title: string; desc: string; items: string[] }) {
  const [sel, setSel] = useState(items[0]);
  return (
    <div>
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {items.map((i) => (
          <button key={i} onClick={() => setSel(i)} className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${sel === i ? "border-primary bg-primary/5 font-semibold" : "border-border/70 bg-white"}`}>
            {i} {sel === i && <Check className="h-4 w-4 text-primary" />}
          </button>
        ))}
      </div>
    </div>
  );
}

function Notifications() {
  const items = ["Weekly research digest", "New hackathon opportunities", "Project completion", "AI suggestions", "Team mentions"];
  return (
    <div>
      <h2 className="text-lg font-bold">Notifications</h2>
      <ul className="mt-4 space-y-2">
        {items.map((i, idx) => (
          <li key={i} className="flex items-center justify-between rounded-xl border border-border/70 bg-white px-4 py-3">
            <span className="text-sm">{i}</span>
            <input type="checkbox" defaultChecked={idx < 3} className="h-4 w-4 accent-[--brand]" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Models() {
  const models = [
    { n: "GPT-5.5", d: "Default reasoning model", on: true },
    { n: "Claude 4 Opus", d: "Long-context research", on: true },
    { n: "Gemini 3 Pro", d: "Multimodal analysis", on: false },
    { n: "Llama 3.3 70B", d: "Local / private inference", on: false },
  ];
  return (
    <div>
      <h2 className="text-lg font-bold">Connected AI Models</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {models.map((m) => (
          <div key={m.n} className="rounded-2xl border border-border/70 bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-bold">{m.n}</div>
                <div className="text-xs text-muted-foreground">{m.d}</div>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${m.on ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>{m.on ? "Active" : "Off"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Keys() {
  return (
    <div>
      <h2 className="text-lg font-bold">API Keys</h2>
      <p className="mt-1 text-sm text-muted-foreground">Rotate anytime. Keys are encrypted at rest.</p>
      <div className="mt-4 space-y-2">
        {[
          { n: "Production", k: "sk_live_••••••••7f2a" },
          { n: "Staging", k: "sk_test_••••••••b3e1" },
        ].map((k) => (
          <div key={k.n} className="flex items-center justify-between rounded-xl border border-border/70 bg-white px-4 py-3">
            <div><div className="text-sm font-semibold">{k.n}</div><div className="font-mono text-xs text-muted-foreground">{k.k}</div></div>
            <div className="flex gap-1.5">
              <button className="rounded-lg border border-border/70 bg-white px-3 py-1.5 text-xs font-medium hover:bg-accent">Copy</button>
              <button className="rounded-lg bg-gradient-brand px-3 py-1.5 text-xs font-semibold text-white shadow-glow">Rotate</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Export() {
  return (
    <div>
      <h2 className="text-lg font-bold">Export Settings</h2>
      <p className="mt-1 text-sm text-muted-foreground">Choose default export formats and destinations.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {["PDF", "DOCX", "Markdown"].map((f) => (
          <div key={f} className="rounded-2xl border border-border/70 bg-white p-4">
            <div className="text-sm font-bold">{f}</div>
            <div className="mt-1 text-xs text-muted-foreground">Default export format for docs.</div>
          </div>
        ))}
      </div>
    </div>
  );
}
