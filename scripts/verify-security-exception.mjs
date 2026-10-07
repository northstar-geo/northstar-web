import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const APPROVED_ADVISORY = "GHSA-vfj7-8cjw-p6xm";
const APPROVED_HIGH_PACKAGES = [
  "@next/eslint-plugin-next",
  "braces",
  "eslint-config-next",
  "fast-glob",
  "micromatch",
];
const APPROVED_PATH = [
  "eslint-config-next@16.3.6",
  "@next/eslint-plugin-next@16.3.6",
  "fast-glob@3.3.1",
  "micromatch@4.0.8",
  "braces@3.0.3",
];
const REQUIRED_COMPENSATING_CONTROLS = [
  "EXACT_ADVISORY_MATCH",
  "DEV_ONLY_DEPENDENCY_PATH",
  "ZERO_PRODUCTION_HIGH_CRITICAL",
  "NO_RUNTIME_IMPORTS",
  "TIME_BOUNDED_FAIL_CLOSED",
];
const REQUIRED_REVOCATION_CONDITIONS = [
  "EXPIRY_REACHED",
  "COMPATIBLE_PATCH_AVAILABLE_REQUIRES_REVIEW",
  "ADVISORY_CHANGED",
  "SEVERITY_CHANGED",
  "PACKAGE_VERSION_CHANGED",
  "DEPENDENCY_PATH_CHANGED",
  "DEV_ONLY_CLASSIFICATION_CHANGED",
  "PRODUCTION_AUDIT_NONZERO",
  "RUNTIME_EXPOSURE_FOUND",
  "UNTRUSTED_PATTERN_INPUT_FOUND",
  "AUDIT_EVIDENCE_DIGEST_CHANGED",
  "LOCKFILE_CHAIN_CHANGED",
];
const RUNTIME_DIRECTORIES = ["app", "components", "lib"];
const RUNTIME_EXTENSIONS = new Set([
  ".cjs",
  ".js",
  ".jsx",
  ".mjs",
  ".ts",
  ".tsx",
]);
const RUNTIME_IMPORT_PATTERN =
  /(?:from\s*["']|require\(\s*["']|import\(\s*["']|import\s*["'])(braces|micromatch|fast-glob)(?:["'/])/;

function fail(code, detail) {
  const error = new Error(`${code}${detail ? `: ${detail}` : ""}`);
  error.code = code;
  throw error;
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, stableValue(value[key])]),
    );
  }
  return value;
}

export function auditDigest(audit) {
  const canonical = JSON.stringify(stableValue(audit));
  return `sha256:${createHash("sha256").update(canonical).digest("hex")}`;
}

function sameArray(actual, expected) {
  return (
    actual.length === expected.length &&
    actual.every((value, index) => value === expected[index])
  );
}

function highOrCriticalEntries(audit) {
  return Object.entries(audit?.vulnerabilities ?? {}).filter(([, value]) =>
    ["high", "critical"].includes(value?.severity),
  );
}

function advisoryObjects(audit) {
  return highOrCriticalEntries(audit).flatMap(([, vulnerability]) =>
    (vulnerability.via ?? []).filter(
      (item) => item && typeof item === "object",
    ),
  );
}

function dependencyPaths(tree, target, parents = []) {
  const paths = [];
  for (const [name, node] of Object.entries(tree?.dependencies ?? {})) {
    const current = [...parents, `${name}@${node.version}`];
    if (name === target) paths.push(current);
    paths.push(...dependencyPaths(node, target, current));
  }
  return paths;
}

function assertSafeSourceMapVersion(version) {
  const parts = String(version).split(".").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN))
    fail("SOURCE_MAP_JS_VERSION_UNSAFE", version);
  const [major, minor, patch] = parts;
  if (
    major < 1 ||
    (major === 1 && minor < 2) ||
    (major === 1 && minor === 2 && patch < 2)
  ) {
    fail("SOURCE_MAP_JS_VERSION_UNSAFE", version);
  }
}

