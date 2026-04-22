#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { createServer } from 'node:http'
import { execSync } from 'node:child_process'
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

const API_BASE = process.env.FLASH_CAST_API_BASE || 'https://share.skyxhome.com'
const FRONTEND_BASE = process.env.FLASH_CAST_FRONTEND_BASE || API_BASE
const LOCAL_PORT = parseInt(process.env.FLASH_CAST_LOCAL_PORT || '18888', 10)
const CONFIG_PATH = join(homedir(), '.flash-cast-mcp.json')

let apiKey = process.env.FLASH_CAST_API_KEY || ''

function loadPersistedKey() {
  if (apiKey) return
  try {
    if (existsSync(CONFIG_PATH)) {
      const cfg = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'))
      if (cfg.apiKey) apiKey = cfg.apiKey
    }
  } catch { /* ignore */ }
}

function persistKey(key) {
  apiKey = key
  try {
    writeFileSync(CONFIG_PATH, JSON.stringify({ apiKey: key }, null, 2), 'utf-8')
  } catch { /* ignore */ }
}

loadPersistedKey()

// ─── HTTP helper ───────────────────────────────────────────────────

async function api(method, path, body) {
  const url = `${API_BASE}${path}`
  const headers = { 'Content-Type': 'application/json' }
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`

  const opts = { method, headers }
  if (body !== undefined) opts.body = JSON.stringify(body)

  const resp = await fetch(url, opts)
  const payload = await resp.json().catch(() => null)

  if (!resp.ok) {
    const msg = payload?.msg || payload?.message || `${resp.status} ${resp.statusText}`
    throw new Error(msg)
  }
  if (payload?.code !== undefined && payload.code !== 0) {
    throw new Error(payload.msg || 'Request failed')
  }
  return payload?.data ?? payload
}

function text(obj) {
  return { content: [{ type: 'text', text: typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2) }] }
}

function readReqBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

// ─── Local HTTP Server (内置登录页 + 旧版 callback + 进度页) ───────

let localServer = null
let localServerReady = false // true 表示端口可用：自己在监听，或同机另一实例在监听
let localPortSharedByPeer = false // true 表示端口被同机其它 flash-cast-mcp 占用，复用它的页面服务
let authResolve = null

function openBrowser(url) {
  try {
    const platform = process.platform
    if (platform === 'darwin') execSync(`open "${url}"`)
    else if (platform === 'win32') execSync(`start "" "${url}"`)
    else execSync(`xdg-open "${url}"`)
  } catch { /* ignore - user will need to open manually */ }
}

function ensureLocalServer() {
  if (localServerReady) return
  localServer = createServer(async (req, res) => {
    const url = new URL(req.url, `http://127.0.0.1:${LOCAL_PORT}`)

    const sendJson = (status, obj) => {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify(obj))
    }

    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/auth')) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(authPageHtml())
      return
    }

    if (req.method === 'POST' && url.pathname === '/auth/send-code') {
      try {
        const body = JSON.parse((await readReqBody(req)) || '{}')
        const phone = String(body.phone || '').trim()
        if (!/^1\d{10}$/.test(phone)) {
          sendJson(400, { ok: false, msg: '请输入 11 位手机号' })
          return
        }
        const r = await fetch(`${API_BASE}/api/auth/send-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone }),
        })
        const text = await r.text()
        res.writeHead(r.status, { 'Content-Type': 'application/json; charset=utf-8' })
        res.end(text || '{}')
      } catch (e) {
        sendJson(500, { ok: false, msg: e.message || '发送失败' })
      }
      return
    }

    if (req.method === 'POST' && url.pathname === '/auth/login') {
      try {
        const body = JSON.parse((await readReqBody(req)) || '{}')
        const phone = String(body.phone || '').trim()
        const code = String(body.code || '').trim()
        if (!/^1\d{10}$/.test(phone) || code.length < 4) {
          sendJson(400, { ok: false, msg: '请输入手机号和验证码' })
          return
        }
        const lr = await fetch(`${API_BASE}/api/auth/login-by-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, code }),
        })
        const loginPayload = JSON.parse(await lr.text())
        if (!lr.ok || (loginPayload.code !== undefined && loginPayload.code !== 0)) {
          sendJson(200, { ok: false, msg: loginPayload.msg || loginPayload.message || '登录失败' })
          return
        }
        const token = loginPayload.data?.token
        if (!token) {
          sendJson(200, { ok: false, msg: '未返回登录令牌' })
          return
        }
        const keyResp = await fetch(`${API_BASE}/api/keys`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: 'Flash Cast MCP' }),
        })
        const keyJson = JSON.parse(await keyResp.text())
        const keyData = keyJson?.data ?? keyJson
        if (!keyResp.ok || (keyJson.code !== undefined && keyJson.code !== 0) || !keyData?.apiKey) {
          sendJson(200, {
            ok: false,
            msg: keyJson?.msg || keyJson?.message || '创建 API Key 失败，请稍后在网页端账户中手动创建',
          })
          return
        }
        persistKey(keyData.apiKey)
        if (authResolve) {
          authResolve({ success: true })
          authResolve = null
        }
        sendJson(200, { ok: true })
      } catch (e) {
        sendJson(500, { ok: false, msg: e.message || '登录异常' })
      }
      return
    }

    if (url.pathname === '/callback') {
      const token = url.searchParams.get('token')
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      if (token) {
        try {
          const keyResp = await fetch(`${API_BASE}/api/keys`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ name: 'Flash Cast MCP' })
          })
          const keyJson = await keyResp.json()
          const keyData = keyJson?.data ?? keyJson
          if (keyData?.apiKey) {
            persistKey(keyData.apiKey)
            res.end(callbackSuccessHtml())
            if (authResolve) { authResolve({ success: true }); authResolve = null }
            return
          }
        } catch { /* fall through */ }
      }
      res.end(callbackFailHtml())
      if (authResolve) { authResolve({ success: false }); authResolve = null }
      return
    }

    const previewMatch = url.pathname.match(/^\/preview\/(\d+)$/)
    if (previewMatch) {
      const projectId = previewMatch[1]
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(previewHtml(projectId, apiKey))
      return
    }

    const progressMatch = url.pathname.match(/^\/progress\/(\d+)$/)
    if (progressMatch) {
      const projectId = progressMatch[1]
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(progressHtml(projectId, apiKey))
      return
    }

    res.writeHead(404)
    res.end('Not found')
  })

  localServer.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      // 端口被同机另一个 flash-cast-mcp 实例占用（多 Cursor 窗口 / 残留进程 / 旧进程未退出）。
      // 直接复用对方提供的 /auth、/preview/:id、/progress/:id 页面，apiKey 通过
      // ~/.flash-cast-mcp.json 跨进程共享，避免 Unhandled 'error' 事件把 stdio 进程打崩。
      localServer = null
      localServerReady = true
      localPortSharedByPeer = true
      console.error(
        `[flash-cast-mcp] 127.0.0.1:${LOCAL_PORT} 已被同机另一个 MCP 实例占用，复用该实例提供的页面服务。`
      )
      return
    }
    console.error('[flash-cast-mcp] local server error:', err)
    localServer = null
    localServerReady = false
  })
  localServer.once('listening', () => {
    localServerReady = true
    localPortSharedByPeer = false
  })
  localServer.listen(LOCAL_PORT, '127.0.0.1')
}

