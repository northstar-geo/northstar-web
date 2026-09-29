# Zipora（邮编地理智能产品）

Northstar（北极星产品）旗下的来源透明地理查询网站，由 Polaris（北极星）负责。搜索美国统计邮编区域、州、城市和县，查看人口、收入、住房、人口历史与同口径比较。

**当前是生产前候选版本，尚未公开发布。** `ZIP` 邮政投递编码与 `ZCTA` 人口普查统计区域分开建模；当前真实数据为人口普查区域，未接入邮政投递验证。完整口径见 `/methodology`。

## 本地启动

要求 Node.js（运行时）第 24 版及 npm（包管理器）。已提交约 6.4 MB 的真实公开数据快照，启动无需账号、密钥或数据库服务。

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

来源与数据许可见 `data/sources.json`；第三方软件见 `docs/THIRD_PARTY.md`。代码许可证不覆盖第三方数据、软件或商标。没有抓取竞争对手数据库。

## 发布配置与边界

默认全站禁止索引。生产目标确认并批准后，配置 `SITE_URL` 为真实 HTTPS（安全超文本传输协议）源站，且 `INDEXING_ENABLED=true`，然后重新构建。不要把这两个变量设为未获授权域名。预览保持未设置或 `INDEXING_ENABLED=false`。

支持标准服务器运行；运行目录须包含 `data/geography.json.gz`，框架文件追踪配置包含该快照。`/sitemap.xml` 为索引，`/sitemaps/0.xml` 等为每片最多 10,000 条的有价值地理页面；搜索和比较查询页不进入索引。

生产域名、托管、隐私日志保留策略、支持联系方式及合并／发布审批见 `docs/LAUNCH_CHECKLIST.md`。本项目没有开启账号、分析、广告或支付。

## 工程文档

- [当前状态](docs/PROJECT_STATE.md)
- [工程执行基线](docs/PROGRAM-NORTHSTAR-WEBSITE-LAUNCH-001.md)
- [数据模型](docs/DATABASE.md)
- [当前路线图](docs/ROADMAP.md)
- [2026-07 历史记录](docs/history/2026-07/PROJECT_STATE.md)

中央治理正文只通过 `AGENTS.md` 引用；原有冲刺与日记保留，不能作为当前已实现能力的证明。
