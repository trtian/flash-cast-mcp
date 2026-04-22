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

<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false">
  <defs>
    <symbol id="fc-check" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" d="M20 6 9 17l-5-5"/></symbol>
    <symbol id="fc-x" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" d="M18 6 6 18M6 6l12 12"/></symbol>
    <symbol id="fc-warn" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></symbol>
    <symbol id="fc-film" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path fill="currentColor" d="M6 8h2v2H6zm0 4h2v2H6zm0 4h2v2H6zm8-8h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2z"/></symbol>
    <symbol id="fc-bolt" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></symbol>
    <symbol id="fc-toolbox" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12"/></symbol>
    <symbol id="fc-cycle" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 3"/><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M21 3v5h-5"/><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 21"/><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M3 21v-5h5"/></symbol>
    <symbol id="fc-pen" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 19l7-7 3 3-7 7-3-3z"/><path fill="none" stroke="currentColor" stroke-width="2" d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5zM2 2l7.586 7.586"/><circle cx="11" cy="11" r="2" fill="none" stroke="currentColor" stroke-width="2"/></symbol>
    <symbol id="fc-cog" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></symbol>
    <symbol id="fc-lock" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path fill="none" stroke="currentColor" stroke-width="2" d="M7 11V7a5 5 0 0 1 10 0v4"/></symbol>
    <symbol id="fc-wallet" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" d="M21 12V7H5a2 2 0 0 1 0-4h18v8"/><path fill="none" stroke="currentColor" stroke-width="2" d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path fill="none" stroke="currentColor" stroke-width="2" d="M18 12h.01"/></symbol>
    <symbol id="fc-hands" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></symbol>
    <symbol id="fc-mail" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path fill="none" stroke="currentColor" stroke-width="2" d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></symbol>
    <symbol id="fc-cake" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path fill="none" stroke="currentColor" stroke-width="2" d="M4 16s.5-1 2-1 2.5 2 4 2 2-2 4-2 2.5 2 4 2 2-1 2-1V7l-8-4-8 4v9"/><path fill="none" stroke="currentColor" stroke-width="2" d="M12 7v13"/></symbol>
    <symbol id="fc-hash" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/></symbol>
    <symbol id="fc-puzzle" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><polyline points="2 17 12 22 22 17" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><polyline points="2 12 12 17 22 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></symbol>
    <symbol id="fc-ruler" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" d="M21.3 8.7 15.3 2.7a2.4 2.4 0 0 0-3.4 0L2.7 12a2.4 2.4 0 0 0 0 3.4l6 6a2.4 2.4 0 0 0 3.4 0l9.3-9.3a2.4 2.4 0 0 0 0-3.4z"/><path fill="none" stroke="currentColor" stroke-width="2" d="M7.5 10.5 11 14M10 7.5l3.5 3.5"/></symbol>
    <symbol id="fc-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 6v6l4 2"/></symbol>
    <symbol id="fc-books" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path fill="none" stroke="currentColor" stroke-width="2" d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path fill="none" stroke="currentColor" stroke-width="2" d="M8 7h8M8 11h6"/></symbol>
    <symbol id="fc-cap" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" d="M22 10v6M2 10l10-5 10 5-10 5z"/><path fill="none" stroke="currentColor" stroke-width="2" d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></symbol>
    <symbol id="fc-newspaper" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9h2v9Z"/><path fill="none" stroke="currentColor" stroke-width="2" d="M18 6h-8M18 10h-8M18 14h-4"/></symbol>
    <symbol id="fc-book" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path fill="none" stroke="currentColor" stroke-width="2" d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></symbol>
    <symbol id="fc-brain" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M9 18h6M10 22h4"/></symbol>
    <symbol id="fc-brief" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path fill="none" stroke="currentColor" stroke-width="2" d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></symbol>
  </defs>
