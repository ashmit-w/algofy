"use client";

import { useState } from "react";
import Link from "next/link";
import { submitCode, pollResult } from "@/lib/api";

type Verdict = "AC" | "WA" | "TLE" | "RTE";

interface TestDetail {
  test: number;
  status: Verdict;
  timeMs: number;
}

interface Result {
  verdict: Verdict;
  passed: number;
  total: number;
  details: TestDetail[];
}

const VERDICT_STYLES: Record<Verdict, string> = {
  AC:  "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  WA:  "text-red-400     border-red-500/30     bg-red-500/10",
  TLE: "text-yellow-400  border-yellow-500/30  bg-yellow-500/10",
  RTE: "text-orange-400  border-orange-500/30  bg-orange-500/10",
};

const VERDICT_LABEL: Record<Verdict, string> = {
  AC:  "Accepted",
  WA:  "Wrong Answer",
  TLE: "Time Limit Exceeded",
  RTE: "Runtime Error",
};

export default function ProblemClient({ problem }: {
  problem: {
    id: string;
    title: string;
    description: string;
    inputFormat: string;
    outputFormat: string;
    examples: { input: string; output: string }[];
  };
}) {
  const [code, setCode]     = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "judging" | "done">("idle");
  const [result, setResult] = useState<Result | null>(null);

  async function handleSubmit() {
    if (!code.trim()) return;
    setStatus("submitting");
    setResult(null);

    const { jobId } = await submitCode(problem.id, code);
    setStatus("judging");

    const interval = setInterval(async () => {
      const data = await pollResult(jobId);
      if (data.state === "completed" || data.state === "failed") {
        clearInterval(interval);
        setResult(data.result);
        setStatus("done");
      }
    }, 1000);
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-5xl flex flex-col gap-6">

        {/* Header */}
        <div className="text-center">
          <Link href="/" className="text-xs text-sky-500 hover:text-sky-300 transition mb-4 inline-block">
            ← All Problems
          </Link>
          <h1 className="text-3xl font-bold text-sky-200">{problem.title}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Left — Problem info */}
          <div className="flex flex-col gap-4">

            <div className="bg-sky-900/30 border border-sky-800/50 rounded-xl p-5">
              <p className="text-sky-100/80 text-sm leading-relaxed">{problem.description}</p>
            </div>

            <div className="bg-sky-900/30 border border-sky-800/50 rounded-xl p-5 text-sm">
              <p className="text-sky-500 uppercase text-xs font-bold tracking-widest mb-3">Format</p>
              <p className="text-sky-300/70 mb-1">
                <span className="text-sky-500">Input: </span>{problem.inputFormat}
              </p>
              <p className="text-sky-300/70">
                <span className="text-sky-500">Output: </span>{problem.outputFormat}
              </p>
            </div>

            {problem.examples?.length > 0 && (
              <div className="bg-sky-900/30 border border-sky-800/50 rounded-xl p-5">
                <p className="text-sky-500 uppercase text-xs font-bold tracking-widest mb-3">Examples</p>
                {problem.examples.map((ex, i) => (
                  <div key={i} className="mb-3 last:mb-0">
                    <pre className="text-xs bg-sky-950/60 rounded-lg p-3 text-sky-200 font-mono whitespace-pre-wrap border border-sky-800/30">
                      <span className="text-sky-500">Input:  </span>{ex.input}{"\n"}
                      <span className="text-sky-500">Output: </span>{ex.output}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right — Editor + Result */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-sky-500 uppercase text-xs font-bold tracking-widest text-center">
                Your Solution · JavaScript
              </p>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={16}
                spellCheck={false}
                placeholder={"// Read from stdin, write to stdout\nconst input = require('fs').readFileSync('/dev/stdin','utf8').trim();\nconsole.log(input);"}
                className="w-full bg-sky-950/60 border border-sky-800/50 rounded-xl p-4 font-mono text-sm text-sky-100 placeholder:text-sky-800 resize-none focus:outline-none focus:border-sky-500/60 transition"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={status === "submitting" || status === "judging"}
              className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sky-950 text-sm transition"
            >
              {status === "submitting" ? "Submitting…" : status === "judging" ? "Judging…" : "Submit Solution"}
            </button>

            {status === "judging" && !result && (
              <div className="bg-sky-900/30 border border-sky-800/50 rounded-xl p-5 text-center text-sky-400 text-sm animate-pulse">
                Running test cases…
              </div>
            )}

            {result && (
              <div className="bg-sky-900/30 border border-sky-800/50 rounded-xl p-5 flex flex-col gap-3">
                <div className={`inline-flex items-center gap-2 self-center border rounded-full px-4 py-1.5 text-sm font-bold ${VERDICT_STYLES[result.verdict]}`}>
                  {result.verdict === "AC" ? "✓" : "✗"} {VERDICT_LABEL[result.verdict]}
                </div>
                <p className="text-sky-400/70 text-sm text-center">
                  {result.passed} / {result.total} test cases passed
                </p>
                <div className="flex flex-col gap-1.5">
                  {result.details.map((d) => (
                    <div key={d.test} className="flex items-center justify-between text-xs font-mono bg-sky-950/50 rounded-lg px-3 py-2 border border-sky-800/30">
                      <span className="text-sky-600">Test {d.test}</span>
                      <span className={d.status === "AC" ? "text-emerald-400" : "text-red-400"}>{d.status}</span>
                      <span className="text-sky-700">{d.timeMs}ms</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
