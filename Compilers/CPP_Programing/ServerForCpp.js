
import express from "express";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import os from "os";

const router = express.Router()

router.post("/cpp", (req, res) => {
  const { code } = req.body

  if (!code || typeof code !== "string") {
    return res.status(400).json({ output: "Invalid input: 'code' is required." })
  }

  // Create unique filenames so multiple users don't collide
  const id = crypto.randomUUID()
  const tempDir = path.join(os.tmpdir(), "college-cpp-compiler")
  fs.mkdirSync(tempDir, { recursive: true })
  const filePath = path.join(tempDir, `${id}.cpp`)
  const outPath = path.join(tempDir, id)

  try {
    // Step 1: Save the code as a .cpp file
    fs.writeFileSync(filePath, code)

    // Step 2: Compile it with g++ (10 second timeout)
    execSync(`g++ "${filePath}" -o "${outPath}"`, { timeout: 10000 })

    // Step 3: Run the compiled program (5 second timeout)
    const output = execSync(`"${outPath}"`, { timeout: 5000 }).toString()

    // Step 4: Send output back
    res.json({ output })
  } catch (err) {   
    // Send compilation/runtime errors back
    res.json({ output: err.stderr?.toString() || err.message })
  } finally {
    // Step 5: Clean up temporary files (always!)
    try { fs.unlinkSync(filePath) } catch {}
    try { fs.unlinkSync(outPath) } catch {}
  }
})


export default router