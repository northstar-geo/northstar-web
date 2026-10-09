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
| 密钥 | 本项目构建与数据读取不需要密钥；不得因预发布而新增或记录密钥。 |
| 访问 | 必须采用托管平台的访问保护、网络限制或等效控制；不得依赖 robots 规则代替访问控制。 |

## 部署前检查

1. 使用指定 `SITE_URL`、`RELEASE_STAGE=preview` 和 `INDEXING_ENABLED=false` 重新构建，运行时保持完全一致，不接受隐式默认来源。静态页面及框架响应头在构建时生成，不能只改运行变量后复用另一阶段产物。
2. 检查 `/robots.txt` 为全站禁止抓取，且不发布公开站点地图。
3. 检查页面规范网址、Open Graph（开放图谱）链接和站点地图（若临时启用检查）均来自同一 HTTPS（安全超文本传输协议）源站。
4. 检查 `/search`、`/compare` 保持 `noindex`，17 个无可靠州归属区域不进入候选索引集合。
5. 检查 `/404`、错误页、数据分片可读性、启动失败行为和访问保护。直接访问 `/_geo/`、图标、分享图片和框架静态文件也必须受访问保护，并返回 `X-Robots-Tag: noindex, nofollow`；应用响应头不能替代平台静态资产规则。

未来生产索引必须同时满足 `RELEASE_STAGE=production`、`INDEXING_ENABLED=true`、`SITE_URL=https://okelom.com`，且先获创始人明确授权。变量满足条件只说明技术开关，不代表批准。预览页面不输出结构化数据，站点地图索引不列出公开条目。

## 云平台交接状态（2026-10-10）

`PROJECT_NAME=okelom-web`；当前交接门禁只在[持续计划](../superpowers/plans/2026-10-09-okelom-preview-readiness.md)维护。本地适配已生成入口 `.open-next/worker.js` 和资产 `.open-next/assets`，动态地理读取使用内部 `ASSETS` 绑定，无公开回源或全国快照回退。构建/标准Node本地运行仍使用同源派生文件。缺失绑定、错误响应、非法路径和超限流失败关闭。

官方路径及发布元数据已只读核对：[Cloudflare Next.js 指南](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)、[OpenNext 指南](https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/)。本使命明确选择已获授权的 `@opennextjs/cloudflare@1.20.9`、`wrangler@4.149.0`，保留 Next16.3.8 / React19.2.4；不选择需要改变React版本的vinext。只读静态资产缓存服务预渲染页，无ISR（增量静态再生成）、R2/D1/KV或队列资源。不得运行可能创建资源的自动迁移命令。新依赖或审计摘要漂移仍按原安全契约重新核验，不自动继承本次批准。

| 交接字段 | 当前可交付事实 / 剩余要求 |
| --- | --- |
| `INSTALL_COMMAND` | 由获授权的执行者对精确提交执行 `npm ci`；适配依赖已精确锁定。本执行器不代为创建构建服务或安装新的平台依赖。 |
| `BUILD_COMMAND` | `node node_modules/@opennextjs/cloudflare/dist/cli/index.js build`；内部执行现有build及prebuild分片生成。先注入同一预览源站及两个禁止索引变量。 |
| `NODE_VERSION / PACKAGE_MANAGER` | 本地使用 Node 24 / npm；最终执行环境须固定实际版本及锁文件。 |
| `DEPLOYMENT_MODE / OUTPUT_MODE` | OpenNext服务端渲染+只读静态缓存；入口 `.open-next/worker.js`，资产 `.open-next/assets`。不是纯静态导出。本地构建通过不代表云端部署验收。 |
| `ENVIRONMENT_VARIABLES` | 上表三个变量在构建/运行一致；不需要应用业务密钥。 |
| `CLOUDFLARE_ACCESS_REQUIREMENT` | 核心对话授权专属工作后建立保护；未登录直达页面及资产均不得获取内容。 |
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
$env:NEXT_TELEMETRY_DISABLED = '1'
$env:WRANGLER_SEND_METRICS = 'false'
$env:CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV = 'false'
$env:RELEASE_STAGE = 'preview'
$env:INDEXING_ENABLED = 'false'
$env:SITE_URL = 'http://localhost:43177'
node node_modules/@opennextjs/cloudflare/dist/cli/index.js build
$env:PLAYWRIGHT_RUNTIME = 'worker'
npm run test:e2e
Remove-Item Env:PLAYWRIGHT_RUNTIME
```

浏览器运行器会独立启动并关闭回环Worker，不复用未知服务器；标准Node与Worker的报告分别保存于 `test-results/results.json`、`test-results/worker-results.json`。两者相同核心断言，不以超时放宽或跳过取得通过。OpenNext官方仍提示Windows兼容性限制；精确云端构建环境必须另行验证。

平台资产绕过Next响应头，因此 `public/_headers` 单独强制 `noindex, nofollow` 等安全头。真实访问保护还须覆盖直接 `/_geo/`、框架JS/CSS、图标/分享图及错误路径；禁止索引不等于访问保护。预览撤回/回滚须绑定实际部署标识与同一候选产物，不使用旧PR合并作为当前回滚目标。
