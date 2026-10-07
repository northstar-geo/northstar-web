import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  auditDigest,
  discoverRuntimeImportFindings,
  runNpmJson,
  verifySecurityException,
} from "./verify-security-exception.mjs";

const dependencyPath = [
  "eslint-config-next@16.3.6",
  "@next/eslint-plugin-next@16.3.6",
  "fast-glob@3.3.1",
  "micromatch@4.0.8",
  "braces@3.0.3",
];

function makeFullAudit() {
  return {
    auditReportVersion: 2,
    vulnerabilities: {
      "@next/eslint-plugin-next": {
        name: "@next/eslint-plugin-next",
        severity: "high",
        via: ["fast-glob"],
      },
      braces: {
        name: "braces",
        severity: "high",
        via: [
          {
            name: "braces",
            dependency: "braces",
            url: "https://github.com/advisories/GHSA-vfj7-8cjw-p6xm",
            severity: "high",
            range: "<=3.0.3",
          },
        ],
      },
      "eslint-config-next": {
        name: "eslint-config-next",
        severity: "high",
        via: ["@next/eslint-plugin-next"],
      },
      "fast-glob": {
        name: "fast-glob",
        severity: "high",
        via: ["micromatch"],
      },
      micromatch: {
        name: "micromatch",
        severity: "high",
        via: ["braces"],
      },
    },
    metadata: {
      vulnerabilities: {
        info: 0,
        low: 0,
        moderate: 0,
        high: 5,
        critical: 0,
        total: 5,
      },
    },
  };
}

function makeProductionAudit() {
  return {
    auditReportVersion: 2,
    vulnerabilities: {},
    metadata: {
      vulnerabilities: {
        info: 0,
        low: 0,
        moderate: 0,
        high: 0,
        critical: 0,
        total: 0,
      },
    },
  };
}

