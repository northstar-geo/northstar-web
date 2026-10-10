# OKELOM（地理智能产品）

来源透明的地理查询网站，由 Polaris（北极星）负责。搜索美国统计邮编区域、州、城市和县，查看人口、收入、住房、人口历史与同口径比较。历史项目、使命、仓库和安全证据标识保持原值。

**当前是发布准备中的生产前候选版本，尚未公开发布。** PR #1、#3 的历史验证不代表本次 OKELOM 改动已经远端验收；当前门禁以[持续计划](docs/superpowers/plans/2026-10-09-okelom-preview-readiness.md)为准。`ZIP` 邮政投递编码与 `ZCTA` 人口普查统计区域分开建模；当前真实数据为人口普查区域，未接入邮政投递验证。完整口径见 `/methodology`。

## 本地启动

要求 Node.js（运行时）第 24 版及 npm（包管理器）。已提交约 6.4 MB 的真实公开数据快照，本地标准服务器无需账号、密钥或数据库服务。受保护Worker诊断预览另有失败关闭认证：运行时缺少 `PREVIEW_AUTH_PASSWORD` 时返回503，不能公开访问；本地测试由运行器临时生成测试凭据，不使用真实密钥。

```sh
npm ci
npm run dev
```

访问 `http://localhost:3000`。生产模式本地预览：

```sh
npm run build
npm start
```

## 验证

```sh
npm run validate
npm run test:e2e
npm run data:database
npm audit
```

浏览器测试默认使用已安装的 Microsoft Edge（微软浏览器），包含桌面、移动视口及可访问性检查。若无该浏览器，在已授权环境安装测试浏览器或调整 `playwright.config.ts`。本地数据库使用运行时内置 SQLite（嵌入式数据库），属于可重建查询适配。

## 数据更新

```sh
npm run data:fetch
npm run data:import
npm test
npm run data:database
```

下载器仅访问明确列出的美国人口普查局公开批量文件，缓存至 `data/raw/`；约 130 MB。Windows（视窗系统）使用系统下载客户端，其他系统使用原生网络接口。文件哈希、下载时间、实体计数及已知连接缺口记录于 `data/import-receipt.json`。相同输入重导入产生相同快照；原始缓存不提交。

年度更新须明确修改下载清单；缓存命中不会检测官方同名文件修订。修订导入前归档相应缓存及回执，再下载并执行完整验证。网站本身运行不依赖原始下载接口。

来源与数据许可见 `data/sources.json`；第三方软件见 `docs/THIRD_PARTY.md`。代码许可证不覆盖第三方数据、软件或商标。没有抓取竞争对手数据库。

## 发布配置与边界

默认全站禁止索引和跟随链接。预览固定 `RELEASE_STAGE=preview`、`INDEXING_ENABLED=false`；`SITE_URL` 使用获授权的真实预览源站。只有未来取得创始人正式索引授权后，才可同时配置 `RELEASE_STAGE=production`、`SITE_URL=https://okelom.com`、`INDEXING_ENABLED=true` 并重新构建。任何条件缺失、异常或非正式域名均不开放索引；此说明不授权部署、域名操作或索引启用。

当前支持本地标准服务器及Cloudflare Worker（云平台运行隔离区）验证；构建前从 `data/geography.json.gz` 生成 `public/_geo/`，运行时仅读取这些分片，不加载完整快照。派生资产不提交，适配构建必须运行数据生成步骤并随产物携带完整资产集。Worker通过内部ASSETS绑定读取，不从公开网址绕过访问保护。适配命令、只读缓存、输出目录及本地/真实预览分界见下方环境契约；实际云端部署尚未执行。`/sitemap.xml` 为索引，`/sitemaps/0.xml` 等为每片最多 10,000 条的有价值地理页面；搜索和比较查询页不进入索引。

生产域名、托管、隐私日志保留策略、支持联系方式及发布审批见 `docs/LAUNCH_CHECKLIST.md`。本项目没有开启账号、分析、广告或支付。

预发布环境必须遵守[预发布环境契约](docs/release/STAGING_ENVIRONMENT_CONTRACT.md)和[预发布验证清单](docs/release/STAGING_VALIDATION_CHECKLIST.md)：由环境注入站点来源、默认禁止索引并保持访问保护。当前没有已部署的预发布环境。

## 工程文档

- [当前状态](docs/PROJECT_STATE.md)
- [生产前工程证据](docs/LAUNCH_EVIDENCE.md)
- [工程执行基线](docs/PROGRAM-NORTHSTAR-WEBSITE-LAUNCH-001.md)
- [数据模型](docs/DATABASE.md)
- [当前路线图](docs/ROADMAP.md)
- [2026-07 历史记录](docs/history/2026-07/PROJECT_STATE.md)

中央治理正文只通过 `AGENTS.md` 引用；原有冲刺与日记保留，不能作为当前已实现能力的证明。
