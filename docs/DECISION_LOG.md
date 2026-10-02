# NorthStar Decision Log

## 2026-09-29：当前网站重新基线

绑定项目：`PROGRAM-NORTHSTAR-WEBSITE-LAUNCH-001`。下方 2026-07 决策保留为历史，不自动构成当前实现授权。

本次选择：搜索优先、来源透明、首版聚焦网站；使用现有框架原生能力与公开人口普查批量数据，独立地理查询模块支持未来适配。源接口已实测要求密钥，采用官方批量文件替代，不申请新密钥。许可与数据依据见 `data/sources.json`。

复用评估：现有页面组件继续演化；搜索优先、相关区域、背景比较与来源年份来自工作包所列竞争模式，未复制竞争对手素材或数据库。外部数据库／商业地址服务会增加账号、费用与授权边界，首版采用可复现快照与本地数据库。没有新增公司执行基础设施。

地图评估：MapLibre（开放地图渲染器）适合未来瓦片和多边形；首版仅有代表点，使用原生矢量定位图，不制造假边界或绑定商业瓦片。第三方服务候选只研究，不接入。

风险与回退：2020 关系连接 2025 实体存在缺口，明确记录；邮政目录未接入，前台不声明投递验证；快照可恢复到审查过的上一版本。源文件与数据许可证与代码许可证分开。

依赖安全：初始第 16.2.9 版框架存在审计公告；在第 16 主版本内升级至第 16.3.6 版并修复兼容传递依赖。本次审计零已知漏洞，不等于无限期安全证明。

This document records important architectural, technical, product, and business decisions made throughout the NorthStar project.

Unlike the daily Journal, this file only records decisions that have long-term impact.

---

# Decision Record Format

Each decision should include:

- Date
- Category
- Decision
- Reason
- Alternatives Considered
- Expected Long-term Impact

---

# Decision 001

**Date**

2026-07-02

**Category**

Project Strategy

**Decision**

NorthStar will be developed as a technology platform rather than a single website.

**Reason**

A platform allows multiple products to share infrastructure, engineering standards, APIs, and business capabilities.

This approach improves scalability, maintainability, and long-term business value.

**Alternatives Considered**

Build only Zipora as an isolated website.

**Why Rejected**

A standalone website limits future expansion and increases duplicated work.

**Long-term Impact**

Future products can reuse the same backend, authentication, APIs, deployment pipeline, and engineering standards.

---

# Decision 002

**Date**

2026-07-02

**Category**

Architecture

**Decision**

Adopt an API-first architecture.

**Reason**

Business logic should not belong exclusively to the website.

All major features should eventually become reusable APIs.

**Alternatives Considered**

Traditional server-rendered architecture.

**Why Rejected**

Difficult to support mobile applications and third-party integrations.

**Long-term Impact**

Supports Web, Mobile, AI, Enterprise, and Developer Platform.

---

# Decision 003

**Date**

2026-07-02

**Category**

Technology

**Decision**

Choose Next.js as the frontend framework.

**Reason**

Excellent SEO, React ecosystem, scalability, and strong support from Vercel.

**Alternatives Considered**

Vue

Nuxt

Svelte

Angular

**Long-term Impact**

Strong ecosystem and long-term maintainability.

---

# Decision 004

**Date**

2026-07-02

**Category**

Business

**Decision**

The platform should generate multiple revenue streams.

**Reason**

A sustainable business should not rely on a single source of income.

Revenue examples:

- Advertising
- Membership
- API
- Enterprise
- Affiliate
- AI
- Data

**Long-term Impact**

Improves resilience and business valuation.

---

# Decision 005

**Date**

2026-07-02

**Category**

Crypto

**Decision**

Cryptocurrency will be treated as infrastructure instead of the core business.

**Reason**

The platform must remain valuable even if crypto features are disabled.

Crypto should expand payment methods rather than define the product.

Possible integrations include:

- Bitcoin
- Ethereum
- Solana
- Stablecoins

**Long-term Impact**

Supports global users without changing the core product strategy.

---

# Decision 006

**Date**

2026-07-02

**Category**

Engineering

**Decision**

Documentation is considered a first-class project asset.

**Reason**

Future maintainability depends on documentation as much as source code.

Every important feature should include documentation.

**Long-term Impact**

Lower onboarding cost.

Higher engineering quality.

Better acquisition readiness.

---

# Future Decisions

Every major decision should be added here instead of being lost in chat history.
