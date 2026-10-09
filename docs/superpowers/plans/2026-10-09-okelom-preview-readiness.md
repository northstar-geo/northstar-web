# OKELOM 上线就绪持续计划（Living Plan）

> 本文是当前使命唯一的产品工程持续计划，不是中央治理正文。使用现有执行器原位执行；代码实施使用 executing-plans 和 test-driven-development，完成声明使用 verification-before-completion。用户明确要求范围内连续推进，不增加重复计划审批；真实安全与外部权限门禁仍须满足。

**目标（Goal）：** 以精确提交、真实测试、真实安全证据和真实受保护预览，达到 `READY_FOR_FOUNDER_FINAL_GATE`，不自行公开发布。

**架构（Architecture）：** 保留唯一规范快照与已实现的分片读取；复用现有页面、索引函数、安全验证、测试和发布文档，补齐上线关键缺口，不并行建设第二套机制。

**技术栈（Tech Stack）：** Next.js 16.3.8、React 19.2.4、TypeScript、npm、Playwright；Cloudflare 适配未完成，不能把候选框架当成已选定的可部署实现。

**规格（Spec）：** 用户在当前长期对话提供的工作包 `C:\Users\Henry\.codex\attachments\3b00030f-12bc-4448-9d28-f6d2eaca8f54\已粘贴的文本.txt`；使命及补丁授权沿用本对话既有工作包。机器相关附件路径仅作来源，下面保留可独立执行的产品约束和验收条件。

## 唯一规范门禁状态与事实快照

```text
GOAL_ID = GOAL-OKELOM-LAUNCH-READINESS-001
CURRENT_GOAL = GOAL-OKELOM-LAUNCH-READINESS-001
MISSION_ID = MISSION-OKELOM-PRODUCT-IDENTITY-PREVIEW-READINESS-001
GOAL_STATUS = ACTIVE_BLOCKED
EXECUTION_STATUS = WAITING_FOR_ADAPTER_DEPENDENCY_AUTHORIZATION
GOAL_RUNTIME_TYPE = PERSISTENT
RUNTIME_GOAL_STATUS = active
AUTO_RESUME_CAPABILITY = UNKNOWN
SCHEDULE_REGISTRATION = VERIFIED
SCHEDULE_DELIVERY = VERIFIED_SINGLE_HEARTBEAT
LAST_OBSERVED_HEARTBEAT_AT = 2026-10-09T07:49:13.636Z
CURRENT_STAGE = LOCAL_BROWSER_CHECKPOINT_VERIFIED_G03_AUTHORITY_GATE
CURRENT_BLOCKER = ADAPTER_PACKAGE_AND_LOCKFILE_CHANGE_AUTHORIZATION_REQUIRED
LAST_REVIEWED_AT = 2026-10-09 18:52 +08:00
REPOSITORY = northstar-geo/northstar-web
WORKSPACE = E:\Projects\northstar\.worktrees\northstar-release-preparation-001
CURRENT_BRANCH = codex/okelom-identity-preview-readiness-001
IMPLEMENTATION_HEAD = 307cb06a5e918fef5763e72fb7b8ee7ff000a689
LAST_VALIDATED_HEAD = e9fc1b9756755193ce81c25a272a105fb96d972c
LAST_VALIDATED_HEAD_SCOPE = LOCAL_CHECKPOINT_ONLY_NOT_CLOUDFLARE_OR_RELEASE
WORKTREE_STATUS = SEE_GIT_STATUS_DOCUMENTATION_FOLLOWUP_ONLY
CURRENT_EVIDENCE_BINDING = EXACT_BROWSER_TEST_CHECKPOINT_COMMIT
BROWSER_TEST_CHECKPOINT = e9fc1b9756755193ce81c25a272a105fb96d972c
FINAL_REQUIRED_VALIDATION_BINDING = EXACT_HEAD_COMMIT
LAUNCH_READINESS = NOT_READY
SECURITY_GATE = PASS_WITH_EXISTING_TIME_BOUNDED_EXCEPTION
SECURITY_VALIDATION_SCOPE = FRESH_OFFICIAL_NPM_AUDIT_MATCHES_APPROVED_DIGESTS
NPM_READ_ONLY_AUDIT_AUTHORIZATION = GRANTED_FOR_THIS_MISSION
COMPLIANCE_EVIDENCE_REBIND = APPROVED
EVIDENCE_REBIND_DECISION = APPROVED
NEXT_RESUME_CONDITION = EXPLICIT_ADAPTER_PACKAGE_LOCK_WRITE_AUTHORITY_AND_EVIDENCE_REVIEW_PATH
EXACT_PREVIEW_URL = NOT_CREATED_OR_VERIFIED
ROLLBACK_READY = NO_EXACT_CANDIDATE_OR_DEPLOYMENT_BINDING
NEXT_HIGHEST_VALUE_ACTION = CORE_DECIDES_MINIMAL_G03_DEPENDENCY_WRITE_SCOPE
```

本块是本使命唯一当前门禁状态，后文历史记录和矩阵不得另行覆盖它。15:14的原生目标受阻状态属于正式恢复前历史；本轮正式回执到达后工具返回 `active`，实施恢复。`ACTIVE_BLOCKED` 表示目标保留且等待真实门禁，不是完成。实现与匹配本地验证已固定于上列检查点；后续仅记录证据的提交不能被误认作新的产品实现。运行时当前头提交始终以 `git rev-parse HEAD` 为准；最终回执另给实际头提交，不在自身文档中制造自引用哈希。当前证据不能冒充云端候选验收。

18:52本次独立本地缺口已验证并保存，工程现在等待仍明确禁止的适配依赖/包锁写入权限；不是因测试或提交完成而等待“继续”。原生目标工具最近返回active；该运行时标志不表示有工程进程在后台运行，也不等于门禁解除。此轮不把目标标记完成，不调整调度或权限。后续正式权限抵达后仍须先核对当前证据，任何新依赖图不沿用旧摘要自动放行。

核心对话：`6aa2eb14-4608-83e8-ac1e-476956bb6c82`。15:34提交及15:49复核均是批准前历史。创始人随后在本对话正式提供 `FORMAL_RESUME_RECEIPT`（附件 `81dae718-7599-4393-8a13-4869fd871030`），明确批准以下两个摘要及现有范围/期限；不是请求模板中的条件示例。只改例外记录两个摘要后，原验证函数对获批对象返回 `PASS_WITH_EXACT_TIME_BOUNDED_EXCEPTION`。输入未变化：

