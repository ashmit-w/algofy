import Link from "next/link";
import { fetchProblems } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { problems } = await fetchProblems();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-sky-300 mb-2 tracking-tight">Algofy</h1>
          <p className="text-sky-400/60 text-sm">Pick a problem. Write your solution. Get judged.</p>
        </div>

        {/* Problem list */}
        <div className="flex flex-col gap-2">
          {problems.map((p: { id: string; title: string; description: string; hasTester: boolean }, i: number) => (
            <Link
              key={p.id}
              href={`/problems/${p.id}`}
              className="flex items-center justify-between bg-sky-900/40 border border-sky-800/50 rounded-xl px-5 py-4 hover:bg-sky-800/50 hover:border-sky-600/60 transition group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-sky-600 text-xs font-mono w-5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <div className="min-w-0">
                  <p className="font-semibold text-sky-100 group-hover:text-white transition">{p.title}</p>
                  <p className="text-sky-400/60 text-xs mt-0.5 truncate">{p.description}</p>
                </div>
              </div>
              {p.hasTester && (
                <span className="shrink-0 ml-3 text-xs bg-sky-400/10 text-sky-400 border border-sky-400/20 rounded-full px-2.5 py-0.5">
                  multi-answer
                </span>
              )}
            </Link>
          ))}
        </div>

      </div>
    </main>
  );
}