export function verifySecurityException({
  record,
  fullAudit,
  productionAudit,
  dependencyTree,
  lockfile,
  runtimeImportFindings,
  now = new Date(),
}) {
  if (record.schema !== "northstar-security-exception.v1")
    fail("SCHEMA_MISMATCH");
  if (record.advisory !== APPROVED_ADVISORY) fail("ADVISORY_MISMATCH");
  if (record.cve !== "CVE-2026-93687") fail("CVE_MISMATCH");
  if (record.package !== "braces") fail("PACKAGE_MISMATCH");
  if (record.version !== "3.0.3") fail("VERSION_MISMATCH");
  if (record.severity !== "HIGH") fail("SEVERITY_MISMATCH");
  if (record.patchAvailable !== false) fail("PATCH_AVAILABILITY_CHANGED");
  if (record.scope !== "DEV_TOOLING_ONLY") fail("SCOPE_MISMATCH");
  if (record.owner !== "Atlas Compliance Governance") fail("OWNER_MISMATCH");
  if (
    record.approvedBy !== "Atlas Company Center" ||
    record.approvedDecisionClass !== "B"
  )
    fail("APPROVAL_MISMATCH");
  if (record.reviewDate !== "2026-10-13") fail("REVIEW_DATE_MISMATCH");
  if (record.expiresAt !== "2026-10-13T23:59:00+08:00")
    fail("EXCEPTION_EXPIRY_MISMATCH");
  if (record.status !== "ACTIVE_TEMPORARY_EXCEPTION") fail("STATUS_MISMATCH");
  if (record.autoRenew !== false || record.permanentException !== false)
    fail("EXCEPTION_LIFETIME_MISMATCH");
  if (record.upstreamRecheckRequired !== true)
    fail("UPSTREAM_RECHECK_REQUIRED");
  if (
    !sameArray(
      record.compensatingControls ?? [],
      REQUIRED_COMPENSATING_CONTROLS,
    )
  )
    fail("COMPENSATING_CONTROLS_MISMATCH");
  if (
    !sameArray(
      record.revocationConditions ?? [],
      REQUIRED_REVOCATION_CONDITIONS,
    )
  )
    fail("REVOCATION_CONDITIONS_MISMATCH");
  if (!sameArray(record.dependencyPath ?? [], APPROVED_PATH))
    fail("DEPENDENCY_PATH_MISMATCH");

  const expiresAt = new Date(record.expiresAt);
  if (
    !Number.isFinite(expiresAt.getTime()) ||
    now.getTime() >= expiresAt.getTime()
  )
    fail("EXCEPTION_EXPIRED");

  const bracesLock = lockfile?.packages?.["node_modules/braces"];
  if (bracesLock?.version !== "3.0.3") fail("LOCKFILE_BRACES_VERSION_MISMATCH");
  if (bracesLock?.dev !== true) fail("LOCKFILE_BRACES_NOT_DEV_ONLY");
  assertSafeSourceMapVersion(
    lockfile?.packages?.["node_modules/source-map-js"]?.version,
  );

  const actualPaths = dependencyPaths(dependencyTree, "braces");
  if (actualPaths.length !== 1 || !sameArray(actualPaths[0], APPROVED_PATH))
    fail("DEPENDENCY_PATH_MISMATCH");

  const productionCounts = productionAudit?.metadata?.vulnerabilities ?? {};
  if (
    (productionCounts.high ?? 0) !== 0 ||
    (productionCounts.critical ?? 0) !== 0
  ) {
    fail("PRODUCTION_AUDIT_NONZERO");
  }
  if (highOrCriticalEntries(productionAudit).length !== 0)
    fail("PRODUCTION_AUDIT_NONZERO");

  const fullHighEntries = highOrCriticalEntries(fullAudit);
  const fullCounts = fullAudit?.metadata?.vulnerabilities ?? {};
  if ((fullCounts.high ?? 0) !== 5 || (fullCounts.critical ?? 0) !== 0)
    fail("FULL_AUDIT_COUNT_MISMATCH");
  const actualHighPackages = fullHighEntries.map(([name]) => name).sort();
  if (!sameArray(actualHighPackages, [...APPROVED_HIGH_PACKAGES].sort())) {
    fail("UNAPPROVED_HIGH_OR_CRITICAL", actualHighPackages.join(","));
  }

  const advisories = advisoryObjects(fullAudit);
  if (advisories.length !== 1)
    fail("UNAPPROVED_HIGH_OR_CRITICAL", `${advisories.length} advisories`);
  const advisory = advisories[0];
  if (!String(advisory.url ?? "").endsWith(`/${APPROVED_ADVISORY}`))
    fail("UNAPPROVED_HIGH_OR_CRITICAL");
  if (advisory.name !== "braces" || advisory.dependency !== "braces")
    fail("ADVISORY_PACKAGE_MISMATCH");
  if (advisory.severity !== "high" || advisory.range !== "<=3.0.3")
    fail("ADVISORY_DETAILS_MISMATCH");

  if (record.productionRuntimeExposure !== "NO_EVIDENCE")
    fail("RUNTIME_EXPOSURE_MISMATCH");
  if ((runtimeImportFindings ?? []).length !== 0)
    fail("RUNTIME_EXPOSURE_FOUND", runtimeImportFindings.join(","));
  if (record.untrustedPatternInput !== "NO_EVIDENCE")
    fail("UNTRUSTED_PATTERN_INPUT_MISMATCH");

  if (record.rawAuditDigest !== auditDigest(fullAudit))
    fail("RAW_AUDIT_DIGEST_MISMATCH");
  if (record.productionAuditDigest !== auditDigest(productionAudit))
    fail("PRODUCTION_AUDIT_DIGEST_MISMATCH");

  return {
    classification: "KNOWN_HIGH_TEMPORARY_EXCEPTION",
    securityGate: "PASS_WITH_EXACT_TIME_BOUNDED_EXCEPTION",
  };
}

