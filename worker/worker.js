const { Worker } = require("bullmq");
const path = require("path");
const fs = require("fs");
const { spawnSync } = require("child_process");

const connection = { host: "localhost", port: 6379 };
const PROBLEMS_DIR = path.join(__dirname, "../problems");

function checkDocker() {
  const result = spawnSync("docker", ["info"], { encoding: "utf8", timeout: 5000 });
  if (result.error || result.status !== 0) {
    console.error("[docker] ✗ Cannot connect to Docker daemon.");
    console.error("[docker]   Make sure Docker Desktop is running.");
    if (result.error) console.error("[docker]  ", result.error.message);
    process.exit(1);
  }

  const imageCheck = spawnSync("docker", ["image", "inspect", "node:20-alpine"], {
    encoding: "utf8",
    timeout: 5000,
  });
  if (imageCheck.status !== 0) {
    console.error("[docker] ✗ Image node:20-alpine not found.");
    console.error("[docker]   Run: docker pull node:20-alpine");
    process.exit(1);
  }

  console.log("[docker] ✓ Connected to Docker daemon");
  console.log("[docker] ✓ Image node:20-alpine ready");
}

checkDocker();

const worker = new Worker(
  "submissions",
  async (job) => {
    const { code, problemId } = job.data;
    const testsDir = path.join(PROBLEMS_DIR, problemId, "tests");
    const testerPath = path.join(PROBLEMS_DIR, problemId, "tester.js");

    console.log(`[job ${job.id}] received — problemId: ${problemId}`);

    const problemPath = path.join(PROBLEMS_DIR, problemId, "problem.json");
    if (!fs.existsSync(problemPath)) {
      throw new Error(`Problem not found: ${problemId}`);
    }
    const problem = JSON.parse(fs.readFileSync(problemPath, "utf8"));

    // find all test input files (1.in, 2.in, ...)
    const testFiles = fs.readdirSync(testsDir)
      .filter((f) => f.endsWith(".in"))
      .sort((a, b) => parseInt(a) - parseInt(b));

    console.log(`[job ${job.id}] problem loaded: ${problem.title} | ${testFiles.length} test(s)`);

    const tmpDir = path.join("/tmp", `algofy_${job.id}`);
    fs.mkdirSync(tmpDir, { recursive: true });
    const codePath = path.join(tmpDir, "solution.js");
    fs.writeFileSync(codePath, code, "utf8");
    console.log(`[job ${job.id}] code written to ${codePath}`);

    const tester = problem.hasTester ? require(testerPath) : null;
    const details = [];
    let verdict = "AC";
    const inputPath = path.join(tmpDir, "input.txt");

    function runTestCase(input) {
      fs.writeFileSync(inputPath, input, "utf8");
      const start = Date.now();
      const result = spawnSync("docker", [
        "run", "--rm", "--network=none", "--memory=128m", "--cpus=0.5",
        "-v", `${tmpDir}:/code:ro`, "node:20-alpine",
        "sh", "-c", "node /code/solution.js < /code/input.txt"
      ], { timeout: 6000, killSignal: "SIGKILL", encoding: "utf8" });

      const timeMs = Date.now() - start;
      if (result.signal === "SIGKILL" || timeMs >= 6000) {
        return { stdout: null, timeMs, error: "TLE" };
      }
      if (result.status !== 0) {
        return { stdout: null, timeMs, error: "RTE" };
      }
      return { stdout: result.stdout.trim(), timeMs, error: null };
    }

    for (const file of testFiles) {
      const testNum = parseInt(file);
      const input = fs.readFileSync(path.join(testsDir, file), "utf8").trim();
      const { stdout, timeMs, error } = runTestCase(input);

      if (error) {
        details.push({ test: testNum, status: error, timeMs });
        if (verdict === "AC") verdict = error;
        continue;
      }

      let passed;
      if (tester) {
        passed = tester(input, stdout);
      } else {
        const expected = fs.readFileSync(path.join(testsDir, `${testNum}.out`), "utf8").trim();
        passed = stdout === expected;
      }

      const status = passed ? "AC" : "WA";
      details.push({ test: testNum, status, timeMs });
      console.log(`[job ${job.id}] test ${testNum}: ${status} (${timeMs}ms)`);

      if (!passed && verdict === "AC") {
        verdict = "WA";
      }
    }

    // cleanup
    fs.rmSync(tmpDir, { recursive: true, force: true });

    const result = {
      verdict,
      passed: details.filter((d) => d.status === "AC").length,
      total: testFiles.length,
      details,
    };

    console.log(`[job ${job.id}] done — ${verdict} (${result.passed}/${result.total})`);
    return result;
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`[job ${job.id}] completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[job ${job.id}] failed:`, err.message);
});

console.log("Worker listening for jobs...");