// ─── OAuth flow ───────────────────────────────────────────────────

async function startOAuthFlow() {
  ensureLocalServer()
  const loginUrl = `http://127.0.0.1:${LOCAL_PORT}/auth`

  const promise = new Promise((resolve) => {
    if (localPortSharedByPeer) {
      // 登录由同机另一实例的 /auth 完成，apiKey 落到 ~/.flash-cast-mcp.json。
      // 本进程轮询该文件，检测到新 apiKey 即视为登录成功。
      const previousKey = apiKey
      const deadline = Date.now() + 300_000
      const timer = setInterval(() => {
        try {
          if (existsSync(CONFIG_PATH)) {
            const cfg = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'))
            if (cfg.apiKey && cfg.apiKey !== previousKey) {
              apiKey = cfg.apiKey
              clearInterval(timer)
              resolve({ success: true })
              return
            }
          }
        } catch { /* ignore parse error, keep polling */ }
        if (Date.now() >= deadline) {
          clearInterval(timer)
          resolve({ success: false, timeout: true })
        }
      }, 1500)
      return
    }

    authResolve = resolve
    setTimeout(() => { if (authResolve === resolve) { resolve({ success: false, timeout: true }); authResolve = null } }, 300_000)
  })

  openBrowser(loginUrl)
  return promise
}

// ─── Tool definitions ──────────────────────────────────────────────

