const express = require("express");
const app = express();

app.use(express.json());

const submissionRoutes = require("./routes/submissionRoutes");

app.use("/api", submissionRoutes);

app.get("/", (req, res) => {
  res.send("Algofy API running");
});

const PORT = 3003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});