function makeDependencyTree() {
  return {
    name: "northstar-web",
    version: "0.1.0",
    dependencies: {
      "eslint-config-next": {
        version: "16.3.6",
        dependencies: {
          "@next/eslint-plugin-next": {
            version: "16.3.6",
            dependencies: {
              "fast-glob": {
                version: "3.3.1",
                dependencies: {
                  micromatch: {
                    version: "4.0.8",
                    dependencies: {
                      braces: { version: "3.0.3" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}

function makeLockfile() {
  return {
    packages: {
      "": {
        devDependencies: { "eslint-config-next": "^16.3.6" },
      },
      "node_modules/braces": { version: "3.0.3", dev: true },
      "node_modules/source-map-js": { version: "1.2.2" },
    },
  };
}

function makeFixture() {
  const fullAudit = makeFullAudit();
  const productionAudit = makeProductionAudit();
  return {
    now: new Date("2026-10-06T12:00:00.000Z"),
    fullAudit,
    productionAudit,
    dependencyTree: makeDependencyTree(),
    lockfile: makeLockfile(),
    runtimeImportFindings: [],
    record: {
      schema: "northstar-security-exception.v1",
      status: "ACTIVE_TEMPORARY_EXCEPTION",
      advisory: "GHSA-vfj7-8cjw-p6xm",
      cve: "CVE-2026-93687",
      package: "braces",
      version: "3.0.3",
      severity: "HIGH",
      patchAvailable: false,
      dependencyPath: [...dependencyPath],
      scope: "DEV_TOOLING_ONLY",
      productionRuntimeExposure: "NO_EVIDENCE",
      untrustedPatternInput: "NO_EVIDENCE",
      rawAuditDigest: auditDigest(fullAudit),
      productionAuditDigest: auditDigest(productionAudit),
      owner: "Atlas Compliance Governance",
      approvedBy: "Atlas Company Center",
      approvedDecisionClass: "B",
      reviewDate: "2026-10-13",
      expiresAt: "2026-10-13T23:59:00+08:00",
      autoRenew: false,
      permanentException: false,
      upstreamRecheckRequired: true,
      compensatingControls: [
        "EXACT_ADVISORY_MATCH",
        "DEV_ONLY_DEPENDENCY_PATH",
        "ZERO_PRODUCTION_HIGH_CRITICAL",
        "NO_RUNTIME_IMPORTS",
        "TIME_BOUNDED_FAIL_CLOSED",
      ],
      revocationConditions: [
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
      ],
    },
  };
}

test("accepts only the exact active temporary braces exception", () => {
  const result = verifySecurityException(makeFixture());
  assert.deepEqual(result, {
    classification: "KNOWN_HIGH_TEMPORARY_EXCEPTION",
    securityGate: "PASS_WITH_EXACT_TIME_BOUNDED_EXCEPTION",
  });
});

test("executes npm JSON commands on the current platform", () => {
  const result = runNpmJson(["ls", "braces", "--all", "--json"], process.cwd());
  assert.equal(result.json.name, "northstar-web");
  assert.match(result.raw, /"braces"/);
});

test("detects a vulnerable package imported by production runtime code", () => {
  const root = mkdtempSync(path.join(tmpdir(), "northstar-security-test-"));
  mkdirSync(path.join(root, "app"));
  writeFileSync(
    path.join(root, "app", "page.tsx"),
    'import braces from "braces";\n',
  );
  assert.deepEqual(discoverRuntimeImportFindings(root), [
    path.join("app", "page.tsx"),
  ]);
});

test("detects a side-effect import of a vulnerable package", () => {
  const root = mkdtempSync(path.join(tmpdir(), "northstar-security-test-"));
  mkdirSync(path.join(root, "lib"));
  writeFileSync(path.join(root, "lib", "runtime.ts"), 'import "micromatch";\n');
  assert.deepEqual(discoverRuntimeImportFindings(root), [
    path.join("lib", "runtime.ts"),
  ]);
});

const mutations = [
  [
    "record schema changes",
    (f) => (f.record.schema = "other-schema"),
    /SCHEMA_MISMATCH/,
  ],
  [
    "advisory ID changes",
    (f) => (f.record.advisory = "GHSA-other"),
    /ADVISORY_MISMATCH/,
  ],
  ["CVE changes", (f) => (f.record.cve = "CVE-other"), /CVE_MISMATCH/],
  [
    "braces version changes",
    (f) => (f.record.version = "3.0.2"),
    /VERSION_MISMATCH/,
  ],
  [
    "compatible patch is marked available",
    (f) => (f.record.patchAvailable = true),
    /PATCH_AVAILABILITY_CHANGED/,
  ],
  [
    "dependency path changes",
    (f) => f.record.dependencyPath.splice(2, 1),
    /DEPENDENCY_PATH_MISMATCH/,
  ],
  [
    "exception is expired",
    (f) => (f.now = new Date("2026-10-14T00:00:00+08:00")),
    /EXCEPTION_EXPIRED/,
  ],
  [
    "production audit gains a high",
    (f) => (f.productionAudit.metadata.vulnerabilities.high = 1),
    /PRODUCTION_AUDIT_NONZERO/,
  ],
  [
    "a second high advisory appears",
    (f) => {
      f.fullAudit.vulnerabilities.other = {
        name: "other",
        severity: "high",
        via: [
          {
            name: "other",
            url: "https://github.com/advisories/GHSA-other",
            severity: "high",
          },
        ],
      };
    },
    /UNAPPROVED_HIGH_OR_CRITICAL/,
  ],
  [
    "full audit severity counts drift",
    (f) => (f.fullAudit.metadata.vulnerabilities.high = 4),
    /FULL_AUDIT_COUNT_MISMATCH/,
  ],
  [
    "a critical advisory appears",
    (f) => {
      f.fullAudit.vulnerabilities.criticalPackage = {
        name: "critical-package",
        severity: "critical",
        via: [
          {
            name: "critical-package",
            url: "https://github.com/advisories/GHSA-critical",
            severity: "critical",
          },
        ],
      };
    },
    /UNAPPROVED_HIGH_OR_CRITICAL/,
  ],
  ["scope changes", (f) => (f.record.scope = "RUNTIME"), /SCOPE_MISMATCH/],
  ["owner changes", (f) => (f.record.owner = "Other Owner"), /OWNER_MISMATCH/],
  [
    "approval class changes",
    (f) => (f.record.approvedDecisionClass = "A"),
    /APPROVAL_MISMATCH/,
  ],
  [
    "review date changes",
    (f) => (f.record.reviewDate = "2026-10-14"),
    /REVIEW_DATE_MISMATCH/,
  ],
  [
    "expiry changes",
    (f) => (f.record.expiresAt = "2026-10-14T23:59:00+08:00"),
    /EXCEPTION_EXPIRY_MISMATCH/,
  ],
  [
    "audit evidence digest drifts",
    (f) => (f.record.rawAuditDigest = "sha256:drift"),
    /RAW_AUDIT_DIGEST_MISMATCH/,
  ],
  [
    "a compensating control is removed",
    (f) => f.record.compensatingControls.pop(),
    /COMPENSATING_CONTROLS_MISMATCH/,
  ],
  [
    "a revocation condition is removed",
    (f) => f.record.revocationConditions.pop(),
    /REVOCATION_CONDITIONS_MISMATCH/,
  ],
  [
    "runtime import is found",
    (f) => f.runtimeImportFindings.push("app/page.tsx imports braces"),
    /RUNTIME_EXPOSURE_FOUND/,
  ],
  [
    "untrusted pattern assessment changes",
    (f) => (f.record.untrustedPatternInput = "UNKNOWN"),
    /UNTRUSTED_PATTERN_INPUT_MISMATCH/,
  ],
  [
    "source-map-js remediation regresses",
    (f) =>
      (f.lockfile.packages["node_modules/source-map-js"].version = "1.2.1"),
    /SOURCE_MAP_JS_VERSION_UNSAFE/,
  ],
];

for (const [name, mutate, expected] of mutations) {
  test(`fails closed when ${name}`, () => {
    const fixture = makeFixture();
    mutate(fixture);
    assert.throws(() => verifySecurityException(fixture), expected);
  });
}
