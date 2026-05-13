import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(new URL(".", import.meta.url).pathname, "..");
const routeDir = path.join(projectRoot, "app", "api-backend");
const stashDir = path.join(projectRoot, ".static-export-stash", "api-backend");

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function rm(p) {
  fs.rmSync(p, { recursive: true, force: true });
}

try {
  rm(path.join(projectRoot, ".next"));
  rm(path.join(projectRoot, "out"));

  if (exists(routeDir)) {
    rm(path.dirname(stashDir));
    fs.mkdirSync(path.dirname(stashDir), { recursive: true });
    fs.renameSync(routeDir, stashDir);
  }

  execSync("next build", {
    cwd: projectRoot,
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "production",
      STATIC_EXPORT: "1",
    },
  });

  const outDir = path.join(projectRoot, "out");
  const zipPath = path.join(projectRoot, "matrix-frontend-hostinger.zip");
  if (!exists(outDir)) {
    throw new Error(`Static export output missing: ${outDir}`);
  }
  rm(zipPath);
  execSync(`zip -r "${zipPath}" .`, {
    cwd: outDir,
    stdio: "inherit",
    env: process.env,
  });
  console.log(`\nHostinger zip: ${zipPath}\n`);
} finally {
  if (exists(stashDir)) {
    fs.mkdirSync(path.dirname(routeDir), { recursive: true });
    if (exists(routeDir)) rm(routeDir);
    fs.renameSync(stashDir, routeDir);
    rm(path.join(projectRoot, ".static-export-stash"));
  }
}

