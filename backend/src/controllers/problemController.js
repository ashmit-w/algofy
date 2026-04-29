const fs = require("fs");
const path = require("path");

const PROBLEMS_DIR = path.join(__dirname, "../../../problems");

exports.getProblems = (req, res) => {
  try {
    const ids = fs.readdirSync(PROBLEMS_DIR).filter((f) =>
      fs.existsSync(path.join(PROBLEMS_DIR, f, "problem.json"))
    );
    const problems = ids.map((id) => {
      const { title, description, hasTester } = JSON.parse(
        fs.readFileSync(path.join(PROBLEMS_DIR, id, "problem.json"), "utf8")
      );
      return { id, title, description, hasTester };
    });
    res.json({ problems });
  } catch (err) {
    res.status(500).json({ error: "Failed to load problems" });
  }
};

exports.getProblem = (req, res) => {
  try {
    const problemPath = path.join(PROBLEMS_DIR, req.params.id, "problem.json");
    if (!fs.existsSync(problemPath)) {
      return res.status(404).json({ error: "Problem not found" });
    }
    const problem = JSON.parse(fs.readFileSync(problemPath, "utf8"));
    res.json({ problem });
  } catch (err) {
    res.status(500).json({ error: "Failed to load problem" });
  }
};
