const express = require("express");
const cors = require("cors");
const { Queue } = require("bullmq");

const app = express();
app.use(cors());
app.use(express.json());

const connection = { host: "localhost", port: 6379 };
const submissionQueue = new Queue("submissions", { connection });
app.locals.submissionQueue = submissionQueue;

const submissionRoutes = require("./routes/submissionRoutes");
app.use("/api", submissionRoutes);

app.get("/", (req, res) => {
  res.send("Algofy API running");
});

const PORT = 3003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