- `PACKAGE_JSON_SHA256 = sha256:c9b70fbd90f0db51501059c0505a92aac67825f1e7a6ac4960a44b22aae63909`
- `LOCKFILE_SHA256 = sha256:ac9cfd4026e6e68edabc3719a7942e99cda84ef2892517ab1b410a2bf1c011e8`
- 现有完整审计对象摘要：`sha256:aff258eecfa61488701a3e258d56e44a9e7a802b189316d6c8ff90eb26b718ec`。
- 现有生产审计对象摘要：`sha256:6a813559958e16d81c2973e6a54512f0dcfa122b7dd0d440ec558ae6337ca885`。

## 当前阻塞（CURRENT_BLOCKERS）

0. **原工具权限阻塞已解除（18:40）：** 创始人直接提供 `FORMAL_TOOL_AUTHORITY_REVALIDATION_RECEIPT`，明确授权 `tests/browser/site.spec.ts` 写入、格式化及既有依赖本地执行。工具已接受并实际完成首次6项定向测试：4通过、2失败；失败均为缺失区域的流式响应状态断言（预期404，实收200），不是权限拒绝。原生目标返回active；继续诊断与验证，不等待“继续”。包/锁/安全例外禁令仍独立有效。原拒绝保留于下方历史，不再作为当前停止原因。

1. **适配依赖写入权限：** 创始人已明确授权本使命必要的只读 npm 审计；2026-10-09 16:38实际在线审计成功，生产漏洞0，完整审计仍为同一开发链5高危/0严重，两个摘要精确匹配正式批准，原验证函数通过有时限例外。原审计传输阻塞已解除。但最新授权同时明确禁止自动修改 `package.json`、`package-lock.json` 或升级依赖；适配安装必须先确认其包文件变更范围，不能由只读审计授权推定。新依赖图若导致证据变化，仍按原例外撤销/重审规则执行，不能自动重绑定。到期仍为 `2026-10-13T23:59:00+08:00`。
2. **后续真实预览门禁：** 代码预览就绪后必须先交核心对话评审，再由其授权 `@Polaris｜Dedicated Work` 创建唯一 `okelom-web`。本执行器不操作云平台账户。未取得真实地址、部署标识、精确提交、保护配置和运行证据前，预览与运行时门禁不通过。
3. **后续产品事实输入：** 可公开支持渠道、日志提供方的真实保留和访问政策尚未确定。不能编造邮箱、服务时限、隐私承诺。多区域比较的产品范围也需核心对话明确（见 G-06），但不阻止获批后其他独立工程工作。

## 上线就绪矩阵（LAUNCH_READINESS_MATRIX）

本表 `FAIL` 表示当前尚不能验收上线，不一概表示已发现代码缺陷。局部通过、历史通过、未验证、外部授权需求分别说明；任何最终通过声明都必须重新绑定最终提交和实际预览。

| 门禁 | 当前结果 | 已有事实或证据 | 尚缺的验收条件 |
| --- | --- | --- | --- |
| A 产品身份 | PASS_LOCAL_ONLY | 当前页面/社交元数据/来源说明均已迁移；旧主题偏好兼容；10类页面无旧品牌断言通过 | 最终精确提交及真实预览复验，历史标识保留 |
| B 核心功能 | FAIL | 最近本地浏览器42/42，包含键盘两地流程、错误恢复、缺失数据与代表链接 | 适配后精确提交及真实预览回归；范围明确的多区域比较验收 |
| C 数据完整性 | FAIL | 已有23项本地测试含69,416实体、99,406关系及全字段等价；规范快照摘要未变 | 最终适配产物、精确提交与预览覆盖证明；不得以改后的构建破坏数据 |
| D 内存与运行时 | FAIL | `DATA_SHARDING=PASS_LOCAL`；既有堆代理最高7.64 MiB、无全国全局常驻 | 完整页面渲染、并发、真实 Worker（运行隔离区）CPU/内存/资产请求验证 |
| E 安全 | PASS_WITH_EXACT_TIME_BOUNDED_EXCEPTION | 17:19官方npm审计与获批两个摘要一致；本轮既有产物验证通过；生产0漏洞、开发链5高危，范围和到期不变 | 最终候选最新验证及适配后证据重审；不是整体零漏洞或未来依赖豁免 |
| F 技术索引与元数据 | PASS_LOCAL_ONLY | 三条件显式生产开关；误配矩阵、页面/分享图/图标/数据资产禁止索引、无结构化数据、空站点地图通过 | 最终云端产物含静态资产同等控制，真实访问保护与精确域名验收 |
| G 性能 | FAIL | 旧本地实验脚本存在；分片搜索当前为两遍顺序读取14段 | 真实预览移动交互、页面载荷、请求瀑布、缓存、搜索与比较耗时 |
| H 响应式与视觉 | FAIL | 桌面/手机仿真、320px小屏和768px平板的暗色、长内容、无溢出及截图检查通过 | 适配后的真实预览、跨浏览器及真实设备复核 |
| I 无障碍 | FAIL | 10类页面自动检查、地图/表格焦点、键盘从跳过导航到搜索/详情/比较及错误恢复通过 | 真实预览及设备辅助技术复核，不将自动检查视为全面认证 |
| J 内容与信任 | FAIL | 数据源、方法和关于页已有说明；关于页含隐私内容 | 去除发布前内部待办文案、确认支持/日志事实及日期；不凭空编造法律条款 |
| K 链接与错误质量 | FAIL | 10类页面与21个抽样站内目标分别通过桌面/移动实访；控制台/页面/HTTP失败为0；仅预取取消另存证据 | 最终适配及真实预览复核；本地已证明主动取消可触发流日志，但不泛化为所有流错误无害 |
| L 云平台预览 | FAIL | 无已验证预览；仅既有适配候选静态检查 | 核心对话评审、专属执行工作创建、访问保护含直达资产、精确部署证据及回归 |
| M 域名/证书/跳转 | FAIL | 目标明确为okelom.com；本轮未访问或配置真实域名 | 授权执行者完成后验证四种协议/主机入口、HTTPS与www到根域跳转、规范网址 |
| N 发布安全 | FAIL | 环境契约、回滚、日志、设备、上线清单等原文档已存在 | 更新同一文档体系为当前适配方式、精确提交/快照/构建、冒烟与回滚演练及监测责任 |

`SEARCH_INDEXING_GATE = FOUNDER_RESERVED`。公开发布、索引启用和高影响域名解析操作均不能由本计划自动批准。

## 已知差距与优先级（KNOWN_GAPS）

