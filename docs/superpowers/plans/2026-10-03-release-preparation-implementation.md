# Release Preparation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将已合并到 `develop` 的 Zipora 候选版本补齐可重复的发布准备证据，同时不执行真实部署、域名、索引或公开发布。

**Architecture:** 保持运行时无外部服务依赖。以 `lib/seo.ts` 为唯一站点来源与索引开关的判定点，测试直接注入环境变量验证公开元数据、爬虫规则和站点地图。发布准备材料集中到 `docs/release/`，性能与浏览器检查通过本地可重复脚本采集并明确标为实验室证据。

**Tech Stack:** Next.js（网站框架）16、React（界面库）19、TypeScript（类型脚本）、Node.js（运行时）测试、Playwright（浏览器测试框架）。

**Spec:** 用户工作包 `MISSION-NORTHSTAR-RELEASE-PREPARATION-001`。

## Global Constraints

- 基线固定为 `0b589e79997a8c9c1735b3d82ed66d82e8d47f84` 与数据快照 `2e100f671f3a84997b30627ababbfc94e049f7c2d2cf8d328c42c6006a2778c5`。
- 默认非生产模式始终关闭索引；公开索引只接受显式 HTTPS 源站和 `INDEXING_ENABLED=true`。
- 不创建外部账号、不购买服务、不写入真实密钥、不部署、不改域名、不合并至 `main`。
- 不触碰 Founder（创始人）原工作区的未提交 `AGENTS.md`；全部变更只在隔离工作树完成。
- 实验室性能与模拟视口不得描述为真实用户或真实设备证据。

## Review Focus

- 缺失 `SITE_URL` 时，预览元数据不能产生可索引页面或把 `localhost` 写入公开站点地图。
- 含路径、凭据、查询串或非 HTTPS 的公开源站必须被拒绝或禁用索引。
- `/search` 与 `/compare` 即使在公开开关开启时也必须保持 `noindex`。
- 无可靠州归属的 17 个区域不得因索引逻辑变更而重新进入站点地图。
- 请求日志、异常消息和性能报告不得记录用户查询、凭据或真实支持联系方式。

---

### Task 1: 锁定发布基线与同步历史文档

**Files:**
- Modify: `docs/LAUNCH_EVIDENCE.md`
- Modify: `docs/LAUNCH_CHECKLIST.md`
- Modify: `docs/PROJECT_STATE.md`
- Modify: `docs/ROADMAP.md`
- Modify: `docs/MILESTONES.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: 合并提交、CI 运行 `37076110183`、数据快照哈希。
- Produces: 一致的发布准备状态与明确未验证项。

- [ ] 记录 PR #1、`develop` 提交、CI 启动 PR #2 与最终 CI 结果。
- [ ] 将旧的“未推送／未创建 PR／远端未验证”表述替换为历史事实与当前状态。
- [ ] 保留生产、域名、托管、支持联系方式和公开索引为未完成门禁。
- [ ] 运行 `git diff --check`。
- [ ] Commit: `docs: synchronize release preparation baseline`。

### Task 2: 强化站点来源与索引配置

**Files:**
- Modify: `lib/seo.ts`
- Modify: `lib/sitemap.ts`
- Modify: `app/robots.ts`
- Modify: `tests/seo.test.ts`

**Interfaces:**
- Produces: `siteOrigin()`、`indexingEnabled()` 与公开站点输出的一致判定。

- [ ] 先为预览、HTTPS 公开源站、无效源站、搜索／比较页和未归属区域写失败测试。
- [ ] 运行 `npm test`，确认新断言在当前实现上失败。
- [ ] 实现最小配置校验与同源公开输出。
- [ ] 运行 `npm test`，确认测试通过。
- [ ] Commit: `feat: harden release site configuration`。

### Task 3: 建立预发布环境契约与验证清单

**Files:**
- Create: `docs/release/STAGING_ENVIRONMENT_CONTRACT.md`
- Create: `docs/release/STAGING_VALIDATION_CHECKLIST.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: `SITE_URL`、`INDEXING_ENABLED`、无密钥构建约束。
- Produces: 可交给未来托管环境执行的预发布步骤。

- [ ] 规定预发布环境显式 `INDEXING_ENABLED=false`、可注入 `SITE_URL` 与访问控制要求。
- [ ] 列出生产等价构建、规范网址、站点地图、爬虫规则、错误页和访问保护检查。
- [ ] 明确未部署与未验证的事实。
- [ ] Commit: `docs: add staging readiness contract`。

### Task 4: 扩展浏览器矩阵与真实设备边界

