const { Worker } = require("bullmq");
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const connection = { host: "localhost", port: 6379 };
const PROBLEMS_DIR = path.join(__dirname, "../problems");

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
      try {
        const stdout = execSync(
          `docker run --rm --network=none --memory=128m --cpus=0.5 \
           -v ${tmpDir}:/code:ro node:20-alpine \
           sh -c "timeout 6 node /code/solution.js < /code/input.txt"`,
          { timeout: 7000, encoding: "utf8" }
        );
        return { stdout: stdout.trim(), timeMs: Date.now() - start, error: null };
      } catch (err) {
        const timedOut = err.killed || Date.now() - start >= 6000;
        return { stdout: null, timeMs: Date.now() - start, error: timedOut ? "TLE" : "RTE" };
      }
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
