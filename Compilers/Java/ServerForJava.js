import express from "express";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import os from "os";

const router = express.Router();

router.post("/java", (req, res) => {
  const { code } = req.body;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ output: "Invalid input: 'code' is required." });
  }

  const classMatch = code.match(/public\s+class\s+([A-Za-z_][A-Za-z0-9_]*)/);
  const fallbackClassMatch = code.match(/class\s+([A-Za-z_][A-Za-z0-9_]*)/);
  const className = classMatch?.[1] || fallbackClassMatch?.[1] || "Main";

  const id = crypto.randomUUID();
  const tempRoot = path.join(os.tmpdir(), "college-java-compiler");
  const workDir = path.join(tempRoot, id);
  const javaFilePath = path.join(workDir, `${className}.java`);

  try {
    fs.mkdirSync(workDir, { recursive: true });
    fs.writeFileSync(javaFilePath, code);

    // Compile source to .class files.
    execSync(`javac "${javaFilePath}"`, { timeout: 10000 });

    // Run compiled class from isolated temp directory.
    const output = execSync(`java -cp "${workDir}" "${className}"`, {
      timeout: 5000,
    }).toString();

    return res.json({ output });
  } catch (err) {
    const errorOutput = err.stderr?.toString() || err.stdout?.toString() || err.message;
    return res.json({ output: errorOutput });
  } finally {
    try {
      fs.rmSync(workDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup failures.
    }
  }
});

export default router;