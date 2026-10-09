# OKELOM 生产依赖补丁与例外证据漂移回执

核验时间：2026-10-09 13:15 +08:00。使命：`MISSION-OKELOM-PRODUCT-IDENTITY-PREVIEW-READINESS-001`。

## 结论与证据绑定

生产依赖补丁完成；生产审计为零漏洞。规范安全门禁仍为 **FAIL**，原因是既有开发工具链例外的审计摘要漂移，不是新的生产漏洞。整个使命未完成，停止品牌及云平台适配后续实施，返回 `@Polaris｜Core Chat` 确定原例外证据重绑定的授权路径。

- 分支：`codex/okelom-identity-preview-readiness-001`。
- 基线提交：`ed7b2355ab931ec2d66080da012dced600aaa12e`。
- 本轮结果绑定**未提交工作树**；不是该基线提交的验证结果，不宣称 `EXACT_HEAD_COMMIT`。
- 已有分片改动全部保留；本轮产品依赖仅修改 `package.json` 和 `package-lock.json`。
- 没有提交、推送、合并、部署、索引开启、域名解析操作或新增外部服务。
- 原始检出目录仍只有创始人原有 `AGENTS.md` 的 18 行新增，未提交或改写。

## 最小补丁与供应链

使用 Node.js（运行时）24.18.0、npm（包管理器）11.16.0；依次运行 `npm install --package-lock-only` 与 `npm ci`，均成功。

| 包 | 修改前 | 修改后 |
| --- | --- | --- |
| next | 16.3.6 | 16.3.8，精确固定 |
| @next/env | 16.3.6 | 16.3.8 |
| @next/swc-*，8 个平台包 | 16.3.6 | 16.3.8 |
| react / react-dom | 19.2.4 | 19.2.4，无需补丁兼容调整 |
| eslint-config-next / @next/eslint-plugin-next | 16.3.6 | 16.3.6，保留原例外链 |

锁文件差异为 106 行新增、40 行删除。除上述 10 个包升级外，npm 自动补录 `@tailwindcss/oxide-wasm32-wasi@4.3.2` 包内的 6 个开发、可选依赖；没有移除依赖，也没有更改此父包版本或摘要：

- `@emnapi/core@1.11.1`
- `@emnapi/runtime@1.11.1`
- `@emnapi/wasi-threads@1.2.2`
- `@napi-rs/wasm-runtime@1.1.4`
- `@tybys/wasm-util@0.10.2`
- `tslib@2.8.1`

注册表的父包 `bundledDependencies` 明确列出这 6 个依赖。没有手动删除补录项来匹配旧审计摘要。

- 锁文件 SHA-256（文件摘要）：`ac9cfd4026e6e68edabc3719a7942e99cda84ef2892517ab1b410a2bf1c011e8`。
- `next@16.3.8` 完整性值：`sha512-U7QEZaTini6wKrb8A8hqLLqYQyCetegKjCpJOyxk642vWoMoU1x5PyZCJFvgYgiptA8xc5j/9xYlZFO7w9Sjmw==`，与注册表一致。
- 所有非包内嵌锁文件项均来自 `https://registry.npmjs.org/`，且具备 SHA-512（完整性摘要）。
- `npm audit signatures`：364 个已安装包的注册表签名通过，88 个供应链证明通过。此结果不替代漏洞审计，也不证明未安装平台包的运行行为。
- 没有使用 `force`、`legacy-peer-deps`、`ignore-scripts` 或审计抑制；这三个安装选项的当前配置均为 `false`。
- 安装提示 `esbuild@0.28.2` 与 `unrs-resolver@1.12.2` 的安装脚本尚未被 `allowScripts` 覆盖。本轮未新增脚本批准；后续环境仍需按原策略审查，不能推断安装成功代表脚本获准执行。

## 安全结果与精确阻塞

- `node --test scripts/verify-security-exception.test.mjs`：26/26 通过。
- `node scripts/verify-security-exception.mjs`：退出码 1，`RAW_AUDIT_DIGEST_MISMATCH`。
- 生产审计：所有级别均为 0，生产安全门禁通过。
- 完整审计：5 个高危受影响包、0 个严重漏洞，均来自原通告 `GHSA-vfj7-8cjw-p6xm`。这不是 5 个不同通告。
- 原依赖链保持：`eslint-config-next@16.3.6 -> @next/eslint-plugin-next@16.3.6 -> fast-glob@3.3.1 -> micromatch@4.0.8 -> braces@3.0.3`。
- `braces` 当前注册表版本仍为 `3.0.3`。锁文件仍标记仅开发使用；应用、组件和库目录未发现相关运行时导入。此为静态证据，不是所有运行场景的绝对证明。
- 原例外到期时间仍为 `2026-10-13T23:59:00+08:00`；未续期、未扩展、未转为生产例外。
- 例外文件、验证脚本、变异测试及持续集成工作流均未修改。

