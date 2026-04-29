const express = require("express");
const router = express.Router();
const { submitCode, getResult } = require("../controllers/submissionController");
const { getProblems, getProblem } = require("../controllers/problemController");

router.get("/problems", getProblems);
router.get("/problems/:id", getProblem);
router.post("/submit", submitCode);
router.get("/submissions/:jobId", getResult);

module.exports = router;