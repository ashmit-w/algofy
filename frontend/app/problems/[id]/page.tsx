import { fetchProblem } from "@/lib/api";
import ProblemClient from "./ProblemClient";

export const dynamic = "force-dynamic";

export default async function ProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { problem } = await fetchProblem(id);

  return <ProblemClient problem={problem} />;
}