</svg>

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
| 输出是否确定 | <svg width="15" height="15" style="vertical-align:-0.2em;color:#dc2626"><use href="#fc-x"/></svg> 每次不同 | <svg width="15" height="15" style="vertical-align:-0.2em;color:#16a34a"><use href="#fc-check"/></svg> 但模板僵 | <svg width="15" height="15" style="vertical-align:-0.2em;color:#16a34a"><use href="#fc-check"/></svg> 但人主导 | <svg width="15" height="15" style="vertical-align:-0.2em;color:#16a34a"><use href="#fc-check"/></svg> **同输入同输出** |
| 控制粒度 | prompt 级 | 模板级 | 帧级（手工） | **CSS 级可编程** |
| 迭代一个细节 | 重抽卡 | 只能重录 | 手工调整 | **改一行 CSS** |
| 结构化知识表达 | <svg width="15" height="15" style="vertical-align:-0.2em;color:#dc2626"><use href="#fc-x"/></svg> 画不出公式 | <svg width="15" height="15" style="vertical-align:-0.2em;color:#ca8a04"><use href="#fc-warn"/></svg> 只靠字幕 | <svg width="15" height="15" style="vertical-align:-0.2em;color:#ca8a04"><use href="#fc-warn"/></svg> 需要素材 | <svg width="15" height="15" style="vertical-align:-0.2em;color:#16a34a"><use href="#fc-check"/></svg> **任意图示 / 动画** |
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

## <svg width="20" height="20" style="vertical-align:-0.25em;color:currentColor" aria-hidden="true"><use href="#fc-film"/></svg> 能做成什么样

> **为什么看不到内嵌播放器？** GitHub / npm 等站的 README 会**去掉或禁用** `<video>`，IDE 里预览 Markdown 时相对路径 `examples/*.mp4` 也**往往解析不到**。请点下面链接，在浏览器里打开 **raw MP4** 即可播放；若已 clone 本仓库，也可直接用系统播放器打开 `examples` 目录下的同名文件。

### Demo 1 · 科普短片

<p align="center">
  <a href="https://github.com/flash-cast/flash-cast-mcp/raw/main/examples/demo-planet-gravity.mp4"><strong>在浏览器中播放 · demo-planet-gravity.mp4</strong></a>
</p>

> 《引力弯出轨道 · 星球为何在旋转里被捕获》 · 5 页深空视觉 · 源码：[`examples/planet-gravity.html`](examples/planet-gravity.html)

### Demo 2 · 小学数学动画课

<p align="center">
  <a href="https://github.com/flash-cast/flash-cast-mcp/raw/main/examples/%E5%B0%8F%E5%AD%A6%E6%95%B0%E5%AD%A6%20%C2%B7%20%E5%88%86%E6%95%B0%E7%9A%84%E7%A7%98%E5%AF%86_2026-04-22_19-10-11.mp4"><strong>在浏览器中播放 · 小学数学 · 分数的秘密（MP4）</strong></a>
</p>

纯 CSS、零 JS、零依赖的 7 页《分数的秘密 · 1/2 到底是多大？》——三年级经典知识点，用蛋糕 / 披萨 / 切饼动画把抽象的分数讲清楚：

- <svg width="16" height="16" style="vertical-align:-0.2em;color:#ea580c" aria-hidden="true"><use href="#fc-cake"/></svg> 开场故事：姐弟俩分蛋糕，用 emoji + 切刀动画引入；
- <svg width="16" height="16" style="vertical-align:-0.2em;color:#6366f1" aria-hidden="true"><use href="#fc-hash"/></svg> 分子 / 分母：圆饼动态切 4 份涂 1 份，配分数符号从下往上拼入；
- <svg width="16" height="16" style="vertical-align:-0.2em;color:#0d9488" aria-hidden="true"><use href="#fc-puzzle"/></svg> 对比演示：2 / 3 / 4 / 8 份并排切给你看，直观呈现"分得越多，每份越小"；
- <svg width="16" height="16" style="vertical-align:-0.2em;color:#dc2626" aria-hidden="true"><use href="#fc-x"/></svg> 反例警告：不等分的圆饼 + 红色"X"弹入，强调"平均分"前提；
- <svg width="16" height="16" style="vertical-align:-0.2em;color:#2563eb" aria-hidden="true"><use href="#fc-ruler"/></svg> 比大小：3/8 vs 5/8 圆饼 + 同步条形图双路呈现；
- <svg width="16" height="16" style="vertical-align:-0.2em;color:#7c3aed" aria-hidden="true"><use href="#fc-clock"/></svg> 生活场景：时钟、披萨、巧克力、零花钱，分数就在身边。