**Files:**
- Modify: `playwright.config.ts`
- Modify: `tests/browser/site.spec.ts`
- Create: `docs/release/DEVICE_BROWSER_VALIDATION.md`

**Interfaces:**
- Produces: Chromium（浏览器内核）与 Firefox（火狐浏览器）可独立执行的项目选择；真实设备缺口记录。

- [ ] 为代表性路线、键盘与基础可访问性定义 Firefox 项目。
- [ ] 检查本机 Firefox 可用性；若不可用，记录为环境缺口而非伪造通过。
- [ ] 运行可用浏览器矩阵，保存精确结果与模拟视口限制。
- [ ] Commit: `test: extend release browser validation matrix`。

### Task 5: 实验室性能与容量流程

**Files:**
- Create: `scripts/release-lab.mjs`
- Create: `docs/release/LAB_PERFORMANCE_AND_CAPACITY.md`
- Modify: `package.json`

**Interfaces:**
- Produces: `npm run release:lab`，输出启动、请求延迟、内存和有限并发结果。

- [ ] 写入固定代表路由与 JSON（JavaScript 对象表示法）结果模式的失败测试或脚本自检。
- [ ] 用本地生产服务器测量冷启动、稳态、请求延迟、2–8 并发、5xx 与内存。
- [ ] 将 1 vCPU / 2 GiB 最低验证目标及 2 vCPU / 4 GiB 建议目标写入报告，不把本机结果外推为托管承诺。
- [ ] Commit: `feat: add repeatable release lab procedure`。

### Task 6: 实验室核心网页指标基线

**Files:**
- Create: `scripts/release-web-vitals.mjs`
- Create: `docs/release/LAB_CORE_WEB_VITALS.md`
- Modify: `package.json`

**Interfaces:**
- Produces: `npm run release:web-vitals` 的本地 LCP、CLS、交互近似指标和 TTFB 记录。

- [ ] 定义页面样本与本地实验室限制。
- [ ] 采集可用浏览器性能条目；缺失的标准指标标为 `NOT_AVAILABLE`。
- [ ] 明确 `FIELD_CORE_WEB_VITALS = NOT_AVAILABLE_PRE_LAUNCH`。
- [ ] Commit: `feat: add lab web vitals baseline`。

### Task 7: 错误可观测性与隐私准备

**Files:**
- Modify: `app/error.tsx`
- Modify: `next.config.ts`
- Create: `lib/observability.ts`
- Create: `docs/release/PRODUCTION_LOGGING_REQUIREMENTS.md`
- Create: `docs/release/PRIVACY_AND_SUPPORT_READINESS.md`
- Test: `tests/observability.test.ts`

**Interfaces:**
- Produces: `reportServerError(context: ErrorContext): void`，仅在服务器端记录经净化的诊断上下文。

- [ ] 为查询串、凭据样式值和错误对象净化写失败测试。
- [ ] 实现最小服务器端错误日志工具，不写入用户输入或密钥。
- [ ] 更新错误边界使用安全请求标识，不暴露堆栈。
- [ ] 编写托管日志访问、保留期、5xx、崩溃、内存耗尽与启动失败要求；支持联系方式标为 `PENDING_FOUNDER_INPUT`。
- [ ] Commit: `feat: prepare privacy-safe error observability`。

### Task 8: 回滚计划与最终发布准备证据

**Files:**
- Create: `docs/release/ROLLBACK_PLAN.md`
- Create: `docs/release/FINAL_RELEASE_PREPARATION_EVIDENCE.md`
- Modify: `docs/LAUNCH_CHECKLIST.md`

**Interfaces:**
- Consumes: 发布提交、数据快照、预发布、浏览器、性能与日志报告。
- Produces: 不以浮动分支作为回滚目标的发布门禁证据。

- [ ] 固定代码提交与数据快照，定义部署撤回、索引关闭、快照恢复、验证与事故记录步骤。
- [ ] 将未选择托管、域名和支持联系方式明确写为 `PENDING` 或 `UNKNOWN`。
- [ ] 汇总自动完成项与需 Founder（创始人）决策的最小集合。
- [ ] Commit: `docs: add final release preparation evidence`。

### Task 9: 全量验证、审查与远端交付

**Files:**
- Modify: 仅修复验证发现的文件。

- [ ] 运行 `npm run validate`、`npm run data:database`、`npm run test:e2e`、`npm run release:lab`、`npm run release:web-vitals` 与 `git diff --check`。
- [ ] 检查所有文档与运行输出未宣称真实部署、真实设备或现场指标。
- [ ] 独立审查差异；修复真实问题后重新验证。
- [ ] 提交完整发布准备分支；仅在本地证据完整后执行一次最终推送、草稿请求与远端独立验证。
