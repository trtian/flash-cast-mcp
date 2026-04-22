# Flash Cast MCP

### AI 的视频渲染引擎 · 你出想法，我出成品

> *The deterministic rendering backend for AI-generated video.*
> *当 AI 会写 HTML，它就能做视频。*

<p align="center">
  <a href="https://www.npmjs.com/package/flash-cast-mcp"><img alt="npm" src="https://img.shields.io/npm/v/flash-cast-mcp?color=%237c5cff&label=npm"></a>
  <a href="#license"><img alt="license" src="https://img.shields.io/badge/License-MIT-brightgreen.svg"></a>
  <img alt="node" src="https://img.shields.io/badge/node-%E2%89%A518-339933">
  <img alt="MCP" src="https://img.shields.io/badge/MCP-1.17+-blueviolet">
</p>

---

## 这是什么

Flash Cast MCP 不是一个视频剪辑工具，也不是又一个"AI 一键生视频"。

它是你（AI Agent）专属的**渲染引擎**：

- 你负责 **想**——一个概念、一段洞察、一本书的摘要、一条新闻的解读；
- 它负责 **像素级把它呈现在视频里**——画面、动画、配音、声画同步、成片、分发链接，全部交付。

在 2026 年生成式视频满天飞的今天，真正稀缺的不是"能拍出什么"，而是：

> **同一个想法，每次渲染都完全一样。可复现、可迭代、可嵌进任何 AI 工作流。**

这就是 Flash Cast 给 AI 留的位置。

---

## 它解决什么问题

当你让一个 AI Agent "把这条新闻做成短视频"时，它过去只有三条路：

1. **调用生成式视频模型**（Veo / Kling / 即梦 / Runway…）—— 擅长氛围，讲不清结构化知识，同一个 prompt 每次结果不同，改第 3 秒的一个字都要重抽卡；
2. **调用数字人口播工具**（HeyGen / Synthesia…）—— 一张脸 + TTS，模板感一眼识别；
3. **教人怎么用剪映**—— AI 退化成教程作者。

Flash Cast 给了第四条：

| | 生成式视频模型 | AI 数字人 | 剪映 / CapCut | **Flash Cast MCP** |
|---|---|---|---|---|
| AI 的角色 | 写 prompt | 选模板 | 当助手 | **作者 + 导演** |
| 输出是否确定 | ❌ 每次不同 | ✅ 但模板僵 | ✅ 但人主导 | ✅ **同输入同输出** |
| 控制粒度 | prompt 级 | 模板级 | 帧级（手工） | **CSS 级可编程** |
| 迭代一个细节 | 重抽卡 | 只能重录 | 手工调整 | **改一行 CSS** |
| 结构化知识表达 | ❌ 画不出公式 | ⚠️ 只靠字幕 | ⚠️ 需要素材 | ✅ **任意图示 / 动画** |
| AI 调用接口 | API / GUI | API / GUI | GUI | **MCP 原生** |

**一句话**：其他工具是"AI 辅助的视频生产"，Flash Cast 是"视频生产的 AI 化"。

---

## 为什么是 HTML

HTML 在这里不是产品主体，而是**协议**——AI 和渲染引擎之间的传输层。它被选中的原因非常硬核：

1. **所有大模型都在海量 HTML 上训练过**——让 AI 写一页幻灯片，比让它写一段 Sora prompt 容易 10 倍；
2. **CSS 已经把"动画 / 布局 / 响应式 / 视觉"解决完了**——引擎不用再发明一套 DSL；
3. **幂等 + 可 diff**——用户说"第 3 页红色改成蓝色"，AI 只需改 `--primary` 变量，像素级重现；
4. **本地可预览 / 零依赖**——AI 写完可以直接浏览器打开核对，不用先渲染一遍才看得见。

就像 LaTeX 是"公式的协议"、SVG 是"矢量图的协议"，Flash Cast 把 HTML 定为**"可动态视频的协议"**。

---

## 🎬 能做成什么样

### Demo 1 · 科普短片

<p align="center">
  <video src="examples/demo-planet-gravity.mp4" controls width="720"></video>
</p>

> 《引力弯出轨道 · 星球为何在旋转里被捕获》 · 5 页深空视觉 · 源码：[`examples/planet-gravity.html`](examples/planet-gravity.html)

### Demo 2 · 小学数学动画课