> 源码：[`examples/math-fractions.html`](examples/math-fractions.html) · 浅色暖调，家长 / 老师 / 自学儿童都能看懂。

在 Cursor 里对 AI 说一句「用 flash-cast 把 `examples/math-fractions.html` 做成视频，温柔女声、儿童语气、每页停 10 秒」，就能得到同款成片。

---

## 典型场景

不再是"上传 HTML"，而是 **你（AI）要表达什么**：

| 场景 | AI 做的事 | 产出 |
|---|---|---|
| <svg width="16" height="16" style="vertical-align:-0.2em;color:#2563eb" aria-hidden="true"><use href="#fc-books"/></svg> **知识科普** | 把一个概念写成 5 页带动画的讲解 | 适合 B 站 / YouTube 的横屏短片 |
| <svg width="16" height="16" style="vertical-align:-0.2em;color:#7c3aed" aria-hidden="true"><use href="#fc-cap"/></svg> **AI 小课堂** | 把一份技术笔记切成 7 页课程 | 技术社区 / 公众号配套视频 |
| <svg width="16" height="16" style="vertical-align:-0.2em;color:#64748b" aria-hidden="true"><use href="#fc-newspaper"/></svg> **新闻速览** | 把一条新闻拆成导语 + 3 个要点 + 观点 | 抖音 / 小红书竖屏口播 |
| <svg width="16" height="16" style="vertical-align:-0.2em;color:#d97706" aria-hidden="true"><use href="#fc-book"/></svg> **读书笔记** | 把一本书金句 + 观点做成情绪化分享 | 小红书 / 朋友圈传播素材 |
| <svg width="16" height="16" style="vertical-align:-0.2em;color:#db2777" aria-hidden="true"><use href="#fc-brain"/></svg> **行业洞察** | 把一份分析做成可视化图表 + 结论 | LinkedIn / 知识星球 |
| <svg width="16" height="16" style="vertical-align:-0.2em;color:#0f766e" aria-hidden="true"><use href="#fc-brief"/></svg> **产品介绍** | 把 Changelog 做成发布视频 | 官网 / Twitter / 微信 |

**共同点：输入是"想法"，输出是"可直接分发的视频资产"**。中间全部交给 AI + Flash Cast。

---

## <svg width="20" height="20" style="vertical-align:-0.25em;color:currentColor" aria-hidden="true"><use href="#fc-bolt"/></svg> 30 秒接入

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

## <svg width="20" height="20" style="vertical-align:-0.25em;color:currentColor" aria-hidden="true"><use href="#fc-toolbox"/></svg> MCP 工具清单（AI 视角）

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
| `render_video` | 触发 TTS + 浏览器级录屏（约 2–10 min） | <svg width="15" height="15" style="vertical-align:-0.2em;color:#16a34a"><use href="#fc-check"/></svg> |
| `get_render_status` | 查进度 / 拿下载链接 | — |
| `analyze_douyin_video` | 抖音爆款拆解（ASR + 结构分析） | <svg width="15" height="15" style="vertical-align:-0.2em;color:#16a34a"><use href="#fc-check"/></svg> |

> 「耗算力」= 后端消耗 TTS / 渲染 / ASR / LLM 资源，非会员每账户 1 次免费完整试用。

## <svg width="20" height="20" style="vertical-align:-0.25em;color:currentColor" aria-hidden="true"><use href="#fc-cycle"/></svg> 典型工作流

<pre style="white-space:pre;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:0.9em;line-height:1.45">authenticate
  ↓
create_project
  ↓
upload_html               ← AI 把它刚写的 HTML 上传
  ↓
list_voices               ← AI 按内容调性自动挑音色
  ↓
