/**
 * FRAME EXTRACTOR — Fixed version
 * Uses simple, universally compatible FFmpeg options
 *
 * SETUP:  npm install fluent-ffmpeg ffmpeg-static
 * USAGE:  node extract-frames.js
 *
 * Put videos in a "videos" folder:
 *   videos/hero.mp4, shimla.mp4, manali.mp4, spiti.mp4, ladakh.mp4
 */

const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const path = require("path");
const fs = require("fs");

ffmpeg.setFfmpegPath(ffmpegPath);

const INPUT_DIR = path.join(__dirname, "videos");
const OUTPUT_DIR = path.join(__dirname, "public", "frames");
const FPS = 24;
const WIDTH = 1920;
const VIDEOS = ["hero", "shimla", "manali", "spiti", "ladakh"];

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function findVideo(name) {
  for (const ext of [".mp4", ".mov", ".webm", ".mkv", ".avi"]) {
    const fp = path.join(INPUT_DIR, name + ext);
    if (fs.existsSync(fp)) return fp;
  }
  return null;
}

function getDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, meta) => {
      if (err) reject(err);
      else resolve(meta.format.duration);
    });
  });
}

function extract(inputPath, outputDir, name) {
  return new Promise(async (resolve, reject) => {
    const duration = await getDuration(inputPath);
    const expected = Math.ceil(duration * FPS);

    console.log(`\n  🎬 ${name}`);
    console.log(`     Duration: ${duration.toFixed(2)}s → ~${expected} frames`);
    console.log(`     Output: ${outputDir}`);

    // Clear old frames if only 1 exists (failed previous run)
    if (fs.existsSync(outputDir)) {
      const old = fs.readdirSync(outputDir).filter(f => f.endsWith(".webp") || f.endsWith(".png"));
      if (old.length > 0 && old.length < 5) {
        console.log(`     Clearing ${old.length} old files from failed run...`);
        old.forEach(f => fs.unlinkSync(path.join(outputDir, f)));
      }
    }

    ensureDir(outputDir);

    // Use PNG first, then convert — most compatible approach
    // Actually, let's just output as JPEG with high quality for max compatibility
    // Then we'll use a second pass to convert to WebP if needed
    
    const outputPattern = path.join(outputDir, "frame_%04d.webp");
    let lastPct = 0;

    ffmpeg(inputPath)
      .videoFilters(`fps=${FPS}`, `scale=${WIDTH}:-2`)
      .outputOptions([
        "-f", "image2",           // force image sequence output
        "-c:v", "libwebp",        // explicitly set webp codec
        "-qscale:v", "82",        // quality (0-100, higher = better)
        "-an",                    // no audio
      ])
      .output(outputPattern)
      .on("progress", (p) => {
        const pct = Math.round(p.percent || 0);
        if (pct > lastPct + 3) {
          lastPct = pct;
          const bar = "█".repeat(Math.floor(pct / 4)) + "░".repeat(25 - Math.floor(pct / 4));
          process.stdout.write(`\r     [${bar}] ${pct}%`);
        }
      })
      .on("end", () => {
        const files = fs.readdirSync(outputDir).filter(f => f.endsWith(".webp"));
        process.stdout.write(`\r     [${"█".repeat(25)}] 100%\n`);
        console.log(`     ✅ ${files.length} frames extracted`);
        
        let total = 0;
        files.forEach(f => total += fs.statSync(path.join(outputDir, f)).size);
        console.log(`     📦 ${(total/1024/1024).toFixed(1)}MB total | ${(total/files.length/1024).toFixed(0)}KB avg`);
        
        resolve(files.length);
      })
      .on("error", (err) => {
        console.error(`\n     ❌ WebP failed: ${err.message}`);
        console.log(`     🔄 Retrying with PNG output...`);
        
        // Fallback: extract as PNG (works on literally every FFmpeg build)
        const pngPattern = path.join(outputDir, "frame_%04d.png");
        
        ffmpeg(inputPath)
          .videoFilters(`fps=${FPS}`, `scale=${WIDTH}:-2`)
          .outputOptions(["-an"])
          .output(pngPattern)
          .on("end", () => {
            const files = fs.readdirSync(outputDir).filter(f => f.endsWith(".png"));
            console.log(`     ✅ ${files.length} PNG frames extracted`);
            console.log(`     ⚠️  PNG files are larger than WebP. Update frame paths in code to use .png`);
            resolve(files.length);
          })
          .on("error", (err2) => {
            console.error(`     ❌ PNG also failed: ${err2.message}`);
            reject(err2);
          })
          .run();
      })
      .run();
  });
}

async function main() {
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║   HIMALAYAN HIGHWAY — Frame Extractor    ║");
  console.log("╚══════════════════════════════════════════╝\n");

  if (!fs.existsSync(INPUT_DIR)) {
    console.error(`  ❌ No "videos" folder found. Create it and add your videos.\n`);
    process.exit(1);
  }

  ensureDir(OUTPUT_DIR);

  for (const name of VIDEOS) {
    const videoPath = findVideo(name);
    if (!videoPath) {
      console.log(`\n  ⚠️  Skipping "${name}" — no video found`);
      continue;
    }

    const outDir = path.join(OUTPUT_DIR, name);
    
    // Skip if already has many frames
    if (fs.existsSync(outDir)) {
      const existing = fs.readdirSync(outDir).filter(f => f.endsWith(".webp") || f.endsWith(".png"));
      if (existing.length > 20) {
        console.log(`\n  ⏭️  "${name}" already has ${existing.length} frames — skipping`);
        continue;
      }
    }

    await extract(videoPath, outDir, name);
  }

  console.log("\n──────────────────────────────────────────");
  console.log("  Done! Run: npm run dev\n");
}

main().catch(console.error);