| 编号 | 优先级 / 依赖 | 最小正确动作；复用点 | 可核验关闭条件 |
| --- | --- | --- | --- |
| G-00 | P0 当前安全门禁 | 读取正式治理回执并核对两个审计摘要、包与锁文件摘要、依赖链、范围、期限；只按明确授权修改例外记录，不改验证算法 | 原安全验证与变异测试通过；例外明确分类且未到期；未来适配造成新漂移需重审，不作预授权 |
| G-01 | P0 / G-00 | 修改现有 `app/layout.tsx`、`app/opengraph-image.tsx`、页头页尾、关于/首页/详情文案、`lib/seo.ts`、README和当前状态页；复用主题存储并处理旧键兼容 | 当前公开内容和元数据无旧品牌；历史使命/项目/提交/治理证据原样；新增品牌回归覆盖公开表面 |
| G-02 | P0 / G-00 | 加固现有 `indexingEnabled()`、`pageMetadata()`、robots及站点地图，不新增平行门禁；预发布阶段约束与生产正式域名同时校验 | 缺失/false/异常配置、HTTPS预览且误设true等矩阵保持禁索引；无预览结构化数据、公开站点地图泄漏；未来生产测试不能激活实际索引 |
| G-03 | P0 / G-00,G-02 | 按执行时官方已发布版本核验vinext及其依赖，再决定最小单一适配路径；替换 `lib/geo/asset-loader.ts` 传输层为内部资产绑定 | 本地适配构建及运行通过、全部数据不丢失、禁止公共回源绕过访问保护；相关依赖变动安全重新验证 |
| G-04 | P0 / G-03 | 复用 `scripts/measure-geo-memory.ts` 和现有实验脚本，验证渲染/并发/重复请求；实测搜索28段读取和邻近14段读取成本 | 真实预览无平台内存/CPU超限或明显慢路径；不以Node堆代理替代云端实测；不重写已通过分片架构 |
| G-05 | P1 / G-00 | 扩展现有 `tests/browser/site.spec.ts` 与同一Playwright配置的平板、小屏、键盘、错误恢复、链接/控制台/网络断言 | 桌面/平板/手机代表路径、长内容及错误/空状态可用；疑似流提前关闭先复现归因再修复 |
| G-06 | P1 范围事实 | 当前 `app/compare/page.tsx` 仅left/right两列，六实体检查仅数据层内存探针。向核心对话区分“现有两地比较”与“新增3+区域界面” | 核心对话明确多区域比较是否首发必要及验收范围；未明确不新增大功能、不把探针记作产品通过 |
| G-07 | P1 / 真实运营输入 | 复用关于页和 `PRIVACY_AND_SUPPORT_READINESS.md`、`PRODUCTION_LOGGING_REQUIREMENTS.md`；确认公开联系方式和日志事实 | 无发布前待确认占位文案；隐私/方法/限制真实一致；提供可用反馈渠道 |
| G-08 | P1 / G-03及核心评审 | 更新现有 `STAGING_ENVIRONMENT_CONTRACT.md`、`STAGING_VALIDATION_CHECKLIST.md`，完整覆盖安装/构建/输出/环境/访问保护/域名交接，不另建部署路径 | 核心对话认可代码预览就绪；Dedicated Work交回唯一项目的真实受保护预览及部署信息 |
| G-09 | P1 / G-08 | 复用发布清单和 `ROLLBACK_PLAN.md`，固定当前候选提交与快照，不使用浮动分支；四网址行为由授权域名操作后验证 | 全部非创始人保留门禁有精确证据；回滚可执行；没有擅自公开发布或启用索引 |
| G-10 | P1 / 最终代码稳定 | 当前说明已同步OKELOM与限时例外；本轮纠正已授予审计权限及历史清单范围，保留旧项目证据 | 最终候选提交、真实预览与安全证据仍需闭环；不把当前文档同步当最终远端验收 |

额外审查风险（不是已确认缺陷）：邻近距离相同时原快照顺序与新搜索人口排序顺序可能不同；派生资产生成器未清理旧清单外文件；清单本身的来源摘要与部署身份需明确绑定。先加确定性/旧资产/部署身份检查，只有复现上线级问题后做最小修复，不借此整体重构。

### 第二循环：只读边界检查

- `WHAT_CHANGED`：将分片性能风险量化，并补充当前产物集合及代表性邻近结果检查；没有修改实现。
- `WHY`：前一循环仅标注风险，本轮用现有规范快照、派生资产和原提交实现区分当前缺陷与未来验收事项。
- `EVIDENCE`：2026-10-09 14:55 +08:00，只读诊断进程在内存中解读构建专用规范快照，未向运行时代码引入全量加载。33,791个ZCTA没有完全重复的参考点坐标；`10001`、`00601`、`90210`、`78582` 的6个邻近结果及距离与原实现逐项相同。样本不是全国所有等距情况的证明，等距顺序边界仍待回归测试。
- `EVIDENCE`：当前磁盘675个派生文件与清单匹配，缺失0、清单外残留0；这排除当前产物残留，不证明下一次数据更新自动清理正确。
- `EVIDENCE`：14个搜索分片合计6,818,068字节；现有两遍扫描读取13,636,136字节（约13.64 MB / 13.00 MiB）。这是服务端未压缩资产读取总量，不是浏览器载荷、同时保留内存、计费网络流量或实际耗时。
- `IMPACT_ON_LAUNCH_READINESS`：没有发现需立即回退分片方案的样本差异；G-04的真实预览验收必须量测资产读取次数、CPU及搜索延迟，再决定是否有必要做最小优化。不得仅凭字节数判定平台失败，也不得提前宣布性能通过。
- 正式治理回执仍缺失；核心对话最新消息未变化，仍为评审请求而非批准。包/锁文件摘要、构建标识和保留浏览器报告未变，现有安全验证函数仍返回 `RAW_AUDIT_DIGEST_MISMATCH`。本轮没有重跑构建或覆盖审计。非敏感分析已达到可交接深度；下一有效动作仍依赖正式治理回执，不制造循环活动。

### 第三循环：真实阻塞审计

2026-10-09 14:57 +08:00，再次只读核验核心对话、工作树、已有测试/构建证据、部署配置和安全验证函数：正式批准仍未出现，摘要漂移失败仍存在。自本目标建立起连续三个目标回合遇到同一治理阻塞；前两回合完成了计划与非敏感差距证据，本回合无新的可授权实施动作。原生目标状态设为 `blocked`；目标仍保留，实际工程执行已停止并等待外部门禁，不是完成。此前“每小时跟进”的表述只能证明调度配置已登记，不能证明后台实际执行或受阻目标会被自动唤醒；以以下本轮修正为准。不再进行重复无变化的工程循环。