const TOOLS = [
  {
    name: 'authenticate',
    description:
      '校验 API Key 或打开本机登录页。未配置 Key 时浏览器访问本机 /auth，验证码与登录由 MCP 转发到 FLASH_CAST_API_BASE（默认 https://share.skyxhome.com）。联调本机后端时设置 FLASH_CAST_API_BASE=http://localhost:8080。登录成功后自动创建并保存 API Key。',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'list_templates',
    description:
      '（可选）列出平台内置 HTML 视频模板，供需要「参考版式」时使用。用户也可完全不用模板、自行提供任意符合闪映规范的 HTML。',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'get_template_detail',
    description:
      '（可选）获取某个内置模板的规范与示例，仅在用户希望基于模板生成 HTML 时调用；非流程必需步骤。',
    inputSchema: {
      type: 'object',
      properties: { template_id: { type: 'string', description: '模板 ID' } },
      required: ['template_id'],
    },
  },
  {
    name: 'create_project',
    description:
      '创建一个新的视频项目，返回 projectId。后续所有操作都基于此 projectId。触发会员/试用检查。',
    inputSchema: {
      type: 'object',
      properties: { title: { type: 'string', description: '项目标题' } },
      required: ['title'],
    },
  },
  {
    name: 'upload_html',
    description:
      '上传 HTML 内容到项目。支持直接传入 HTML 字符串或本地文件路径。返回幻灯片数量、每页文本摘要和结构性警告。',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: { type: 'string', description: '项目 ID' },
        html_content: { type: 'string', description: '完整 HTML 内容（与 html_file 二选一）' },
        html_file: { type: 'string', description: '本地 HTML 文件路径（与 html_content 二选一）' },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'list_voices',
    description:
      '返回所有可用配音音色，含 id、name、gender、trait（特质描述）、description、tags、suggestedFor 等元数据。AI 据此自动匹配最适合内容调性的音色。',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'configure_voice_and_script',
    description:
      '设置项目的配音配置、解说文案与声画同步 pageMarks。多页 HTML 口播渲染前必须由你（当前对话中的 AI）自行划分 page_marks：根据 upload_html 返回的幻灯片页数与每页文本摘要，把 script 切成若干左闭右开区间 [start,end)，按时间顺序覆盖全文（0 到 script 的字符长度）、互不重叠不遗漏；每个区间标注 pageIdx（0..页数-1）表示该段口播时画面应停在哪一页。优先在句号、逗号等标点后换页，避免在「始终」「因此」等双字词或固定搭配中间切断——断句与语义是否通顺由调用方负责，平台不提供服务端自动分页也不保证词边界。渲染前须让用户在本机预览页核对，请调用 get_render_preview。',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: { type: 'string', description: '项目 ID' },
        script: { type: 'string', description: '完整解说/配音文案' },
        voice_model: { type: 'string', description: '单人配音的音色 ID' },
        page_marks: {
          type: 'array',
          description:
            '声画同步：将 script 按字符下标分配到各页。每项 { start, end, pageIdx }，区间为 [start,end)（半开），须覆盖 0..script.length 且无重叠、按 start 递增；pageIdx 为幻灯片索引，与 upload_html 的页数一致。多页渲染时必填。',
          items: {
            type: 'object',
            properties: {
              start: { type: 'integer', description: '该段在 script 中的起始字符下标（含）' },
              end: { type: 'integer', description: '结束下标（不含）' },
              pageIdx: { type: 'integer', description: '该段口播时对应的幻灯片页索引，从 0 开始' },
            },
            required: ['start', 'end', 'pageIdx'],
          },
        },
        voice_assignments: {
          type: 'array',
          description: '多人配音：每页分配不同音色 [{pageIdx, voiceId}]',
          items: {
            type: 'object',
            properties: {
              pageIdx: { type: 'integer', description: '页码索引（从 0 开始）' },
              voiceId: { type: 'string', description: '该页使用的音色 ID' },
            },
          },
        },
        voice_speed: { type: 'number', description: '全局语速（0.5 ~ 2.0，默认 1.0）' },
        speed_marks: {
          type: 'array',
          description: '分段变速 [{start, end, speed}]',
          items: {
            type: 'object',
            properties: { start: { type: 'integer' }, end: { type: 'integer' }, speed: { type: 'number' } },
          },
        },
      },
      required: ['project_id', 'script', 'voice_model'],
    },
  },
  {
    name: 'get_render_preview',
    description:
      '渲染前必须：拉取当前项目的 HTML 与配音文案等摘要，并返回本机只读预览页 URL。请先让用户在浏览器打开 previewUrl 核对；用户口头确认无误后，再在 render_video 中传入 user_confirmed_content: true。',
    inputSchema: {
      type: 'object',
      properties: { project_id: { type: 'string', description: '项目 ID' } },
      required: ['project_id'],
    },
  },
  {
    name: 'render_video',
    description:
      '触发视频渲染（TTS + 录屏 + 混音，约 2-10 分钟）。必须先 get_render_preview 并由用户确认；user_confirmed_content 必须为 true。返回 progressUrl 与本机进度页。',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: { type: 'string', description: '项目 ID' },
        user_confirmed_content: {
          type: 'boolean',
          description: '必须为 true：表示用户已在只读预览页核对 HTML 与配音文案无误',
        },
        aspect_ratio: {
          type: 'string',
          description: '视频比例：16:9（默认）/ 9:16 / 1:1 / 4:3',
          enum: ['16:9', '9:16', '1:1', '4:3'],
        },
      },
      required: ['project_id', 'user_confirmed_content'],
    },
  },
  {
    name: 're_render_video',
    description:
      '强制重新渲染视频（会扣除额度）。当用户修改了 HTML 素材、配音文案或音色后需要重新生成，或者对上一次渲染结果不满意想要重做时使用。调用前必须明确告知用户：此操作将消耗 1 次渲染额度。如果项目当前正在渲染中则拒绝（须等渲染完成或失败后才能重新触发）。',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: { type: 'string', description: '项目 ID' },
        user_confirmed_content: {
          type: 'boolean',
          description: '必须为 true：表示用户已确认要重新渲染并接受额度扣除',
        },
        aspect_ratio: {
          type: 'string',
          description: '视频比例：16:9（默认）/ 9:16 / 1:1 / 4:3',
          enum: ['16:9', '9:16', '1:1', '4:3'],
        },
      },
      required: ['project_id', 'user_confirmed_content'],
    },
  },
  {
    name: 'get_render_status',
    description:
      '查询渲染状态。渲染中返回进度百分比和步骤描述；完成后返回视频下载链接。建议每 15 秒轮询一次。',
    inputSchema: {
      type: 'object',
      properties: { project_id: { type: 'string', description: '项目 ID' } },
      required: ['project_id'],
    },
  },
  {
    name: 'analyze_douyin_video',
    description:
      '分析抖音视频：输入分享链接，提取口播文案 + 爆款结构解析。结果存入项目。消耗 AI 算力，非订阅会员每项目上限 3 次。耗时约 35-130 秒。',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: { type: 'string', description: '项目 ID' },
        share_text: { type: 'string', description: '抖音分享链接或口令' },
        analyze_structure: { type: 'boolean', description: '是否做爆款结构分析（默认 true）' },
      },
      required: ['project_id', 'share_text'],
    },
  },
]

// ─── Tool handlers ─────────────────────────────────────────────────

