# Lessons Learned

This document records important lessons learned throughout the development of NorthStar.

The purpose is to avoid repeating mistakes and continuously improve the engineering process.

---

# 2026

## Development Environment

### Lesson 001

PowerShell execution policy may prevent npm or npx from running.

Use Command Prompt when appropriate or adjust the execution policy if PowerShell is required.

---

### Lesson 002

GitHub Desktop may succeed in cloning repositories even when Git CLI encounters HTTPS connection issues.

Always verify the local repository before troubleshooting further.

---

### Lesson 003

Always verify the current working directory before executing commands.

Many installation problems originate from running commands in the wrong folder.

---

### Lesson 004

Create the project foundation before implementing business features.

A strong engineering foundation significantly reduces future maintenance costs.

---

### Lesson 005

Documentation should be created before large-scale development begins.

Well-organized documentation improves AI collaboration and long-term maintainability.

---

### Lesson 006

Every important discussion should eventually become documentation.

Chat history is temporary.

Repository documentation is permanent.

---

### Lesson 007

Git commits should represent meaningful milestones rather than random file changes.

Good commit history improves project readability.

---

### Lesson 008

Development should always begin from the develop branch.

The main branch should remain stable and production-ready.

---

### Lesson 009

Project governance is an engineering asset.

Vision, Roadmap, Principles, Workflow, and Decision Logs are as important as source code.

---

### Lesson 010

Think in systems rather than individual features.

Reusable architecture creates significantly more long-term value than isolated functionality.

---

# Future Lessons

Every significant problem solved during development should be recorded here.

The same mistake should never need to be solved twice.