## 已完成差距（COMPLETED_GAPS）与验证证据（VALIDATION_EVIDENCE）

### 本轮浏览器与发布文档增量（2026-10-09 18:47 +08:00）

- G-05本地增量：现有文件增加4个测试场景，在桌面及手机仿真共新增8次执行；完整42/42通过、0失败/跳过/不稳定，报告开始 `2026-10-09T10:44:05.283Z`，耗时89,034.234ms，报告SHA256 `0a7538b5942ab1474767a000461938f668851265e122b933ffb137d1838b11ce`。本地结果不代表云端、Firefox或真实手机；最终精确提交仍需绑定复验。
- 覆盖真实键盘跳过导航→00601搜索→详情→两地比较；缺失区域→搜索空结果→有效结果及无效比较恢复；320/768px暗色、长查询、控件可达、无溢出和自动无障碍；10类代表页面加21个站内目标实访。未删除原有效测试、扩大超时、增加跳过或模拟核心流程。320px移动截图人工复核未发现控件遮挡/文字截断。
- 网络附件：桌面131次、移动102次取消均为带 `next-router-prefetch=1` 的 `net::ERR_ABORTED`；其他请求失败、HTTP错误、页面异常及控制台错误均为0。只对已证明的预取取消单列证据，非预取取消仍失败；服务端日志未过滤。
- 流日志对照：独立本机服务、同一 `/state/ca` RSC预取请求，三次完整读取均200/6300字节/0流日志，三次首706字节后主动关闭均200/1条同名流错误及1条应用错误事件。框架源码 `react-server-dom-turbopack-server.node.production.js` 的close处理器直接调用该错误的取消处理。第一次未跟随框架307的诊断不构成证据，已排除。结论仅为证实客户端取消可触发此日志，不证明所有历史错误同因，也未全局屏蔽错误或改框架。
- G-08/G-09/G-10独立文档检查：在现有清单补充三条件索引、直达资产访问保护、流式缺失页语义、真实预览回滚证据；将旧已审查基线明确为历史而非当前云端回滚目标，移除“审计仍待授权”的过时说明。部署标识、支持渠道、日志提供方事实仍未编造。适配安装与包/锁变更依旧禁止，不能凭本次浏览器权限解除。
- 独立增量评审：`browser_gate_review` 只读检查本轮测试/文档及实际报告，无严重或重要问题；确认流式状态码前提修正不是弱化测试。唯一次要建议为同步顶部“未验证测试”的旧状态，已纳入本次必需门禁状态更新。评审未裁决云端、所有历史流错误、新依赖安全、真实设备或3+区域功能；执行裁决为这些仍属未完成门禁/待定范围，不能以本地增量审查替代。代价/限制：云端适配后仍须完整复验；未增加功能或工具权限。
- 测试检查点已提交为 `e9fc1b9756755193ce81c25a272a105fb96d972c`；本轮只有测试与现有发布文档变化，产品实现、包/锁/安全例外未修改。已在实际测试执行环境核对Firefox二进制未安装，不下载或安装，不把两种Edge视口称作跨浏览器通过。创始人原工作树 `AGENTS.md` 18行改动保留。后续文档提交不改变测试/实现；最终回执须分别列实际HEAD与精确已验证测试检查点。
- 18:52提交后复验：精确 `e9fc1b9756755193ce81c25a272a105fb96d972c` 上代码规范、类型检查、23/23单元/完整数据等价与26/26安全变异测试通过；浏览器42/42、0失败/跳过/不稳定，开始 `2026-10-09T10:49:49.825Z`、耗时143,218.468ms，报告SHA256 `eced99b967d6e0cdd274598d9aaf8c941db2f416737d4f7b02002c84a9732a06`。本轮未修改产品实现或依赖，复用既有同实现构建，没有宣称新云平台构建或新在线审计。G-05本地补测和独立文档差距已处理；剩余最高价值G-03必须安装适配器/改包锁，最新回执明确禁止。其他剩余门禁为真实预览、提供方/支持事实和未明确多区域范围，不通过额外功能制造进展；返回核心对话明确最小依赖写入及新证据重审路径。

### 适配依赖最小授权候选（只读分析，尚未授权或安装）