export function runNpmJson(args, cwd) {
  const windows = process.platform === "win32";
  const command = windows ? (process.env.ComSpec ?? "cmd.exe") : "npm";
  const commandArgs = windows ? ["/d", "/s", "/c", "npm", ...args] : args;
  const result = spawnSync(command, commandArgs, {
    cwd,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
  if (![0, 1].includes(result.status) || !result.stdout.trim()) {
    fail(
      "NPM_COMMAND_FAILED",
      `${args.join(" ")} status=${result.status} ${result.stderr.trim()}`,
    );
  }
  try {
    return { json: JSON.parse(result.stdout), raw: result.stdout };
  } catch (error) {
    fail("NPM_JSON_INVALID", `${args.join(" ")} ${error.message}`);
  }
}

export function discoverRuntimeImportFindings(root) {
  const findings = [];
  const visit = (directory) => {
    if (!existsSync(directory)) return;
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else if (RUNTIME_EXTENSIONS.has(path.extname(entry.name))) {
        const content = readFileSync(absolute, "utf8");
        if (RUNTIME_IMPORT_PATTERN.test(content))
          findings.push(path.relative(root, absolute));
      }
    }
  };
  for (const directory of RUNTIME_DIRECTORIES)
    visit(path.join(root, directory));
  return findings;
}

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function main() {
  const script = fileURLToPath(import.meta.url);
  const root = path.resolve(path.dirname(script), "..");
  const artifacts = path.join(root, ".artifacts", "security");
  mkdirSync(artifacts, { recursive: true });

  const full = runNpmJson(["audit", "--package-lock-only", "--json"], root);
  const production = runNpmJson(
    ["audit", "--package-lock-only", "--omit=dev", "--json"],
    root,
  );
  const tree = runNpmJson(["ls", "braces", "--all", "--json"], root);

  writeFileSync(path.join(artifacts, "npm-audit-full.json"), full.raw);
  writeFileSync(
    path.join(artifacts, "npm-audit-production.json"),
    production.raw,
  );
  writeFileSync(path.join(artifacts, "npm-ls-braces.json"), tree.raw);

  process.stdout.write("RAW_FULL_AUDIT_BEGIN\n");
  process.stdout.write(full.raw);
  process.stdout.write("RAW_FULL_AUDIT_END\n");
  process.stdout.write("PRODUCTION_AUDIT_BEGIN\n");
  process.stdout.write(production.raw);
  process.stdout.write("PRODUCTION_AUDIT_END\n");

  const result = verifySecurityException({
    record: readJson(
      path.join(
        root,
        "docs",
        "security",
        "exceptions",
        `${APPROVED_ADVISORY}.json`,
      ),
    ),
    fullAudit: full.json,
    productionAudit: production.json,
    dependencyTree: tree.json,
    lockfile: readJson(path.join(root, "package-lock.json")),
    runtimeImportFindings: discoverRuntimeImportFindings(root),
  });

  console.log(`RAW_FULL_AUDIT_DIGEST=${auditDigest(full.json)}`);
  console.log(`PRODUCTION_AUDIT_DIGEST=${auditDigest(production.json)}`);
  console.log(`SECURITY_EXCEPTION_CLASSIFICATION=${result.classification}`);
  console.log(`SECURITY_GATE=${result.securityGate}`);
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(`SECURITY_GATE=FAIL`);
    console.error(
      `SECURITY_EXCEPTION_ERROR=${error.code ?? "UNEXPECTED_ERROR"}`,
    );
    console.error(error.message);
    process.exitCode = 1;
  }
}
