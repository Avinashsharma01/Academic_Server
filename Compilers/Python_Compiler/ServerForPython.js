
import express from "express";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import os from "os";

const router = express.Router()

router.post("/python", (req, res) => {
  const { code } = req.body

  if (!code || typeof code !== "string") {
    return res.status(400).json({ output: "Invalid input: 'code' is required." })
  }

  // Create unique filenames so multiple users don't collide
  const id = crypto.randomUUID()
  const tempDir = path.join(os.tmpdir(), "college-python-compiler")
  fs.mkdirSync(tempDir, { recursive: true })
  const filePath = path.join(tempDir, `${id}.py`)

  const runPython = () => {
    try {
      return execSync(`python "${filePath}"`, { timeout: 10000 }).toString()
    } catch (err) {
      // On Windows, `python` may be unavailable while `py -3` is present.
      if (/not recognized|ENOENT|No such file or directory/i.test(err.message || "")) {
        return execSync(`py -3 "${filePath}"`, { timeout: 10000 }).toString()
      }
      throw err
    }
  }

  try {
    // Step 1: Save the code as a .py file
    fs.writeFileSync(filePath, code)

    // Step 2: Run the Python script (10 second timeout)
    const output = runPython()

    // Step 3: Send output back
    res.json({ output })
  } catch (err) {   
    // Send compilation/runtime errors back
    res.json({ output: err.stderr?.toString() || err.stdout?.toString() || err.message })
  } finally {
    // Step 4: Clean up temporary files (always!)
    try { fs.unlinkSync(filePath) } catch {}
  }
})

    
export default router