- 原生目标本轮保留；上一轮新审计属于实质进展。本轮仓库/分支/头提交不变，核心对话最新仍仅为只读审计建议，未见适配包文件变更授权。当前依赖仍为 Next16.3.8、React/ReactDOM19.2.4。
- 候选：`@opennextjs/cloudflare@1.20.9` 与 `wrangler@4.125.0` 精确锁定，连同必要传递依赖；不升级或降级现有Next/React/ESLint链。注册表固定版本元数据确认适配器要求Next `>=15.5.27 <16 || >=16.3.8`，Wrangler要求Node>=22，本机24.18.0满足声明范围。这是选型候选，不是运行兼容性通过。
- 公开元数据确认 `rclone.js` 与 `@cloudflare/workers-types` 均为可选同伴依赖，不纳入初始最小安装请求。最终实际解析结果必须重新审计，不能只凭直接依赖列表判断安全。
- 当前源码搜索未发现重验证、数据缓存、`next/image` 或Edge运行时用法。可评估静态页采用只读静态资产缓存、动态页保留服务端渲染；不引入R2/D1/KV/队列、账户凭据、付费或云资源。官方资料：[缓存](https://opennext.js.org/cloudflare/caching)、[运行时与Windows限制](https://opennext.js.org/cloudflare)。本机完整运行兼容性须安装获批后实测，不能以声明替代。
- 预期变更限于包与锁文件、适配配置/类型、本地构建预览脚本、`lib/geo/asset-loader.ts`内部资产绑定、直接静态资产响应头及对应测试/既有交接文档。生成入口候选 `.open-next/worker.js`、资产候选 `.open-next/assets`；均尚不存在已验证产物。保留规范gzip、分片架构、页面功能、禁止索引和历史标识。
- 不运行官方 `migrate` 自动命令：其文档说明可能创建R2桶；只在获得代码范围授权后手工配置。不运行部署、上传、登录、远程绑定或资源创建，不向`.github/workflows/`扩展。[官方入门说明](https://opennext.js.org/cloudflare/get-started)
- 适配后的地理分片需使用内部 `ASSETS` 绑定，不从公开预览网址绕行访问保护。平台静态资产不受 `next.config.ts` 响应头自动覆盖，须单独验证直接资产的禁止索引与访问保护。[官方绑定说明](https://opennext.js.org/cloudflare/bindings)
- 待核心对话确认：是否允许以上必要新增依赖及包/锁文件写入，并指定依赖变动后的安全证据重审路径。现有例外不扩大/续期、不自行重绑定；若新公告、生产高危/严重或证据漂移触发契约即停止受影响操作。本轮仅保存此分析，未安装、改包/锁、运行审计、测试、提交或推送。

### 正式恢复后的本地检查点

- 提交前验证：代码规范、类型、生产构建通过；23/23单元/分片/数据测试通过；34/34桌面与移动仿真浏览器测试通过；26/26安全变异测试通过；原安全函数对获批审计对象通过有时限例外。真实设备、Firefox、实际云端验证和最新在线审计未执行。检查点提交后再复验精确提交，不声明整个目标完成。
- 实现检查点：`307cb06a5e918fef5763e72fb7b8ee7ff000a689`，52个文件，包含已保留的分片工作、已授权补丁、例外摘要重绑定及本轮身份/索引修复。提交后工作树干净；此记录是纯文档跟进。最终回执必须给出之后实际执行的验证结果，不以本条预先声明通过。Founder原 checkout 的 `AGENTS.md` 18行原修改未触碰，暂存区为空。没有远端推送、合并、部署或索引激活。

- 身份迁移与预发布索引测试先失败、再实现、再通过；覆盖首页/搜索/各层详情/比较/方法/来源/关于、社交元数据、旧主题偏好迁移、配置缺失/误配、空站点地图、无结构化数据及直接图片/图标/数据资产响应头。生产配置仅在隔离测试进程中验证，未部署或开启索引。
- 只读整分支评审发现缺失人口被投影为0，当前60个实体受影响；新增失败测试复现 `Falls Run CDP`，保留 `null` 后修复。排序仍可把缺失值按0排序，但显示不再编造0；全国全字段投影验证同步覆盖。评审未发现其他严重项，允许作为本地检查点，不代表产品审批。
- 非阻塞评审事项：严格等距的邻近结果可能与旧规范快照顺序不同（合成样本可复现，当前全国影响未证明），暂不为此扩大分片结构；README运行时资产描述已更正。清单外旧资产清理和部署身份绑定在适配阶段验收。
- 本地数据内存代理：保留堆最高7.62 MiB，采样 `heapUsed + external` 峰值35.39 MiB，100次请求保留变化-0.97 MiB。采样不是连续峰值/完整页面并发/云端隔离区验收；进程驻留最高107.91 MiB，不与堆混淆。
- 浏览器日志间歇出现 `The destination stream closed early`。本轮单独执行相关分页导航的立即关闭/延迟5秒关闭诊断，均无浏览器页面异常，观察到许多框架预取 `net::ERR_ABORTED`；该独立运行未复现服务端流错误，不能断言根因已确证或日志无错误。保留G-05/G-K真实预览风险，不删除或静默过滤日志。
- 适配选型核验已记录在现有[环境契约](../../release/STAGING_ENVIRONMENT_CONTRACT.md)：当前发布 `vinext@1.1.0` React同伴要求不满足；OpenNext当前版本声明接受Next16.3.8，但两者都需改变依赖证据。尚未安装/选择最终方案，在线审计授权是继续适配前的真实权限依赖。

### 正式恢复前的保留证据（以下不是当前失败判定）

- 全国实体图全局常驻已由分片读取替换；保留675个派生产物、14搜索段，实体与关系完整性见已有测试和 `docs/release/OKELOM_SHARDING_PROGRESS_2026-10-09.md`。关闭的是**本地数据层问题**，不是完整运行时门禁。
- Next.js补丁精确16.3.8已安装；本轮包/锁文件摘要未变。补丁回归记录在 `docs/release/OKELOM_NEXT_PATCH_EVIDENCE_2026-10-09.md`。关闭生产漏洞补丁问题，不关闭开发工具例外门禁。
- 原批准证据已从持续集成产物 `11420577414` 恢复：运行 `37479538737`，批准头 `798732da5b05d6e6ecd48e2be3dd1b040121364f`，压缩包摘要 `sha256:f702fdef513a0d6965940afe96a88cfe10ba672535b1ec6f8bb52674c2e2d30a`。旧完整摘要精确匹配批准记录；本对话13:31回执含六项记录和逐字段比较，未靠新对象重建旧对象。产物到期 `2026-10-20T14:32:02Z`，再次引用前核验可用性。
- 本轮读取 `test-results/results.json`：开始于 `2026-10-09T05:14:48.540Z`，30预期、0失败、0跳过、0不稳定；这是保留报告，不是本轮重跑。
- 本轮读取现有 `.next/BUILD_ID`：`HZr8XsUKAO0KYtNBkdZvX`。文件存在不独立证明新构建成功；构建通过来自同日补丁执行记录。本轮没有重建、安装或运行会覆盖审计的命令。
- 本轮读取已有审计（13:13生成）并运行原验证函数：仍失败 `RAW_AUDIT_DIGEST_MISMATCH`；没有向注册表请求新审计，也没有替换原始产物。旧审计不能保证未来公告状态不变，获批实施和最终阶段须重新执行规范安全验证。
- 本轮计划编辑前，除本计划外129个版本化/未忽略文件的排序“路径+SHA-256”清单摘要为 `sha256:83dc9ddd46cd3e3b18436bbf558df090cce315dbc012dae129d6508fc888b183`；编辑后复核，确保仅计划改变。

## 持续执行、外部门禁与恢复条件

本目标采用持续目标驱动执行（PERSISTENT_GOAL_DRIVEN_EXECUTION），不采用完成一个小任务就退出的单次任务模型。每个实质循环开始先读本计划、实际仓库/分支/头提交/工作树、当前测试和构建证据、安全结果、部署配置及正式权限；检查已有代码、测试、配置及已关闭差距。只选择最高风险/用户价值/依赖排序的上线必要差距。用失败测试定位、最小实现、相关验证、评审、证据和计划更新闭合循环，权限及验证允许时提交，再选下一项。不存在真实外部门禁时继续同一目标，不要求创始人为每个差距重复说“继续”。

安全等待阶段仅只读审查、非敏感分析和本计划更新；不反复重跑昂贵测试或为了“持续活动”重写文档。正式收到 `EVIDENCE_REBIND_DECISION = APPROVED` 后，先核对回执对应的包、锁文件、两个原始审计对象、依赖链、作用域、期限及未撤销状态。仅执行回执明确授权的重绑定，再运行原规范安全验证；实际通过后才能把 `SECURITY_GATE` 改为 `PASS`，同时保留安全例外分类，不把例外接受写成零漏洞。批准措辞不明确、输入不匹配或新依赖图超出批准时，继续等待并返回核心对话。

此前只读核验确有原对话的自动化配置 `okelom`：类型 `heartbeat`、配置状态 `ACTIVE`、计划间隔为每小时，目标对话 `01a0e3bf-d449-7722-9523-2f0091ccffc9`。2026-10-09T07:49:13.636Z已实际收到一次投递。此次实施由创始人正式回执直接触发，原生工具返回 `active`；这不证明定时检查可自动读取批准并恢复，故 `AUTO_RESUME_CAPABILITY = UNKNOWN`。单次投递不保证未来每小时必达或持续后台进程。本轮未改变调度。

无需创始人另说“继续”的精确条件：正式批准已到达本对话的可执行回合，证据身份、期限和权限核对通过，并按授权完成规范安全门禁验证。届时沿用同一目标依次推进 OKELOM 身份、禁止索引门禁、Cloudflare 运行时适配、预览就绪及持续差距修复，直到 `READY_FOR_FOUNDER_FINAL_GATE` 或新的真实门禁。若没有实际调度投递，需将正式回执发到当前对话触发处理；不能承诺无人触发时自动发现批准。真实外部门禁继续记为目标保留且阻塞，不记为目标完成。

提交策略：正式恢复后的工作包允许语义清楚的本地检查点提交，优先于此前整使命完成前不提交的旧约束。每次提交执行范围匹配验证，重大阶段完整验证；在线安全及适配门禁未过前不作最终远端交付。最终声明绑定精确头提交和真实预览，执行者不得自行批准自身实现或合并。

## 创始人及外部执行门禁（FOUNDER_GATES）

- 公开发布、开启搜索索引、高影响域名解析变更、新增费用/基础设施/外部服务、实质产品范围扩大：等待明确授权。
- 真实Cloudflare账户操作、唯一 `okelom-web` 创建与真实域名/证书/跳转：核心对话授权专属工作执行，本执行器只做获准的应用行为验证。
- 真实支持渠道与日志事实由有权方确认；不编造、不创建外部账户。
- 当前不允许合并至main、生产部署、路由器接入、中央治理或其他产品仓库修改。

## 上线后待办（DEFERRED_POST_LAUNCH_ITEMS / POST_LAUNCH_BACKLOG）

- 新产品类别、AI功能、账户/广告/支付、教育/就业/通勤数据、新地图与商业数据来源：不在本次实施。
- 更丰富的比较分析及排序建议：除非核心对话明确首发最小要求，否则后置。
- 真实用户规模下的长期核心网页指标趋势、性能容量扩展：作为上线后跟踪；首发前仍需真实预览实验及可执行监测方案，不伪装已有生产流量数据。

## 本轮计划变更记录

- 2026-10-09 18:40 +08:00：正式工具权限回执被接受，格式化和6项定向浏览器测试已实际执行。键盘流程与320/768px暗色布局通过；错误恢复测试在桌面/移动均发现 `/zip/99999` 状态200但已显示真实缺失区域界面。Ruling: 已安装Next16.3.8文档及官方 `not-found`/`loading` 文档明确流式缺失页返回200并附noindex，原新增404断言对该路径前提错误；不删除错误恢复覆盖，改为验证流式缺失界面、禁索引、无虚构数据和可恢复操作，同时保留非匹配路由的严格404断言。代价/限制：不能将流式200等同于传统HTTP404，也不声称真实爬虫已验收。服务端流提前关闭日志本轮复现，继续采集请求取消证据，未静默过滤。原安全函数对既有批准审计产物仍通过限时例外，包/锁/例外未变；不是新在线审计。

- 2026-10-09 17:24 +08:00：本次恢复原始回合完成新审计并遇到工具权限拦截；随后两个续执行回合核验同一核心对话最新回执、仓库与工作树，均无解除拦截的新事实。上一轮属于无进展复核，不是等待已启动的测试作业；命令被拒绝后没有活跃验证句柄。独立只读分析已完成，测试写入/执行仍需工具接受明确恢复权限；不改变工具或命令绕过拒绝。连续三轮阻塞阈值满足，原生目标工具确认 `blocked`。只同步本计划运行时事实；已有3项测试增量保留但未验证、未提交，包/锁/例外未改，目标未完成，调度未变。

- 2026-10-09 17:22 +08:00：工具审查两次拒绝测试文件格式化及浏览器执行（未启动命令），已停止受影响操作并记录上方准确状态。没有再次请求相同审计授权，也没有修改包、锁文件或安全例外；测试文件保留本轮未验证增量，待权限核验后先验证再决定保留。`git diff --check`通过，实际HEAD仍为 `233d814ff26e4244e84ef5ae93bdf9c1e075a68f`；未新增提交、推送或部署。本轮不因工具拒绝把已核验的安全例外改报为漏洞整改失败。

- 2026-10-09 17:19 +08:00：创始人在本对话再次正式授权本使命只读审计，并要求无安全漂移时立即恢复；原生目标工具确认 `active`。新在线完整/生产审计返回5高危/0严重与生产全部0，两摘要、包/锁哈希和依赖链均与正式重绑定相同，原安全验证通过有时限例外；官方公告仍无修复版。没有修改依赖或例外。Ruling: 适配包写入禁令只阻塞G-03及依赖它的工作，不应冻结独立G-05；继续使用既有依赖补键盘、错误恢复、320px小屏与768px平板的本地验证。代价与限制：这些证据仍需适配后在真实预览复验，不代表云端就绪；不为验证覆盖制造产品变更。用户要求复用本持续计划，因此不新建并行账本。

- 2026-10-09 16:42 +08:00：只读审计授权后的原始回合及两个续执行回合均遇到适配包/锁文件变更权限未明确。原始回合完成在线审计，第二回合完成公开元数据及副作用分析并形成最小授权候选；本轮核心对话无新授权、仓库与头提交未变，没有可据此启动的安装或适配作业。最小候选已充分明确，不再用重复读取或计划重写制造进展。连续三轮条件满足，原生目标工具确认 `blocked`；目标未完成，等待核心对话明确依赖写入范围及安全证据重审路径。仅同步本计划运行时状态，不撤销已授予的只读审计权限，不改变现有例外或调度。

- 2026-10-09 16:38 +08:00：用户明确授予本次及本使命必要的只读npm审计元数据传输权限，禁止自动修复、包文件变更、升级及新例外。复核仓库/分支/HEAD仍为 `233d814ff26e4244e84ef5ae93bdf9c1e075a68f`；仅计划有既有未提交状态记录。禁用用户/全局npm配置和相关认证环境变量，以官方注册表执行完整及生产只读审计，结果时间为 `2026-10-09T08:38:12.207Z`。完整5高危/0严重、生产全部0；摘要分别 `aff258eecfa61488701a3e258d56e44a9e7a802b189316d6c8ff90eb26b718ec` 与 `6a813559958e16d81c2973e6a54512f0dcfa122b7dd0d440ec558ae6337ca885`，与获批记录一致；原安全函数返回 `PASS_WITH_EXACT_TIME_BOUNDED_EXCEPTION`。官方GHSA页面仍标记未有修复版本；npm建议的eslint-config-next大版本降级不执行。包/锁文件前后SHA256完全一致，例外未改，旧审计文件未覆盖，未发送源码/密钥/业务数据。当前只同步本计划的授权和证据事实，不将审计通过冒充云平台或上线就绪。

- 2026-10-09 16:29 +08:00：正式恢复后的原始回合及两个续执行回合连续遇到同一在线审计元数据传输授权缺失。原始回合完成本地检查点及精确 `233d814ff26e4244e84ef5ae93bdf9c1e075a68f` 复验；上一续执行回合属于无进展复核，不是有活跃作业句柄的等待。本轮核心对话最新消息仍是建议选择授权及复制模板，用户消息同时列出两个选项，不能推定为已确认。仓库、分支、头提交及干净工作树未变，未收到新的明确授权。已满足连续三轮阻塞审计，原生目标工具确认 `blocked`；目标完整保留且未完成。只同步本规范状态，不运行审计、安装、重测、推送、部署或修改调度。恢复需明确允许将包名、版本与依赖关系发送至npm官方审计服务，不含源码、密钥或业务数据；不授权自动修复或例外扩大。

- 正式恢复回执：创始人在本对话提供 `FORMAL_RESUME_RECEIPT`（附件 `81dae718-7599-4393-8a13-4869fd871030`），批准两个现有审计对象摘要及原到期时间，授权继续原使命。重绑定只改例外记录的两个摘要；原规范验证由 `RAW_AUDIT_DIGEST_MISMATCH` 转为 `PASS_WITH_EXACT_TIME_BOUNDED_EXCEPTION`，26项安全变异测试通过。官方公告仍无修复版；开发依赖例外不是零漏洞或生产例外。在线 npm 审计被工具审查拒绝（依赖元数据外传授权不足），已向用户请求明确授权，不绕过；本地批准对象结果不冒充最新在线审计。
- Ruling: 继续已批准的原计划，按用户要求复用本文记录而不新建并行计划/账本；品牌统一与现有索引函数加固属有界实施。保持包名、仓库名、历史项目/使命/安全标识，不为文案迁移改依赖图。预发布必须同时禁止索引和跟随，只有 `RELEASE_STAGE=production`、明确真值开关及精确正式源站同时满足才允许未来索引；本轮不设置实际生产配置。若部署配置误声明生产阶段仍需部署权限层约束，不能由环境字符串代表创始人批准。
- 本轮测试先行：品牌元数据与预发布误配回归先失败；旧构建浏览器测试因缺少 `OKELOM home` 失败，证明公开身份未迁移；修复后单位回归3/3，新构建完整浏览器34/34通过。审查后人口缺失值另经失败测试及修复。下一阶段适配不得以公共资产回源绕过访问保护。

- 2026-10-09 15:49 +08:00：首次观察到 `okelom` 真实心跳投递，更新投递证据而不推断自动恢复成功。核心对话新增最终审批提交材料（消息 `965f88ec-6383-4838-b99d-08c85104a475`），尚非批准回执。只读核对包、锁文件、审计摘要、开发依赖链及期限与提交材料一致；现有验证仍失败 `RAW_AUDIT_DIGEST_MISMATCH`。仅更新本计划，未生成新审计、安装依赖、改例外或产品代码；未改变原生目标受阻状态。除本计划外129个版本化/未忽略文件摘要仍为 `sha256:83dc9ddd46cd3e3b18436bbf558df090cce315dbc012dae129d6508fc888b183`。

- 2026-10-09 15:14 +08:00：修正请求及其后两个目标续执行回合连续遇到同一正式重绑定批准缺失。上一回合是无工程进展的状态复核，不是具有活跃作业句柄的验证等待。本轮核心对话更新时间仍为 `1791529618.677406`，没有新回执；分支、头提交和包/锁文件摘要未变。安全范围内的既有只读差距审查已完成，继续实施需要外部批准；原生目标已通过工具设为 `blocked`，不再空转，不标记完成。本轮仅同步本计划的运行时状态，未修改产品、安全证据或调度。

- `WHAT_CHANGED`：2026-10-09 15:08 +08:00，原位纠正目标状态、工程执行状态和自动恢复能力，顶部保留唯一规范门禁状态；撤回把每小时配置描述为已实际运行的含义。
- `WHY`：持久目标、已登记调度与正在执行是三个不同事实，不能互相代替。
- `EVIDENCE`：原生目标工具首次返回现有目标及 `blocked`，15:12复核为 `active`，不能据此推断工程执行恢复；本机 `okelom` 配置和查看卡片证明登记，不证明投递；现有规范安全函数仍为 `RAW_AUDIT_DIGEST_MISMATCH`。
- `IMPACT_ON_LAUNCH_READINESS`：只修正本计划；没有产品代码、安全记录、调度配置或权限变化；上线仍未就绪，恢复仍须正式证据重绑定批准。

- `WHAT_CHANGED`：将原预览实施计划提升为同一使命的唯一上线就绪持续计划，补充A–N矩阵、差距排序、已完成/未验收分层、真实外部门禁与自动恢复规则。
- `WHY`：最新用户目标从单次预览准备扩展为有明确停止条件的上线就绪持续循环；不新建长期执行器或平行治理。
- `EVIDENCE`：本轮实际检出、包/锁/快照、审计验证函数、浏览器报告、构建标识、核心对话状态以及页面/测试/发布配置只读检查。
- `IMPACT_ON_LAUNCH_READINESS`：目标与差距可追踪，但没有任何新增上线通过结论。实际实施继续受安全重绑定门禁限制。

下方保留原架构决策与实施记录；其中旧STOP是当时事实，以本文件顶部的当前状态为准。

## Goal and authority

Mission: `MISSION-OKELOM-PRODUCT-IDENTITY-PREVIEW-READINESS-001`.
Repository: `northstar-geo/northstar-web`; baseline `ed7b2355ab931ec2d66080da012dced600aaa12e`.
User's 2026-10-09 supplemental work package is the binding specification.
Keep canonical `data/geography.json.gz` unchanged. No deployment, external datastore, containers, credentials, DNS, indexing activation, merge or historical evidence rewrite.

## Architecture and decisions

Reuse existing import output, model, pages and Census sources. A build-only generator emits deterministic immutable JSON assets: small manifest (sources, counts, state/nation profiles), hash-partitioned detail/route records, paginated state links, and size-bounded compact search parts. Every generated artifact binds the source digest. Runtime accesses only read-only assets through an injected async loader; only the small manifest may survive requests. No nationwide records, relationship graph or search index in module caches.

Search parts retain only ranking, routing and point fields, sorted by population then ID. Two streaming passes count ranking buckets and collect only the requested 30 results; no global match array. Nearby retains six candidates while scanning point fields. Detail loads one deterministic bucket; related links use summaries, never hydrate the complete graph. Compare preserves the existing two-column UI; multi-entity memory checks exercise the repository without adding product features.

Alternatives rejected: one state blob (TX 3.75 MiB serialized entities before relationships); global compact index (about 22 MiB retained and unnecessary cross-request retention); external stores/containers (outside current authority). Hash buckets plus bounded state/search parts avoid skew and preserve postal/state anomalies. Missing/corrupt assets fail closed, never fall back to the nationwide snapshot.

## Memory attribution (local Node proxy, before changes)

Fresh processes, forced GC, same source snapshot. Retained allocations overlap and are not additive: geographies 104.25 MiB; relationships 18.22 MiB; observations extracted from geographies 86.65 MiB; sources 0.06 MiB. Full parsed snapshot delta 122.42 MiB. Derived indexes add ID map 3.52 MiB, route map 6.71 MiB, adjacency map 15.83 MiB. Existing TS repository total retained heap 155.6 MiB. JSON decoding additionally allocated a 77,721,856-byte expanded buffer and transient string. These are local measurements, not Cloudflare isolate metrics. A delete-properties probe was discarded because V8 dictionary transitions inflate object sizes.

## Global constraints

- 69,416 geographies and 99,406 canonical relationships unchanged; preserve all observations/provenance and ordering semantics.
- Runtime memory target <=96 MiB with >=32 MiB headroom; label local proxies explicitly.
- Generated file hard limit 1 MiB, search part target 512 KiB, manifest limit 256 KiB.
- Default/missing indexing configuration fails closed; no public preview prerequisite.
- Only after memory validation: OKELOM current-brand migration, vinext compatibility test, adapter/build and complete regression validation.
- Security exception not renewed or represented as a clean audit.

## Tasks and verification

1. [ ] Shard generator and asynchronous repository. Add failing behavior tests for one detail without nationwide loading, bounded search/related reads, corruption, and full canonical equivalence. Implement deterministic build artifacts and async asset loader. Run `node --import tsx --test tests/shards.test.ts`; expected all pass.
2. [ ] Migrate pages, metadata, sitemap and build-only consumers. Preserve search ordering, pagination, compare, sources and geography semantics. Run `npm test`, `npm run typecheck`, `npm run build`; expected all pass.
3. [ ] Memory evidence. Instrument cold/post/peak/retained heap plus external allocations, representative paths and repeated requests. Assert no full snapshot runtime import/cache; target <=96 MiB local proxy. Record limitations, not a claim of cloud deployment.
4. [ ] Current identity and noindex tests first, then OKELOM metadata/UI/config/current docs changes. Preserve historical documents and IDs. Test missing/false/malformed configuration and preview URLs.
5. [ ] Current official vinext compatibility before adaptation; fallback only on documented incompatibility. Validate local Worker build/runtime, then lint/types/tests/security/build/browser checks and protected preview handoff. No external side effects.
6. [ ] Fresh whole-branch review, relevant fixes and evidence-bound completion receipt. Commit and single final push/draft PR only after the applicable gates pass; never merge.

## Review focus

- Large state or high-degree geography must not hydrate all children.
- Cross-state/unassigned geographies and ZIP leading zeros keep coverage.
- Broad search and extreme page numbers must not accumulate full results.
- Missing, oversized or stale generated assets must not silently read canonical data.
- Concurrent/repeated requests, preview canonical URLs and direct asset URLs must not weaken memory, Access or noindex boundaries.

## Progress ledger

- Preflight: clean existing isolated worktree reused; Founder AGENTS.md edits remain untouched in original checkout. A failed fetch initially left the new branch on stale origin/develop; successful retry and fast-forward established the exact verified baseline before edits.
- Interfaces: generator asset schema -> loader -> repository -> async page/metadata/sitemap consumers. Build-only canonical reader stays outside runtime imports.
- Ruling: follow explicit mission continuity and canonical standard chapter 5 rather than adding repetitive plan approval; authority and side effects unchanged.
- Tasks 1–2: implementation and local regression complete, uncommitted. 19 unit/integrity tests, typecheck, lint, Next build, 30 browser tests pass. Generator: 675 files, 14 search parts, maximum 524284 bytes, manifest 130449 bytes. Canonical snapshot unchanged.
- Task 3: data-layer local proxy passes (sampled peak 35.4 MiB; retained proxy 10.28 MiB), 100 repeated queries show no retained growth. Full Worker rendering/concurrency memory acceptance remains pending.
- STOP: current security gate fails with PRODUCTION_AUDIT_NONZERO (next 16.3.6; GHSA-cjq9-62q9-8jv4 and additional advisories). Existing security regression tests pass 26/26; this does not override the failed audit. No exception/lockfile/workflow changes.
- vinext 1.1.0 static check completed with 13 supported / 0 partial / 0 issues. Adapter installation/runtime check not executed; React peer floor needs validation. Tasks 4–6 not complete. See docs/release/OKELOM_SHARDING_PROGRESS_2026-10-09.md for bounded results and next decision.
- Supplemental security authorization applied: next pinned to 16.3.8; React 19.2.4 and eslint-config-next 16.3.6 unchanged. All sharding work preserved. Fresh lint/types/19 tests/build/30 browser tests/26 security mutation tests pass; memory retained heap max 7.64 MiB, local proxy peak 35.43 MiB. Production audit is now zero vulnerabilities; installed-package signatures pass.
- Current STOP is RAW_AUDIT_DIGEST_MISMATCH, superseding the prior production-audit failure. npm regenerated six already-bundled dev/optional lock entries, changing audit metadata counts only; an in-memory diagnostic proved both old digest matches when only those counts are reversed. No audit, exception, gate or workflow was edited to bypass this. Existing contract explicitly revokes on digest drift, so evidence rebinding requires Core-directed authority. No commit/push; tasks 4–6 remain pending. Full patch receipt: docs/release/OKELOM_NEXT_PATCH_EVIDENCE_2026-10-09.md.