| 证据 | 原批准摘要 | 当前摘要 |
| --- | --- | --- |
| 完整审计 | `sha256:12c2668947a2e90e05e3673e84354a9cb832803ce51e87ea98b12bc24d630233` | `sha256:aff258eecfa61488701a3e258d56e44a9e7a802b189316d6c8ff90eb26b718ec` |
| 生产审计 | `sha256:d3c060be74cf75e456b2f6cc0d3e26401f94dbc43da402675047501a18039168` | `sha256:6a813559958e16d81c2973e6a54512f0dcfa122b7dd0d440ec558ae6337ca885` |

根因验证：在内存中的诊断副本上，仅把依赖计数从 `dev=419, optional=121, total=476` 调回原 `413,115,470`，两个摘要都精确匹配原批准值；`prod=20` 始终不变。没有写入诊断副本，没有替换原始审计，也没有把诊断结果作为通过证据。

因此可以确定当前摘要差异来自这 6 个开发可选包的计数变化。然而原契约明确把 `AUDIT_EVIDENCE_DIGEST_CHANGED` 列为撤销条件，执行器不能自行重绑定批准摘要或豁免元数据。生产审计通过不等于整体安全验证通过。

原始证据在本地忽略产物 `.artifacts/security/npm-audit-full.json`、`npm-audit-production.json`、`npm-ls-braces.json`；本轮未上传。此前分片阶段文档描述的是补丁前状态，保留为历史证据。

## 补丁后重新执行的回归

| 验证 | 本轮结果 |
| --- | --- |
| 代码规范、类型检查 | 通过 |
| 单元、数据完整性及分片集成 | 19/19 通过 |
| 浏览器，桌面及移动仿真 | 30/30 通过 |
| 安全变异测试 | 26/26 通过 |
| Next.js（应用框架）16.3.8 生产构建 | 通过 |
| 依赖安装与解析、锁文件来源及完整性检查 | 通过，保留安装脚本策略警告 |
| 已安装包注册表签名与证明 | 通过 |
| 生产依赖审计 | 通过，0 高危 / 0 严重 |
| 规范整体安全门禁 | 失败，例外审计摘要不匹配 |
| 差异空白检查 | 通过 |

所有 69,416 个地理实体、99,406 条关系及搜索、比较、详情回归均通过；规范快照摘要仍为 `2e100f671f3a84997b30627ababbfc94e049f7c2d2cf8d328c42c6006a2778c5`。

内存代理复测：回收后堆占用最高 **7.64 MiB**，回收后 `heapUsed + external` 最高 **10.26 MiB**，采样峰值 **35.43 MiB**；连续 100 次请求后保留量变化 **-0.97 MiB**。未恢复全国数据全局常驻。标签仍为 `LOCAL_MEMORY_PROXY_ONLY`，不是完整云端运行隔离区内存验收；本轮进程驻留内存最高 102.52 MiB，也不能与堆代理混为一谈。

构建仍提示缺失 `metadataBase` 时使用本机默认地址；浏览器测试退出码为 0，但服务日志出现两次 `The destination stream closed early`。未确认其为产品缺陷，后续发布级验证仍须核对，不能宣称日志完全无错误。

## 剩余范围及返回条件

OKELOM 身份迁移未完成。默认索引仍关闭，但新要求的完整 `PRE_RELEASE_NOINDEX_GATE` 尚未实现，不能把既有测试通过冒充该门禁通过。云平台适配、真实运行时与并发内存验证、域名交接包及整个使命的精确提交绑定均未完成。

请求核心对话：依据上述精确摘要、相同漏洞链和仅元数据变化的证据，确认既有例外证据重绑定的有权处理路径；不请求扩大范围或延期。解除这一真实契约阻塞后，继续同一使命，完成适配后若依赖图再次变化，必须按最终依赖图重新核验，不预先授予未来变更豁免。

## 后续正式恢复补充（2026-10-09）

上述失败和未完成项是补丁阶段历史。创始人在现有长期对话提供 `FORMAL_RESUME_RECEIPT`，正式批准本页当前完整/生产审计摘要重绑定。仅调整例外记录两个摘要，原验证函数对相同审计对象转为 `PASS_WITH_EXACT_TIME_BOUNDED_EXCEPTION`；26项安全变异测试通过。范围、期限、补偿控制和算法未变，不产生生产例外。最新在线审计仍受依赖元数据外传权限限制，不能以既有对象冒充新审计。后续品牌、禁止索引、检查点和当前门禁统一见[持续计划](../superpowers/plans/2026-10-09-okelom-preview-readiness.md)。
