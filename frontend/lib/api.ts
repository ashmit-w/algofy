const BASE = "http://localhost:3003/api";

export async function fetchProblems() {
  const res = await fetch(`${BASE}/problems`);
  return res.json();
}

export async function fetchProblem(id: string) {
  const res = await fetch(`${BASE}/problems/${id}`);
  return res.json();
}

export async function submitCode(problemId: string, code: string) {
  const res = await fetch(`${BASE}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ problemId, code }),
  });
  return res.json();
}

export async function pollResult(jobId: string) {
  const res = await fetch(`${BASE}/submissions/${jobId}`);
  return res.json();
}
