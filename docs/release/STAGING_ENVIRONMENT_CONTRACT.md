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

## 云平台交接状态（2026-10-09）

`PROJECT_NAME=okelom-web`；`DEPLOYMENT_HANDOFF_READY=NO`。当前 Node.js（运行时）构建成功不等于云平台运行时通过。当前 Node 文件读取适配层仍需改为内部资产绑定，不能通过公开回源绕过访问保护。

官方路径及发布元数据已只读核对：[Cloudflare Next.js 指南](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)、[OpenNext 指南](https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/)。注册表发布包 `vinext@1.1.0` 要求 `react/react-dom ^19.2.6`、`vite ^8.0.0`，与当前 `19.2.4` 不满足；`@opennextjs/cloudflare@1.20.9` 的 Next 要求 `>=15.5.27 <16 || >=16.3.8` 包含当前版本，同时需要 `wrangler ^4.125.0`。这只是候选兼容性，不是安装、选型完成或部署验证。增加任何适配依赖都会改变当前安全证据；新审计须有数据传输授权，证据漂移须按原契约处理。

| 交接字段 | 当前可交付事实 / 剩余要求 |
| --- | --- |
| `INSTALL_COMMAND` | 当前锁文件为 `npm ci`；适配依赖未锁定，不可作为最终云端安装指令。 |
| `BUILD_COMMAND` | 当前为 `npm run build`（含生成分片）；云平台构建命令未验证。 |
| `NODE_VERSION / PACKAGE_MANAGER` | 本地使用 Node 24 / npm；最终执行环境须固定实际版本及锁文件。 |
| `DEPLOYMENT_MODE / OUTPUT_MODE` | 服务端渲染及静态资产；不是纯静态导出。Worker 入口和产物未生成，不提供虚假输出目录。 |
| `ENVIRONMENT_VARIABLES` | 上表三个变量在构建/运行一致；不需要应用业务密钥。 |
| `CLOUDFLARE_ACCESS_REQUIREMENT` | 核心对话授权专属工作后建立保护；未登录直达页面及资产均不得获取内容。 |
| `NOINDEX_VERIFICATION_METHOD` | 受保护会话检查响应头、robots元数据、robots.txt、空站点地图、无结构化数据。 |
| `EXPECTED_PREVIEW_BEHAVIOR` | 已认证可执行搜索、详情、比较；未认证拒绝；不被索引；无全国数据常驻。 |
| `CUSTOM_DOMAIN_BINDING_SEQUENCE` | 先预览验收、再正式域名授权、再由授权者绑定根域及www、证书生效后核验跳转；本轮不执行。 |
| `EXPECTED_DNS_RECORDS` | 待平台给出实际绑定目标后记录精确类型/值；不猜测IP或CNAME，不创建记录。 |
| `WWW_REDIRECT_METHOD` | 由授权平台规则将www的HTTPS入口单跳永久转至根域，保留路径及查询；规则尚未创建。 |
| `SSL_EXPECTATION` | 有效证书覆盖根域/www，HTTP单跳到最终HTTPS，TLS验证成功；当前未绑定或核验。 |

本契约不授权创建托管账户、部署、域名或 DNS（域名系统）变更。
