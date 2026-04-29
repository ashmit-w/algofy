exports.submitCode = async (req, res) => {
  try {
    const { code, problemId } = req.body;

    if (!code || !problemId) {
      return res.status(400).json({ error: "code and problemId are required" });
    }

    const queue = req.app.locals.submissionQueue;
    const job = await queue.add("run", { code, problemId });

    return res.status(200).json({ jobId: job.id, status: "PENDING" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getResult = async (req, res) => {
  try {
    const queue = req.app.locals.submissionQueue;
    const job = await queue.getJob(req.params.jobId);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const state = await job.getState();
    const result = job.returnvalue ?? null;

    return res.json({ jobId: job.id, state, result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