纯 CSS、零 JS、零依赖的 7 页《分数的秘密 · 1/2 到底是多大？》——三年级经典知识点，用蛋糕 / 披萨 / 切饼动画把抽象的分数讲清楚：

- 🍰 开场故事：姐弟俩分蛋糕，用 emoji + 切刀动画引入；
- 🔢 分子 / 分母：圆饼动态切 4 份涂 1 份，配分数符号从下往上拼入；
- 🧩 对比演示：2 / 3 / 4 / 8 份并排切给你看，直观呈现"分得越多，每份越小"；
- ❌ 反例警告：不等分的圆饼 + 红色"X"弹入，强调"平均分"前提；
- 📏 比大小：3/8 vs 5/8 圆饼 + 同步条形图双路呈现；
- 🕐 生活场景：时钟、披萨、巧克力、零花钱，分数就在身边。

> 源码：[`examples/math-fractions.html`](examples/math-fractions.html) · 浅色暖调，家长 / 老师 / 自学儿童都能看懂。

在 Cursor 里对 AI 说一句「用 flash-cast 把 `examples/math-fractions.html` 做成视频，温柔女声、儿童语气、每页停 10 秒」，就能得到同款成片。

---

## 典型场景

不再是"上传 HTML"，而是 **你（AI）要表达什么**：

| 场景 | AI 做的事 | 产出 |
|---|---|---|
| 📚 **知识科普** | 把一个概念写成 5 页带动画的讲解 | 适合 B 站 / YouTube 的横屏短片 |
| 🎓 **AI 小课堂** | 把一份技术笔记切成 7 页课程 | 技术社区 / 公众号配套视频 |
| 📰 **新闻速览** | 把一条新闻拆成导语 + 3 个要点 + 观点 | 抖音 / 小红书竖屏口播 |
| 📖 **读书笔记** | 把一本书金句 + 观点做成情绪化分享 | 小红书 / 朋友圈传播素材 |
| 🧠 **行业洞察** | 把一份分析做成可视化图表 + 结论 | LinkedIn / 知识星球 |
| 💼 **产品介绍** | 把 Changelog 做成发布视频 | 官网 / Twitter / 微信 |

**共同点：输入是"想法"，输出是"可直接分发的视频资产"**。中间全部交给 AI + Flash Cast。

---

## ⚡ 30 秒接入

### Cursor

在 `~/.cursor/mcp.json` 里加一段：

```json
{
  "mcpServers": {
    "flash-cast": {
      "command": "npx",
      "args": ["-y", "flash-cast-mcp"]
    }
  }
}
```

重启 Cursor → 对 AI 说「用 flash-cast 登录」→ 本机浏览器弹出 `http://127.0.0.1:18888/auth` → 手机号 + 验证码 → 回到对话继续。

### Claude Code

```bash
claude mcp add flash-cast -- npx -y flash-cast-mcp
```

### 任意 MCP 客户端

```bash
npx -y flash-cast-mcp
```

装完之后，**你不需要再学任何东西**——对 AI 直接描述你想要的视频即可，它会自己调用 12 个工具走完整条管线。

---

## 🧰 MCP 工具清单（AI 视角）

| 工具 | 一句话描述 | 耗算力 |
|---|---|---|
| `authenticate` | 校验 Key / 本机登录并自动写入 | — |
| `list_templates` | （可选）官方 HTML 模板库 | — |
| `get_template_detail` | 查看某个模板的设计规范 | — |
| `create_project` | 新建一个视频项目 | — |
| `upload_html` | 上传 HTML（AI 自己写的），返回分页摘要 | — |
| `list_voices` | 枚举可用 TTS 音色 + 标签 | — |
| `configure_voice_and_script` | 设置配音 + 口播文案 + **pageMarks 声画同步** | — |
| `get_render_preview` | 渲染前只读预览（强制人工确认） | — |
| `render_video` | 触发 TTS + 浏览器级录屏（约 2–10 min） | ✅ |
| `get_render_status` | 查进度 / 拿下载链接 | — |
| `analyze_douyin_video` | 抖音爆款拆解（ASR + 结构分析） | ✅ |

> 「耗算力」= 后端消耗 TTS / 渲染 / ASR / LLM 资源，非会员每账户 1 次免费完整试用。

## 🔄 典型工作流

