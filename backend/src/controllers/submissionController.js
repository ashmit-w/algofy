exports.submitCode = async (req, res) => {
  try {
    const { code, problemId } = req.body;

    if (!code || !problemId) {
      return res.status(400).json({
        error: "code and problemId are required",
      });
    }

    console.log("Received submission:", {
      problemId,
      codeSnippet: code.slice(0, 50),
    });

    return res.status(200).json({
      status: "PENDING",
      message: "Submission received",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};