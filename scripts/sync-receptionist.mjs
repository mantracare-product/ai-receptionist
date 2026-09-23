import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_ROOT = path.resolve("C:/Users/Mantra/.gemini/antigravity/scratch/ma-figma");
const TARGET_ROOT = path.resolve(__dirname, "..");

function copyDirRecursive(srcDir, destDir, transformFile = null) {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(destDir, { recursive: true });

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "__tests__" || entry.name.endsWith(".orig")) continue;
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath, transformFile);
    } else if (entry.isFile()) {
      let content = fs.readFileSync(srcPath);
      
      // If it's a code file, apply transformation
      if (/\.(tsx|ts|js|jsx)$/.test(entry.name) && transformFile) {
        let text = content.toString("utf-8");
        text = transformFile(text, srcPath);
        fs.writeFileSync(destPath, text, "utf-8");
      } else {
        fs.writeFileSync(destPath, content);
      }
    }
  }
}

function transformCode(code, filePath) {
  let res = code;

  // Ensure "use client"; for React component files with hooks or browser globals
  if (/\.(tsx|jsx)$/.test(filePath) || filePath.includes("lib/sync") || filePath.includes("lib/api")) {
    if (!res.startsWith('"use client";') && !res.startsWith("'use client';")) {
      res = `"use client";\n` + res;
    }
  }

  // Handle Vite media asset imports by pointing them to Next.js public static imports
  res = res.replace(/import\s+avatarWebm\s+from\s+['"]@\/imports\/ai-receptionist-avatar\.webm['"];?/g, 'const avatarWebm = "/imports/ai-receptionist-avatar.webm";');
  res = res.replace(/import\s+avatarMp4\s+from\s+['"]@\/imports\/ai-receptionist-avatar\.mp4['"];?/g, 'const avatarMp4 = "/imports/ai-receptionist-avatar.mp4";');
  res = res.replace(/import\s+avatarFallbackPng\s+from\s+['"]@\/imports\/avatar-fallback\.png['"];?/g, 'const avatarFallbackPng = "/imports/avatar-fallback.png";');

  // SSR-safe localStorage initializers
  res = res.replace(/localStorage\.getItem\((.*?)\)/g, '(typeof window !== "undefined" ? localStorage.getItem($1) : null)');

  // Fix Button/Tooltip/PageHeader imports if they use relative paths
  res = res.replace(/from\s+["']\.\.\/components\/ui\/Button["']/g, 'from "@/components/ui/Button"');
  res = res.replace(/from\s+["']\.\.\/components\/ui\/Tooltip["']/g, 'from "@/components/ui/Tooltip"');
  res = res.replace(/from\s+["']\.\.\/components\/layout\/PageHeader["']/g, 'from "@/components/layout/PageHeader"');
  res = res.replace(/from\s+["'](?:\.\.\/)+reception\/(.*?)["']/g, 'from "@/reception/$1"');
  res = res.replace(/from\s+['"]react-router['"]/g, 'from "@/lib/routerShim"');

  return res;
}

export function syncAll() {
  console.log(`\n🔄 Full Sync: Mirroring AI Receptionist from ma-figma to ai-receptionist...`);

  // 1. Sync src/reception/ -> src/reception/
  const srcReception = path.join(SOURCE_ROOT, "src/reception");
  const targetReception = path.join(TARGET_ROOT, "src/reception");
  if (fs.existsSync(targetReception)) {
    fs.rmSync(targetReception, { recursive: true, force: true });
  }
  copyDirRecursive(srcReception, targetReception, transformCode);
  console.log(`[Synced] src/reception/ directory`);

  // 2. Sync src/imports/ media files to public/imports/ (ignoring pasted_text)
  const srcImports = path.join(SOURCE_ROOT, "src/imports");
  const targetPublicImports = path.join(TARGET_ROOT, "public/imports");
  if (fs.existsSync(srcImports)) {
    fs.mkdirSync(targetPublicImports, { recursive: true });
    const mediaFiles = fs.readdirSync(srcImports).filter(f => !f.includes("pasted_text") && !fs.statSync(path.join(srcImports, f)).isDirectory());
    for (const file of mediaFiles) {
      fs.copyFileSync(path.join(srcImports, file), path.join(targetPublicImports, file));
    }
  }
  console.log(`[Synced] Media assets to public/imports/`);

  // 3. Sync ReceptionSettingsTab.tsx
  const srcSettingsTab = path.join(SOURCE_ROOT, "src/app/components/reception/ReceptionSettingsTab.tsx");
  const targetSettingsTab = path.join(TARGET_ROOT, "src/components/reception/ReceptionSettingsTab.tsx");
  if (fs.existsSync(srcSettingsTab)) {
    const content = fs.readFileSync(srcSettingsTab, "utf-8");
    fs.mkdirSync(path.dirname(targetSettingsTab), { recursive: true });
    fs.writeFileSync(targetSettingsTab, transformCode(content, srcSettingsTab), "utf-8");
    console.log(`[Synced] ReceptionSettingsTab.tsx`);
  }

  // 4. Sync client cards if any
  const srcFaceCheckin = path.join(SOURCE_ROOT, "src/app/components/clients/FaceCheckinCard.tsx");
  const targetFaceCheckin = path.join(TARGET_ROOT, "src/components/clients/FaceCheckinCard.tsx");
  if (fs.existsSync(srcFaceCheckin)) {
    fs.mkdirSync(path.dirname(targetFaceCheckin), { recursive: true });
    fs.writeFileSync(targetFaceCheckin, transformCode(fs.readFileSync(srcFaceCheckin, "utf-8"), srcFaceCheckin), "utf-8");
  }

  const srcVisitJourney = path.join(SOURCE_ROOT, "src/app/components/clients/VisitJourneyCard.tsx");
  const targetVisitJourney = path.join(TARGET_ROOT, "src/components/clients/VisitJourneyCard.tsx");
  if (fs.existsSync(srcVisitJourney)) {
    fs.mkdirSync(path.dirname(targetVisitJourney), { recursive: true });
    fs.writeFileSync(targetVisitJourney, transformCode(fs.readFileSync(srcVisitJourney, "utf-8"), srcVisitJourney), "utf-8");
  }

  // 5. Sync Whisper STT server module
  const srcWhisperStt = path.join(SOURCE_ROOT, "server/routes/whisperStt.ts");
  const targetWhisperStt = path.join(TARGET_ROOT, "src/server/whisperStt.ts");
  if (fs.existsSync(srcWhisperStt)) {
    fs.mkdirSync(path.dirname(targetWhisperStt), { recursive: true });
    fs.copyFileSync(srcWhisperStt, targetWhisperStt);
    console.log(`[Synced] server/routes/whisperStt.ts -> src/server/whisperStt.ts`);
  }

  // 6. Sync Documentation
  const docs = ["AI_RECEPTIONIST_DESIGN.md", "AI_RECEPTIONIST_PRD.md", "BACKEND_HANDOFF_SPEC.md", "DESIGN_NAVODYA.md"];
  for (const doc of docs) {
    const docSrc = path.join(SOURCE_ROOT, doc);
    const docDest = path.join(TARGET_ROOT, doc);
    if (fs.existsSync(docSrc)) {
      fs.copyFileSync(docSrc, docDest);
      console.log(`[Synced Doc] ${doc}`);
    }
  }

  console.log(`✅ Complete AI Receptionist Sync finished at ${new Date().toLocaleTimeString()}\n`);
}

syncAll();

const isWatchMode = process.argv.includes("--watch");
if (isWatchMode) {
  console.log(`👀 Watching ma-figma/src/reception/ for live changes...`);
  const srcReception = path.join(SOURCE_ROOT, "src/reception");
  if (fs.existsSync(srcReception)) {
    let debounceTimer = null;
    fs.watch(srcReception, { recursive: true }, (eventType, filename) => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        console.log(`[Live Change in ma-figma] ${filename} (${eventType})`);
        syncAll();
      }, 200);
    });
  }
}
