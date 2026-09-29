# 产品工程工作流

中央治理入口见 `../AGENTS.md`；产品工作包见 [执行基线](PROGRAM-NORTHSTAR-WEBSITE-LAUNCH-001.md)。本文件只维护本仓库的工程步骤。

使用 Node.js（运行时）第 24 版与 npm（包管理器）锁文件安装依赖。先运行 `npm ci`，使用 `npm run dev` 本地开发。生产验证：`npm run validate`；浏览器验证：`npm run test:e2e`；数据库验证：`npm run data:database`。

数据更新：`npm run data:fetch` → `npm run data:import` → `npm test` → 检查 `data/import-receipt.json` → 本地构建／页面验证 → 提交新快照。导入失败不得发布部分数据。回滚使用上一已审查快照和对应回执，不直接删除数据库。

持续集成只提供手动工作流；避免每个中间提交触发远端分钟消耗。默认本地验证后批量推送审查分支，不自动合并、部署或改变公开索引。

原工作流：[历史记录](history/2026-07/WORKFLOW.md)。
