import express from "express";

const app = express();
const port = 8091;

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(port, () => {
  console.log(`Test server running at http://localhost:${port}`);
});
