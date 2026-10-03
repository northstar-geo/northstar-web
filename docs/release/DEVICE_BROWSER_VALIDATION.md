# 设备与浏览器验证边界

## 自动化矩阵

| 矩阵 | 覆盖 | 当前结果 |
| --- | --- | --- |
| Chromium（Edge）桌面 | 首页、搜索、ZCTA、州、城市、县、比较、方法、数据来源、关于、404（未找到）、主题、键盘与自动可访问性 | 已在工程验收中通过。 |
| Chromium（Edge）移动视口 | 与桌面相同的代表性路线及自动可访问性 | 已在工程验收中通过；这是模拟视口，不是实机。 |
| Firefox（火狐浏览器）桌面 | 与上述相同的 `site.spec.ts` 矩阵 | `NOT_RUN_BROWSER_BINARY_UNAVAILABLE`。 |
| Safari / iOS（苹果浏览器 / iOS） | 未运行 | `NOT_RUN_REAL_DEVICE_UNAVAILABLE`。 |

Firefox（火狐浏览器）项目已在 Playwright（浏览器测试框架）配置中定义，但只有设置 `PLAYWRIGHT_FIREFOX=true` 时执行。这避免在未安装浏览器二进制文件的环境中把基础验证变成伪失败。

PowerShell（命令行环境）中的授权验证命令：

```powershell
$env:PLAYWRIGHT_FIREFOX='true'
node node_modules/playwright/cli.js test --project=firefox
```

## 发布结论

`DEVICE_BROWSER_RESULT = CHROMIUM_EMULATED_PASS; FIREFOX_PENDING; SAFARI_IOS_PENDING; REAL_MOBILE_PENDING`

不得将浏览器模拟视口称为真实手机、真实 Safari（苹果浏览器）或跨设备验收。Firefox（火狐浏览器）、Safari（苹果浏览器）及真实设备检查是生产公开发布前的剩余验证项。