async function handleTool(name, args) {
  switch (name) {
    case 'authenticate': {
      if (!apiKey) {
        ensureLocalServer()
        const result = await startOAuthFlow()
        if (result.timeout) {
          return text({
            authenticated: false,
            message: '登录超时。请重新调用 authenticate 工具重试。',
          })
        }
        if (!result.success || !apiKey) {
          return text({
            authenticated: false,
            message: '登录未完成。请重新调用 authenticate 工具重试。',
          })
        }
      }
      const data = await api('GET', '/api/mcp/cast/auth/verify')
      return text({ authenticated: true, ...data })
    }

    case 'list_templates':
      return text(await api('GET', '/api/mcp/cast/templates'))

    case 'get_template_detail':
      return text(await api('GET', `/api/mcp/cast/templates/${args.template_id}`))

    case 'create_project': {
      const data = await api('POST', '/api/mcp/cast/projects', { title: args.title })
      if (data?.allowed === false) {
        return text({
          error: data.reason,
          message: data.reason === 'trial_exhausted'
            ? '免费试用次数已用完，请开通会员。'
            : '需要会员资格才能创建项目。',
          pricingUrl: `${FRONTEND_BASE}/pricing`,
        })
      }
      return text(data)
    }

    case 'upload_html': {
      let htmlContent = args.html_content || ''
      if (!htmlContent.trim() && args.html_file) {
        const fs = await import('node:fs/promises')
        htmlContent = await fs.readFile(args.html_file, 'utf-8')
      }
      if (!htmlContent.trim()) throw new Error('html_content 或 html_file 至少提供一个')
      return text(await api('POST', `/api/mcp/cast/projects/${args.project_id}/upload-html`, { htmlContent }))
    }

    case 'list_voices':
      return text(await api('GET', '/api/mcp/cast/voices'))

    case 'configure_voice_and_script': {
      const body = {
        script: args.script,
        voiceModel: args.voice_model,
        voiceSpeed: args.voice_speed,
        speedMarks: args.speed_marks,
        voiceAssignments: args.voice_assignments,
        pageMarks: args.page_marks,
      }
      return text(await api('PUT', `/api/mcp/cast/projects/${args.project_id}`, body))
    }

    case 'get_render_preview': {
      ensureLocalServer()
      const pack = await api('GET', `/api/mcp/cast/projects/${args.project_id}/preview-pack`)
      const previewUrl = `http://127.0.0.1:${LOCAL_PORT}/preview/${args.project_id}`
      return text({
        previewUrl,
        title: pack.title,
        slideCount: pack.slideCount,
        voiceModel: pack.voiceModel,
        scriptPreview: typeof pack.script === 'string' ? `${pack.script.slice(0, 200)}${pack.script.length > 200 ? '…' : ''}` : '',
        hint: '请让用户在浏览器打开 previewUrl，只读查看整页 HTML 与完整配音文案；确认后再调用 render_video 且 user_confirmed_content: true。',
      })
    }

    case 'render_video': {
      ensureLocalServer()

      // Guard: check current status to prevent duplicate renders / wasted credits
      try {
        const cur = await api('GET', `/api/mcp/cast/projects/${args.project_id}/status`)
        if (cur?.status === 'COMPLETED') {
          let dlUrl = cur.downloadUrl, fname = cur.filename
          if (!dlUrl) {
            try {
              const dl = await api('GET', `/api/mcp/cast/projects/${args.project_id}/download-url`)
              dlUrl = dl?.url; fname = dl?.filename
            } catch { /* ignore */ }
          }
          return text({
            status: 'COMPLETED',
            message: '该项目已渲染完成，无需重复渲染。',
            downloadUrl: dlUrl,
            filename: fname,
            progressUrl: `http://127.0.0.1:${LOCAL_PORT}/progress/${args.project_id}`,
          })
        }
        if (cur?.status === 'RENDERING') {
          return text({
            status: 'RENDERING',
            renderProgress: cur.renderProgress,
            renderMessage: cur.renderMessage || '渲染进行中',
            message: '该项目正在渲染中，请勿重复触发。使用 get_render_status 轮询进度。',
            progressUrl: `http://127.0.0.1:${LOCAL_PORT}/progress/${args.project_id}`,
          })
        }
      } catch { /* status check failed, proceed with render attempt */ }

      const body = {
        aspectRatio: args.aspect_ratio || '16:9',
        userConfirmedContent: args.user_confirmed_content === true,
      }
      const data = await api('POST', `/api/mcp/cast/projects/${args.project_id}/render`, body)
      if (data?.allowed === false) {
        if (data.reason === 'preview_not_confirmed') {
          return text({
            allowed: false,
            reason: data.reason,
            message: data.message || '需用户确认预览后再渲染',
            previewUrl: `http://127.0.0.1:${LOCAL_PORT}/preview/${args.project_id}`,
            hint: '请先调用 get_render_preview，用户在本机预览页核对后，将 render_video 的 user_confirmed_content 设为 true。',
          })
        }
        return text({
          error: data.reason,
          message: data.reason === 'trial_exhausted'
            ? '免费试用次数已用完，请开通会员。'
            : `操作受限：${data.reason}`,
          pricingUrl: `${FRONTEND_BASE}/pricing`,
        })
      }
      return text({
        ...data,
        progressUrl: `http://127.0.0.1:${LOCAL_PORT}/progress/${args.project_id}`,
        hint: '渲染已启动（约 2-10 分钟）。progressUrl 为本机进度页（轮询 FLASH_CAST_API_BASE）；也可通过 get_render_status 在 Agent 侧轮询。',
      })
    }

    case 're_render_video': {
      ensureLocalServer()

      // Only block if currently RENDERING (prevent concurrent renders)
      try {
        const cur = await api('GET', `/api/mcp/cast/projects/${args.project_id}/status`)
        if (cur?.status === 'RENDERING') {
          return text({
            status: 'RENDERING',
            renderProgress: cur.renderProgress,
            renderMessage: cur.renderMessage || '渲染进行中',
            message: '该项目正在渲染中，无法重新触发。请等待当前渲染完成或失败后再试。',
            progressUrl: `http://127.0.0.1:${LOCAL_PORT}/progress/${args.project_id}`,
          })
        }
      } catch { /* proceed */ }

      const body = {
        aspectRatio: args.aspect_ratio || '16:9',
        userConfirmedContent: args.user_confirmed_content === true,
      }
      const data = await api('POST', `/api/mcp/cast/projects/${args.project_id}/render`, body)
      if (data?.allowed === false) {
        if (data.reason === 'preview_not_confirmed') {
          return text({
            allowed: false,
            reason: data.reason,
            message: data.message || '需用户确认后再渲染',
            previewUrl: `http://127.0.0.1:${LOCAL_PORT}/preview/${args.project_id}`,
            hint: '将 user_confirmed_content 设为 true 以确认重新渲染。',
          })
        }
        return text({
          error: data.reason,
          message: data.reason === 'trial_exhausted'
            ? '免费试用次数已用完，请开通会员。'
            : `操作受限：${data.reason}`,
          pricingUrl: `${FRONTEND_BASE}/pricing`,
        })
      }
      return text({
        ...data,
        progressUrl: `http://127.0.0.1:${LOCAL_PORT}/progress/${args.project_id}`,
        hint: '重新渲染已启动（约 2-10 分钟），已扣除 1 次额度。可通过 get_render_status 轮询进度。',
      })
    }

    case 'get_render_status': {
      const data = await api('GET', `/api/mcp/cast/projects/${args.project_id}/status`)
      if (data?.status === 'COMPLETED' && !data.downloadUrl) {
        try {
          const dl = await api('GET', `/api/mcp/cast/projects/${args.project_id}/download-url`)
          data.downloadUrl = dl?.url
          data.filename = dl?.filename
        } catch { /* ignore */ }
      }
      if (data?.status === 'COMPLETED' && data.downloadUrl) {
        try {
          const { pipeline } = await import('node:stream/promises')
          const { createWriteStream } = await import('node:fs')
          const { mkdir } = await import('node:fs/promises')
          const { dirname } = await import('node:path')
          const fname = data.filename || `project-${args.project_id}.mp4`
          const cwd = process.env.FLASH_CAST_PROJECT_DIR || process.cwd()
          const outDir = join(cwd, 'examples')
          await mkdir(outDir, { recursive: true })
          const outPath = join(outDir, fname)
          if (!existsSync(outPath)) {
            const resp = await fetch(data.downloadUrl)
            if (resp.ok && resp.body) {
              const { Readable } = await import('node:stream')
              await pipeline(Readable.fromWeb(resp.body), createWriteStream(outPath))
              data.localPath = outPath
              data.hint = `视频已自动下载到 ${outPath}`
            }
          } else {
            data.localPath = outPath
            data.hint = `视频已存在于 ${outPath}`
          }
        } catch (dlErr) {
          data.downloadError = dlErr.message
        }
      }
      return text(data)
    }

    case 'analyze_douyin_video': {
      const body = { shareText: args.share_text, analyzeStructure: args.analyze_structure !== false }
      const data = await api('POST', `/api/mcp/cast/projects/${args.project_id}/analyze-douyin`, body)
      if (data?.allowed === false) {
        return text({ error: data.reason, message: `操作受限：${data.reason}`, pricingUrl: `${FRONTEND_BASE}/pricing` })
      }
      return text(data)
    }

    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}

// ─── Embedded HTML templates ──────────────────────────────────────

function authPageHtml() {
  const subEsc = API_BASE.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return `<!DOCTYPE html>
<html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Flash Cast - 登录</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;background:#0c0c0e;color:#e0e0e6;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
.card{width:100%;max-width:380px;padding:32px 28px;border-radius:14px;background:#151518;border:1px solid #222228}
h1{font-size:18px;font-weight:600;color:#f0f0f0;margin-bottom:4px;text-align:center}
.sub{font-size:11px;color:#5a5a66;text-align:center;margin-bottom:22px;word-break:break-all}
label{display:block;font-size:12px;font-weight:500;color:#7a7a86;margin-bottom:6px}
input{width:100%;padding:10px 12px;border-radius:8px;border:1px solid #2a2a32;background:#1a1a20;color:#e0e0e6;font-size:14px;outline:none}
.row{display:flex;gap:8px;margin-top:14px}
.btn{width:100%;padding:10px 0;border-radius:8px;border:none;cursor:pointer;font-size:14px;font-weight:600;margin-top:16px}
.btn-primary{background:#e8e8ee;color:#111114}
.btn-ghost{padding:10px 14px;border-radius:8px;border:1px solid #2a2a32;background:transparent;color:#a0a0b0;font-size:13px;cursor:pointer;white-space:nowrap;min-width:100px}
.err{color:#e5534b;font-size:12px;margin-top:10px}
.ok{color:#10b981;font-size:12px;margin-top:10px;text-align:center}
</style></head>
<body>
<div class="card">
  <h1>Flash Cast MCP</h1>
  <p class="sub">后端 API：${subEsc}</p>
  <label>手机号</label>
  <input id="phone" type="tel" maxlength="11" placeholder="11 位手机号" autocomplete="tel">
  <div class="row">
    <input id="code" type="text" maxlength="6" placeholder="验证码" style="flex:1" autocomplete="one-time-code">
    <button type="button" class="btn-ghost" id="sendBtn">获取验证码</button>
  </div>
  <button type="button" class="btn btn-primary" id="loginBtn">登录并生成 API Key</button>
  <p id="msg" class="err" style="display:none"></p>
  <p id="ok" class="ok" style="display:none">已完成，请关闭此页并回到 AI 工具继续。</p>
</div>
<script>
const PHONE_RE=/^1[0-9]{10}$/;
let cd=0,timer=null;
function showErr(t){const e=document.getElementById('msg'),o=document.getElementById('ok');e.style.display=t?'block':'none';e.textContent=t||'';o.style.display='none';}
function showOk(){document.getElementById('msg').style.display='none';document.getElementById('ok').style.display='block';}
function tick(){document.getElementById('sendBtn').disabled=cd>0;document.getElementById('sendBtn').textContent=cd>0?cd+'s':'获取验证码';if(cd>0){cd--;timer=setTimeout(tick,1000);}else{clearTimeout(timer);timer=null;}}
document.getElementById('sendBtn').onclick=async()=>{
  const phone=document.getElementById('phone').value.trim();
  if(!PHONE_RE.test(phone)){showErr('请输入正确手机号');return;}
  showErr('');
  try{
    const r=await fetch('/auth/send-code',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone})});
    const j=await r.json().catch(()=>({}));
    if(j.ok===false){showErr(j.msg||'发送失败');return;}
    if(j.code!==undefined&&j.code!==0){showErr(j.msg||'发送失败');return;}
    cd=(j.data&&j.data.cooldown)||60;tick();
  }catch(x){showErr('网络错误');}
};
document.getElementById('loginBtn').onclick=async()=>{
  const phone=document.getElementById('phone').value.trim();
  const code=document.getElementById('code').value.trim();
  if(!PHONE_RE.test(phone)||code.length<4){showErr('请输入手机号和验证码');return;}
  showErr('');
  try{
    const r=await fetch('/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone,code})});
    const j=await r.json().catch(()=>({}));
    if(!j.ok){showErr(j.msg||'登录失败');return;}
    showOk();
  }catch(x){showErr('网络错误');}
};
</script>
</body></html>`
}

function callbackSuccessHtml() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Flash Cast</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;background:#0c0c0e;color:#e0e0e6;display:flex;align-items:center;justify-content:center;min-height:100vh}
.card{text-align:center;max-width:360px;padding:48px 32px}
.icon{width:48px;height:48px;border-radius:50%;background:#0f2a1f;border:1px solid #1a3a2a;margin:0 auto 20px;display:flex;align-items:center;justify-content:center}
.icon svg{color:#10b981}
h1{font-size:18px;font-weight:600;color:#f0f0f0;margin-bottom:8px}
p{font-size:13px;color:#6b6b76;line-height:1.6}
.hint{margin-top:20px;padding:12px 16px;border-radius:8px;background:#151518;border:1px solid #222228;font-size:12px;color:#7a7a86}</style></head>
<body><div class="card">
<div class="icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
<h1>认证成功</h1>
<p>API Key 已自动配置，可以关闭此页面。</p>
<div class="hint">回到 AI 工具继续使用即可，无需其他操作。</div>
</div></body></html>`
}

function callbackFailHtml() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Flash Cast</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;background:#0c0c0e;color:#e0e0e6;display:flex;align-items:center;justify-content:center;min-height:100vh}
.card{text-align:center;max-width:360px;padding:48px 32px}
.icon{width:48px;height:48px;border-radius:50%;background:#2a1416;border:1px solid #3a1a1c;margin:0 auto 20px;display:flex;align-items:center;justify-content:center}
.icon svg{color:#e5534b}
h1{font-size:18px;font-weight:600;color:#f0f0f0;margin-bottom:8px}
p{font-size:13px;color:#6b6b76;line-height:1.6}</style></head>
<body><div class="card">
<div class="icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></div>
<h1>认证失败</h1>
<p>请关闭此页面，在 AI 工具中重新调用 authenticate。</p>
</div></body></html>`
}

function previewHtml(projectId, key) {
  const keyJson = JSON.stringify(apiKey || '')
  const apiJson = JSON.stringify(API_BASE)
  return `<!DOCTYPE html>
<html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Flash Cast - 渲染前预览（只读）</title>
<style>
*{box-sizing:border-box;margin:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;background:#0c0c0e;color:#e0e0e6;min-height:100vh;display:flex;flex-direction:column}
.top{padding:14px 20px;border-bottom:1px solid #222228;background:#151518}
.top h1{font-size:15px;font-weight:600;color:#f0f0f0}
.top p{font-size:11px;color:#6b6b76;margin-top:4px}
.banner{padding:10px 20px;background:#1a1810;border-bottom:1px solid #2a2820;font-size:12px;color:#b8a88c}
.grid{flex:1;display:grid;grid-template-columns:minmax(280px,38%) 1fr;min-height:0}
.panel{border-right:1px solid #222228;display:flex;flex-direction:column;min-height:0;background:#111114}
.panel h2{font-size:11px;font-weight:600;color:#7a7a86;text-transform:uppercase;letter-spacing:.06em;padding:10px 14px;border-bottom:1px solid #1e1e24}
.meta{padding:12px 14px;font-size:12px;color:#9a9aa6;line-height:1.7;border-bottom:1px solid #1e1e24}
.meta code{color:#c0c0cc}
.ta{flex:1;width:100%;padding:12px;border:none;background:#0c0c0e;color:#e0e0e6;font-size:13px;line-height:1.55;resize:none;outline:none;font-family:ui-monospace,Menlo,monospace}
.pre{flex:1;margin:0;padding:12px;overflow:auto;font-size:11px;line-height:1.45;color:#9a9aa6;background:#0c0c0e;border:none;white-space:pre-wrap;word-break:break-word;font-family:ui-monospace,Menlo,monospace}
.slides{padding:8px 14px 12px;font-size:12px;color:#8a8a96;border-bottom:1px solid #1e1e24;max-height:120px;overflow:auto}
.view{position:relative;min-height:0;background:#000;display:flex;flex-direction:column}
.view h2{font-size:11px;font-weight:600;color:#7a7a86;padding:8px 12px;border-bottom:1px solid #1e1e24}
iframe{flex:1;width:100%;border:none;background:#000}
.err{padding:40px 20px;text-align:center;color:#e5534b;font-size:13px}
</style></head>
<body>
<div class="top"><h1>渲染前预览（只读）</h1><p>请核对左侧文案与下方画面；确认无误后在 AI 对话中说明，并由 Agent 调用 render_video 且 user_confirmed_content: true</p></div>
<div class="banner">本页不可编辑；修改请回到 Agent 重新上传 HTML 或更新 configure_voice_and_script。</div>
<div class="grid">
  <div class="panel" id="leftCol">
    <h2>项目与配音</h2>
    <div class="meta" id="meta"></div>
    <h2>配音全文</h2>
    <textarea class="ta" id="scriptTa" readonly spellcheck="false"></textarea>
    <h2>每页摘要</h2>
    <div class="slides" id="slides"></div>
    <h2>pageMarks（JSON）</h2>
    <pre class="pre" id="marks"></pre>
  </div>
  <div class="view">
    <h2>HTML 画面预览</h2>
    <iframe id="frame" title="html preview" sandbox="allow-scripts allow-same-origin"></iframe>
  </div>
</div>
<div id="err" class="err" style="display:none"></div>
<script>
const API=${apiJson},PID=${JSON.stringify(String(projectId))},KEY=${keyJson};
async function load(){
  const errEl=document.getElementById('err');
  try{
    const h={};if(KEY)h['Authorization']='Bearer '+KEY;
    const r=await fetch(API+'/api/mcp/cast/projects/'+PID+'/preview-pack',{headers:h});
    const j=await r.json();
    const d=j.data||j;
    if(j.code!==undefined&&j.code!==0){errEl.style.display='block';errEl.textContent=j.msg||'加载失败';return;}
    document.getElementById('meta').innerHTML='<div>标题：<code>'+esc(d.title||'')+'</code></div><div>项目 ID：<code>'+esc(String(d.projectId))+'</code></div><div>页数：'+(d.slideCount||0)+' · 音色：<code>'+esc(d.voiceModel||'')+'</code> · 语速：'+(d.voiceSpeed!=null?d.voiceSpeed:1)+'</div><div>比例：<code>'+esc(d.aspectRatio||'16:9')+'</code></div>';
    document.getElementById('scriptTa').value=d.script||'';
    const st=d.slideTexts||[];
    document.getElementById('slides').innerHTML=st.map((t,i)=>'<div style="margin-bottom:6px"><b>P'+i+'</b> '+esc(t)+'</div>').join('')||'<i>无</i>';
    document.getElementById('marks').textContent=d.pageMarks!=null?JSON.stringify(d.pageMarks,null,2):'（尚未写入：请在 configure_voice_and_script 中传入 page_marks）';
    const html=d.html||'';
    const fr=document.getElementById('frame');
    fr.srcdoc=html;
  }catch(e){errEl.style.display='block';errEl.textContent=e.message||'加载异常';}
}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
load();
</script>
</body></html>`
}

function progressHtml(projectId, key) {
  return `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Flash Cast - 渲染进度</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;background:#0c0c0e;color:#e0e0e6;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
.card{width:100%;max-width:460px;padding:32px 28px;border-radius:14px;background:#151518;border:1px solid #222228}
.header{text-align:center;margin-bottom:28px}
.icon{width:44px;height:44px;border-radius:10px;background:#1a1a20;border:1px solid #2a2a32;margin:0 auto 14px;display:flex;align-items:center;justify-content:center}
h1{font-size:18px;font-weight:600;color:#f0f0f0;margin-bottom:4px}
.sub{font-size:12px;color:#5a5a66}
.progress-track{height:3px;border-radius:2px;background:#1e1e24;overflow:hidden;margin-bottom:8px}
.progress-bar{height:100%;border-radius:2px;background:#c0c0cc;transition:width .6s ease}
.progress-bar.done{background:#10b981}
.progress-bar.fail{background:#e5534b}
.meta{display:flex;justify-content:space-between;margin-bottom:24px;font-size:12px}
.meta-msg{color:#6b6b76}
.meta-pct{color:#7a7a86;font-weight:600;font-variant-numeric:tabular-nums}
.meta-pct.done{color:#10b981}
.steps{display:flex;margin-bottom:24px}
.step{flex:1;text-align:center}
.step-dot{width:6px;height:6px;border-radius:3px;margin:0 auto 5px;background:#2a2a32;transition:background .3s}
.step-dot.active{background:#c0c0cc}
.step-label{font-size:10px;color:#3a3a42;transition:color .3s;letter-spacing:.01em}
.step-label.active{color:#8a8a96}
.video-wrap{margin-bottom:14px;border-radius:8px;overflow:hidden;background:#111114;border:1px solid #1e1e24}
.video-wrap video{width:100%;display:block}
.dl-btn{display:flex;align-items:center;justify-content:center;gap:8px;padding:10px 0;border-radius:8px;background:#e8e8ee;color:#111114;text-decoration:none;font-weight:600;font-size:14px}
.fail-box{padding:14px;border-radius:8px;background:#1c1214;border:1px solid #2a1a1c;color:#e5534b;font-size:13px}
.auto-hint{text-align:center;color:#3a3a42;font-size:11px;margin-top:8px}
@keyframes spin{to{transform:rotate(360deg)}}
.spinner{animation:spin 1.2s linear infinite}
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <div class="icon" id="statusIcon"></div>
    <h1 id="title">正在连接...</h1>
    <p class="sub" id="subtitle">#${projectId}</p>
  </div>
  <div class="progress-track"><div class="progress-bar" id="bar" style="width:0%"></div></div>
  <div class="meta"><span class="meta-msg" id="msg">准备中</span><span class="meta-pct" id="pct">0%</span></div>
  <div class="steps" id="stepsWrap"></div>
  <div id="result"></div>
  <p class="auto-hint" id="autoHint">自动刷新</p>
</div>
<script>
const API='${API_BASE}',PID='${projectId}',KEY='${key}';
const STEPS=[{l:'准备渲染',t:0},{l:'语音合成',t:15},{l:'画面录制',t:35},{l:'混音编码',t:70},{l:'上传完成',t:90}];
const $=id=>document.getElementById(id);
const stepsWrap=$('stepsWrap');
STEPS.forEach(s=>{const d=document.createElement('div');d.className='step';d.innerHTML='<div class="step-dot"></div><span class="step-label">'+s.l+'</span>';stepsWrap.appendChild(d)});
const startTime=Date.now();
const svgLoader='<svg class="spinner" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a0a0b0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4m0 12v4m-7.07-14.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>';
const svgDone='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
const svgFail='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e5534b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
const svgDl='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
$('statusIcon').innerHTML=svgLoader;
function fmt(s){const m=Math.floor(s/60);return m+':'+String(s%60).padStart(2,'0')}
function updateSteps(p){const dots=stepsWrap.querySelectorAll('.step-dot'),labels=stepsWrap.querySelectorAll('.step-label');const ci=STEPS.filter(s=>p>=s.t).length-1;dots.forEach((d,i)=>{d.className='step-dot'+(i<=ci?' active':'')});labels.forEach((l,i)=>{l.className='step-label'+(i<=ci?' active':'')})}
async function poll(){
  try{
    const h={};if(KEY)h['Authorization']='Bearer '+KEY;
    const r=await fetch(API+'/api/mcp/cast/projects/'+PID+'/status',{headers:h});
    const j=await r.json();const d=j.data||j;
    const status=d.status,progress=d.renderProgress||0,message=d.renderMessage||'';
    $('bar').style.width=progress+'%';
    $('msg').textContent=message;
    $('pct').textContent=progress+'%';
    updateSteps(progress);
    const elapsed=Math.floor((Date.now()-startTime)/1000);
    $('subtitle').textContent='#'+PID+' \\u00b7 '+fmt(elapsed);
    if(status==='COMPLETED'){
      $('statusIcon').innerHTML=svgDone;
      $('statusIcon').parentElement.querySelector('.icon').style.borderColor='#1a3a2a';
      $('title').textContent='渲染完成';
      $('bar').className='progress-bar done';
      $('pct').className='meta-pct done';
      $('stepsWrap').style.display='none';
      $('autoHint').style.display='none';
      let dlUrl=d.downloadUrl,fname=d.filename;
      if(!dlUrl){try{const dr=await fetch(API+'/api/mcp/cast/projects/'+PID+'/download-url',{headers:h});const dd=(await dr.json()).data;dlUrl=dd?.url;fname=dd?.filename}catch{}}
      if(dlUrl){
        $('result').innerHTML='<div class="video-wrap"><video src="'+dlUrl+'" controls autoplay muted></video></div><a class="dl-btn" href="'+dlUrl+'" download="'+(fname||'video.mp4')+'">'+svgDl+'<span>下载视频</span></a>';
      }
      return;
    }
    if(status==='FAILED'){
      $('statusIcon').innerHTML=svgFail;
      $('title').textContent='渲染失败';
      $('bar').className='progress-bar fail';
      $('stepsWrap').style.display='none';
      $('autoHint').style.display='none';
      $('result').innerHTML='<div class="fail-box">'+(message||'渲染失败，请稍后重试')+'</div>';
      return;
    }
    setTimeout(poll,3000);
  }catch(e){setTimeout(poll,8000)}
}
poll();
</script>
</body>
</html>`
}

// ─── Server setup ──────────────────────────────────────────────────

const server = new Server(
  { name: 'flash-cast-mcp', version: '1.3.0' },
  { capabilities: { tools: {} } },
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params
  try {
    return await handleTool(name, args || {})
  } catch (err) {
    return text({ error: err.message })
  }
})

const transport = new StdioServerTransport()
await server.connect(transport)
