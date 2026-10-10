# 预发布环境契约

## 目的与边界

预发布环境用于验证与生产相同的构建产物、数据快照和运行参数。它不是公开发布环境：不得启用公开索引、不得解除访问保护，也不得把预发布地址作为正式规范网址。

`STAGING_STATUS = NOT_DEPLOYED`

## 必需配置

| 项目 | 要求 |
| --- | --- |
| `SITE_URL` | 由托管环境注入完整源站；不得写入源代码、不得使用未经批准的正式域名。 |
| `INDEXING_ENABLED` | 固定为 `false`。 |
| `RELEASE_STAGE` | 构建及运行都固定为 `preview`；缺失或其他非生产值均不开放索引。 |
| 数据 | 部署前验证 `data/geography.json.gz` 的 SHA-256 为 `2e100f671f3a84997b30627ababbfc94e049f7c2d2cf8d328c42c6006a2778c5`。 |
| 密钥 | 构建与数据读取不需要业务密钥；本次明确授权的唯一预览认证密钥为运行时 `PREVIEW_AUTH_PASSWORD`，只能由授权执行者经平台安全输入渠道设置，不写入代码、普通配置、聊天、日志或测试快照。 |
| 访问 | 使用源码 `custom-worker.ts` 的失败关闭认证包装层；固定用户名 `founder`，先认证再进入OpenNext。不得依赖robots规则代替访问控制。 |

## 部署前检查

1. 使用指定 `SITE_URL`、`RELEASE_STAGE=preview` 和 `INDEXING_ENABLED=false` 重新构建，运行时保持完全一致，不接受隐式默认来源。静态页面及框架响应头在构建时生成，不能只改运行变量后复用另一阶段产物。
2. 检查 `/robots.txt` 为全站禁止抓取，且不发布公开站点地图。
3. 检查页面规范网址、Open Graph（开放图谱）链接和站点地图（若临时启用检查）均来自同一 HTTPS（安全超文本传输协议）源站。
4. 检查 `/search`、`/compare` 保持 `noindex`，17 个无可靠州归属区域不进入候选索引集合。
5. 检查 `/404`、错误页、数据分片可读性、启动失败行为和访问保护。`assets.run_worker_first=true` 必须覆盖全部请求，包括 `/_geo/`、图标、分享图片、字体和框架静态文件；包装层统一返回 `X-Robots-Tag: noindex, nofollow, noarchive` 与禁止缓存头，不能只检查HTML。

未来生产索引必须同时满足 `RELEASE_STAGE=production`、`INDEXING_ENABLED=true`、`SITE_URL=https://okelom.com`，且先获创始人明确授权。变量满足条件只说明技术开关，不代表批准。预览页面不输出结构化数据，站点地图索引不列出公开条目。

## 云平台交接状态（2026-10-10）

`PROJECT_NAME=okelom-web`；当前交接门禁只在[持续计划](../superpowers/plans/2026-10-09-okelom-preview-readiness.md)维护。配置入口是稳定源码 `custom-worker.ts`，其认证成功后调用构建生成的 `.open-next/worker.js`，不修改生成源码。资产为 `.open-next/assets`，动态地理读取使用内部 `ASSETS` 绑定，无公开回源或全国快照回退。构建/标准Node本地运行仍使用同源派生文件。缺失绑定、错误响应、非法路径和超限流失败关闭。

官方路径及发布元数据已只读核对：[Cloudflare Next.js 指南](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)、[OpenNext 指南](https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/)。本使命明确选择已获授权的 `@opennextjs/cloudflare@1.20.9`、`wrangler@4.149.0`，保留 Next16.3.8 / React19.2.4；不选择需要改变React版本的vinext。只读静态资产缓存服务预渲染页，无ISR（增量静态再生成）、R2/D1/KV或队列资源。不得运行可能创建资源的自动迁移命令。新依赖或审计摘要漂移仍按原安全契约重新核验，不自动继承本次批准。

| 交接字段 | 当前可交付事实 / 剩余要求 |
| --- | --- |
| `INSTALL_COMMAND` | 由获授权的执行者对精确提交执行 `npm ci`；适配依赖已精确锁定。本执行器不代为创建构建服务或安装新的平台依赖。 |
| `BUILD_COMMAND` | `node node_modules/@opennextjs/cloudflare/dist/cli/index.js build`；内部执行现有build及prebuild分片生成。先注入同一预览源站及两个禁止索引变量。 |
| `NODE_VERSION / PACKAGE_MANAGER` | 本地使用 Node 24 / npm；最终执行环境须固定实际版本及锁文件。 |
| `DEPLOYMENT_MODE / OUTPUT_MODE` | OpenNext服务端渲染+只读静态缓存；入口 `custom-worker.ts`，资产 `.open-next/assets`。须走OpenNext的预览/上传生命周期填充静态预渲染缓存，不直接上传未准备完成的裸构建。不是纯静态导出；本地通过不等于云端验收。 |
| `ENVIRONMENT_VARIABLES` | 上表三个变量在构建/运行一致；`PREVIEW_AUTH_REQUIRED=true`。认证密码只在运行时密钥绑定中设置，绝不设置 `NEXT_PUBLIC_*` 密码或构建密码。保留 `nodejs_compat_do_not_populate_process_env`，禁止平台自动把密钥复制到全局环境；包装层也从下游请求头及环境副本移除密码，OpenNext仅接收脱敏后变量。 |
| `CLOUDFLARE_ACCESS_REQUIREMENT` | 本轮不启用Zero Trust；等效保护由全请求Worker认证提供。缺密码503、缺/错凭据401，认证后仍禁止缓存/索引。任何阶段或标志都不能关闭该包装层认证。 |
| `NOINDEX_VERIFICATION_METHOD` | 受保护会话检查响应头、robots元数据、robots.txt、空站点地图、无结构化数据。 |
| `EXPECTED_PREVIEW_BEHAVIOR` | 已认证可执行搜索、详情、比较；未认证拒绝；不被索引；无全国数据常驻。 |
| `CUSTOM_DOMAIN_BINDING_SEQUENCE` | 先预览验收、再正式域名授权、再由授权者绑定根域及www、证书生效后核验跳转；本轮不执行。 |
| `EXPECTED_DNS_RECORDS` | 待平台给出实际绑定目标后记录精确类型/值；不猜测IP或CNAME，不创建记录。 |
| `WWW_REDIRECT_METHOD` | 由授权平台规则将www的HTTPS入口单跳永久转至根域，保留路径及查询；规则尚未创建。 |
| `SSL_EXPECTATION` | 有效证书覆盖根域/www，HTTP单跳到最终HTTPS，TLS验证成功；当前未绑定或核验。 |

