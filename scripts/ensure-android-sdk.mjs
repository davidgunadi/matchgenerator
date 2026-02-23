import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { execSync } from "node:child_process";

const androidDir = resolve("android");
const localPropertiesPath = resolve(androidDir, "local.properties");

const parseLocalProperties = () => {
  if (!existsSync(localPropertiesPath)) {
    return {};
  }

  const content = readFileSync(localPropertiesPath, "utf8");
  return Object.fromEntries(
    content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const [key, ...rest] = line.split("=");
        return [key.trim(), rest.join("=").trim().replace(/\\:/g, ":").replace(/\\\\/g, "\\")];
      })
  );
};

const detectJavaMajor = () => {
  try {
    const output = execSync("java -version 2>&1", { encoding: "utf8" });
    const match = output.match(/version\s+"(\d+)(?:\.(\d+))?/);
    if (!match) return null;
    const major = Number.parseInt(match[1], 10);
    return Number.isNaN(major) ? null : major;
  } catch {
    return null;
  }
};

const existing = parseLocalProperties();
if (existing["sdk.dir"] && existsSync(existing["sdk.dir"])) {
  console.log(`Using sdk.dir from android/local.properties: ${existing["sdk.dir"]}`);
} else {
  const candidates = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    join(homedir(), "Android", "Sdk"),
    "/usr/lib/android-sdk",
    "/usr/local/android-sdk",
    "/opt/android-sdk"
  ].filter(Boolean);

  const sdkDir = candidates.find((candidate) => existsSync(candidate));

  if (!sdkDir) {
    throw new Error(
      "Android SDK not found. Set ANDROID_HOME or ANDROID_SDK_ROOT, or create android/local.properties with sdk.dir=<path to Android SDK>."
    );
  }

  const escaped = sdkDir.replace(/\\/g, "\\\\").replace(/:/g, "\\:");
  writeFileSync(localPropertiesPath, `sdk.dir=${escaped}\n`, "utf8");
  console.log(`Wrote android/local.properties with sdk.dir=${sdkDir}`);
}

const javaMajor = detectJavaMajor();
if (javaMajor && javaMajor > 21) {
  throw new Error(
    `Detected Java ${javaMajor}. Android Gradle Plugin 8.5.x works reliably with Java 17-21. Please set JAVA_HOME to a JDK in that range.`
  );
}