configure_voice_and_script ← <svg width="14" height="14" style="vertical-align:-0.15em;color:#ca8a04" aria-hidden="true"><use href="#fc-warn"/></svg> AI 自行切分 page_marks（声画同步）
  ↓
get_render_preview         ← <svg width="14" height="14" style="vertical-align:-0.15em;color:#ca8a04" aria-hidden="true"><use href="#fc-warn"/></svg> 用户浏览器核对，必须确认
  ↓
render_video (user_confirmed_content: true)
  ↓
get_render_status          ← 轮询到 COMPLETED → 下载链接
</pre>

两条关键护栏：

- **AI 自主分页**：多页 HTML 的 `page_marks`（口播字符区间 → 页）由对话中的 AI 自己决定断点，不是服务端黑盒。优先在标点后切换；
- **渲染前强制预览**：后端会拒绝未经 `get_render_preview` 确认的渲染请求（返回 `preview_not_confirmed`），避免浪费算力。

## <svg width="20" height="20" style="vertical-align:-0.25em;color:currentColor" aria-hidden="true"><use href="#fc-pen"/></svg> HTML 规范（写给前端同学 / 想贡献模板的你）

> 不懂也可以。引擎只看两条硬规则：

1. **分页**：根容器 `.slides-container` 里，每页一个 `.slide`；首页带 `.active`。引擎会按 `pageMarks` 时间轴依次加 / 去 `.active`；
2. **动画触发**：入场动画挂在 `.slide.active .anim-in { animation: ... }` 上，页切到 active 时自动重新播放。

两个骨架可直接抄：

- 深色科技风（科普短片）：[`examples/planet-gravity.html`](examples/planet-gravity.html)
- 浅色暖调风（小学课堂）：[`examples/math-fractions.html`](examples/math-fractions.html)

## <svg width="20" height="20" style="vertical-align:-0.25em;color:currentColor" aria-hidden="true"><use href="#fc-cog"/></svg> 环境变量

| 变量 | 说明 | 默认值 |
|---|---|---|
| `FLASH_CAST_API_KEY` | API Key（可选；未配置时走本机登录页） | — |
| `FLASH_CAST_API_BASE` | 后端 API 根地址 | `https://share.skyxhome.com` |
| `FLASH_CAST_FRONTEND_BASE` | 定价等跳转用的前端根地址 | 同 API_BASE |
| `FLASH_CAST_LOCAL_PORT` | 本机登录页 / 预览页 / 进度页端口 | `18888` |

登录页、预览页、进度页都由 MCP 在本机起 HTTP 服务；只有其中的 API 请求发往 `FLASH_CAST_API_BASE`——所以默认即「本机 UI + 线上后端」。

## <svg width="20" height="20" style="vertical-align:-0.25em;color:currentColor" aria-hidden="true"><use href="#fc-lock"/></svg> 认证流程

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

## <svg width="20" height="20" style="vertical-align:-0.25em;color:currentColor" aria-hidden="true"><use href="#fc-wallet"/></svg> 会员

| 类型 | 能力 |
|---|---|
| 订阅会员 | 所有工具无限使用 |
| 付费用户 | 按渲染扣费 |
| 免费试用 | 每账户 1 次完整流程体验 |

触发付费时，工具结果会带 `pricingUrl`，AI 可以直接发给用户。

## <svg width="20" height="20" style="vertical-align:-0.25em;color:currentColor" aria-hidden="true"><use href="#fc-hands"/></svg> 贡献

欢迎 issue / PR，尤其是：

- **更多 HTML 示例**（不同主题、不同视觉风格）放到 `examples/` 下
- **更多 MCP 客户端接入文档**（Claude Desktop、Windsurf、Cline、Continue、Gemini CLI…）
- **多语言 README**（英 / 日 / 韩）

提交示例请保持单文件、零依赖、浏览器直接打开即可预览。

## <svg width="20" height="20" style="vertical-align:-0.25em;color:currentColor" aria-hidden="true"><use href="#fc-mail"/></svg> 联系

- 产品主页：<https://share.skyxhome.com>
- Bug / 建议：[GitHub Issues](../../issues)

## License

[MIT](./LICENSE) © Flash Cast