本契约不授权创建托管账户、部署、域名或 DNS（域名系统）变更。

本次适配不等于预览就绪验收：本地完整渲染压力采样仍超过既定96 MiB目标，详见[验证证据](evidence/2026-10-10-local-worker/VALIDATION.json)。下一步若需真实运行时诊断，须核心对话明确授权专属工作建立受保护、禁止索引的诊断预览；该决定不豁免本地失败、不授权付费或公开流量，也不把诊断部署当成容量通过。缺少授权时，本执行器不能自行创建账户、项目或上传产物。实际预览必须以固定提交重新构建并回传环境与部署证据。

## 本地验证与真实预览的分界

仓库 `wrangler.jsonc` 是失败关闭的本地验证配置：地址为 `http://localhost:43177`，`workers_dev=false`、`preview_urls=false`、遥测及运行观测上传关闭，无账户编号、凭据、远程绑定或部署脚本。它不是已经授权的公开预览配置。核心对话先评审精确候选，再授权专属工作建立唯一项目及访问保护；执行者必须提供获准的真实HTTPS源站，并在构建和运行一致替换本地来源，重新构建，不能复用含localhost规范网址的资产。任何开放预览路由的配置变化仍须独立授权。

仅本地验证命令（已有依赖，无安装、上传或部署）：

```powershell
node scripts/validate-preview.mjs build
node scripts/validate-preview.mjs auth
node scripts/validate-preview.mjs worker-browser
node scripts/validate-preview.mjs browser
```

运行器拒绝存在私人环境文件的检出，过滤继承环境、禁止遥测和Wrangler磁盘日志，使用现有依赖。两个Worker测试先运行官方 `populateCache local`，与官方预览生命周期一致；只填充本地已有只读缓存，不创建存储服务。浏览器测试密码由运行器临时随机生成，仅在内存/子进程环境中使用，认证运行关闭可能记录请求头的跟踪；不要手动传入真实密码。所有本地测试使用回环HTTP，真实预览必须仅通过HTTPS传输Basic凭据。

浏览器运行器会独立启动并关闭回环Worker，不复用未知服务器；标准Node与Worker的报告分别保存于 `test-results/results.json`、`test-results/worker-results.json`。两者相同核心断言，不以超时放宽或跳过取得通过。OpenNext官方仍提示Windows兼容性限制；精确云端构建环境必须另行验证。

平台资产绕过Next响应头，因此 `public/_headers` 单独强制 `noindex, nofollow` 等安全头。真实访问保护还须覆盖直接 `/_geo/`、框架JS/CSS、图标/分享图及错误路径；禁止索引不等于访问保护。预览撤回/回滚须绑定实际部署标识与同一候选产物，不使用旧PR合并作为当前回滚目标。

## 无银行卡诊断预览交接边界

创始人2026-10-10直接授权的替代架构：[OpenNext自定义入口](https://opennext.js.org/cloudflare/howtos/custom-worker)与[所有资产先运行Worker](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/)。不启用Zero Trust，不提交银行卡或账单身份，不接受超额收费，不增加付费组件。平台是否允许该账户在此边界内创建免费项目仍须授权执行者实际核验；出现付款/账单/付费授权要求立即停止，不绕过、不代同意。

只有本地认证交接通过后，核心对话才能安排现有专属工作恢复 `MISSION-OKELOM-PROTECTED-DIAGNOSTIC-PREVIEW-001`，建立唯一 `okelom-web` 诊断预览。上传前固定精确提交、真实HTTPS源站和预览变量；上传后先证明缺密钥为503，再由授权执行者设置随机高熵密码（至少32字节随机值的ASCII编码），更新预览并验证未认证401、认证200、全部直达资产保护、HTTPS与禁止索引。密码不通过聊天/回执传递；撤回时关闭路由或删除绑定后验证拒绝，按实际部署记录恢复方式。

当前认证是单一共享密码的短期诊断门禁，不是正式用户账户体系；没有新增远端限流服务，也不承诺抗拒绝服务或配额安全。每个静态请求先执行认证且禁缓存，会增加计算开销；不得为性能开放资产旁路。真实容量、免费配额、平台日志脱敏、保留/访问策略及撤回演练仍需验收。认证代码就绪不解除96 MiB内存失败，不授权生产、公开发布、索引、域名或账户写入。本执行器只交回核心对话，不代替专属工作部署。
