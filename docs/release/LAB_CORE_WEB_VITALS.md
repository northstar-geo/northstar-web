# 实验室核心网页指标基线

执行 `npm run release:web-vitals` 会在本地生产服务器上以现有 Edge（微软浏览器）采集首页、搜索、ZCTA、州和比较页的 LCP（最大内容绘制）、CLS（累积布局偏移）与 TTFB（首字节时间）。脚本把交互延迟标为 `NOT_AVAILABLE_NO_REAL_USER_INTERACTION`，结果写入 `test-results/release-web-vitals.json`。

`FIELD_CORE_WEB_VITALS = NOT_AVAILABLE_PRE_LAUNCH`

在 2026-10-03 的一次本地 Edge（微软浏览器）实验中，代表路线均为 HTTP（超文本传输协议）200，LCP（最大内容绘制）范围为 96–464ms，CLS（累积布局偏移）为 0，TTFB（首字节时间）范围为 12–100ms。该样本用于回归比较，不是现场服务等级承诺。

这些值适用于本地回归比较，不能作为真实用户、移动设备、全球网络或选定托管平台的承诺。正式发布前，应在获授权的真实托管环境确认页面响应，并在公开发布后以经批准的隐私与日志方案收集现场指标。