```
authenticate
  ↓
create_project
  ↓
upload_html               ← AI 把它刚写的 HTML 上传
  ↓
list_voices               ← AI 按内容调性自动挑音色
  ↓
configure_voice_and_script ← ⚠️ AI 自行切分 page_marks（声画同步）
  ↓
get_render_preview         ← ⚠️ 用户浏览器核对，必须确认
  ↓
render_video (user_confirmed_content: true)
  ↓
get_render_status          ← 轮询到 COMPLETED → 下载链接
```

两条关键护栏：

- **AI 自主分页**：多页 HTML 的 `page_marks`（口播字符区间 → 页）由对话中的 AI 自己决定断点，不是服务端黑盒。优先在标点后切换；
- **渲染前强制预览**：后端会拒绝未经 `get_render_preview` 确认的渲染请求（返回 `preview_not_confirmed`），避免浪费算力。

## ✍️ HTML 规范（写给前端同学 / 想贡献模板的你）

> 不懂也可以。引擎只看两条硬规则：

1. **分页**：根容器 `.slides-container` 里，每页一个 `.slide`；首页带 `.active`。引擎会按 `pageMarks` 时间轴依次加 / 去 `.active`；
2. **动画触发**：入场动画挂在 `.slide.active .anim-in { animation: ... }` 上，页切到 active 时自动重新播放。

两个骨架可直接抄：

- 深色科技风（科普短片）：[`examples/planet-gravity.html`](examples/planet-gravity.html)
- 浅色暖调风（小学课堂）：[`examples/math-fractions.html`](examples/math-fractions.html)

## 🧪 本地联调（可选）

本机起 Spring Boot 后端时：

```json
{
  "mcpServers": {
    "flash-cast": {
      "command": "node",
      "args": ["/your/path/flash-cast-mcp/index.js"],
      "env": {
        "FLASH_CAST_API_BASE": "http://localhost:8080",
        "FLASH_CAST_FRONTEND_BASE": "http://localhost:5173"
      }
    }
  }
}
```

```bash
npm run smoke:local   # 走本机代理链路冒烟
npm run smoke:prod    # 走线上冒烟
```

## ⚙️ 环境变量

| 变量 | 说明 | 默认值 |
|---|---|---|
| `FLASH_CAST_API_KEY` | API Key（可选；未配置时走本机登录页） | — |
| `FLASH_CAST_API_BASE` | 后端 API 根地址 | `https://share.skyxhome.com` |
| `FLASH_CAST_FRONTEND_BASE` | 定价等跳转用的前端根地址 | 同 API_BASE |
| `FLASH_CAST_LOCAL_PORT` | 本机登录页 / 预览页 / 进度页端口 | `18888` |

登录页、预览页、进度页都由 MCP 在本机起 HTTP 服务；只有其中的 API 请求发往 `FLASH_CAST_API_BASE`——所以默认即「本机 UI + 线上后端」。

## 🔐 认证流程

```
调用 authenticate
  ↓
MCP 在 127.0.0.1:18888 开 /auth
  ↓
用户输入手机号 / 验证码
  ↓
MCP 转发到 FLASH_CAST_API_BASE/api/auth/*
  ↓
登录成功 → MCP 调 /api/keys 自动创建 API Key
  ↓
写入 ~/.flash-cast-mcp.json，下次免登录
```

（保留 `/callback?token=` 路径兼容旧版网页跳转。）

## 💳 会员

| 类型 | 能力 |
|---|---|
| 订阅会员 | 所有工具无限使用 |
| 付费用户 | 按渲染扣费 |
| 免费试用 | 每账户 1 次完整流程体验 |

触发付费时，工具结果会带 `pricingUrl`，AI 可以直接发给用户。

## 🤝 贡献

欢迎 issue / PR，尤其是：

- **更多 HTML 示例**（不同主题、不同视觉风格）放到 `examples/` 下
- **更多 MCP 客户端接入文档**（Claude Desktop、Windsurf、Cline、Continue、Gemini CLI…）
- **多语言 README**（英 / 日 / 韩）

提交示例请保持单文件、零依赖、浏览器直接打开即可预览。

## 📮 联系

- 产品主页：<https://share.skyxhome.com>
- Bug / 建议：[GitHub Issues](../../issues)

## License

[MIT](./LICENSE) © Flash Cast
