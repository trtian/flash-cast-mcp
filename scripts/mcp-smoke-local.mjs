#!/usr/bin/env node
/**
 * 本机联调：直连 FLASH_CAST_API_BASE，验证与 flash-cast-mcp 相同的 HTTP 入口。
 *
 * - GET /api/health（无需 Key）
 * - 有 API Key 时：GET /api/mcp/cast/material-guidelines、GET /api/mcp/cast/voices（与 MCP 工具 get_material_guidelines / list_voices 一致）
 *
 * 用法：
 *   FLASH_CAST_API_BASE=http://localhost:8080 node scripts/mcp-smoke-local.mjs
 *
 * Key 来源（优先环境变量）：
 *   FLASH_CAST_API_KEY=...  或  ~/.flash-cast-mcp.json 的 { "apiKey": "..." }（authenticate 工具写入）
 */
import { readFileSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const API_BASE = (process.env.FLASH_CAST_API_BASE || 'http://127.0.0.1:8080').replace(/\/$/, '')

let apiKey = process.env.FLASH_CAST_API_KEY || ''
if (!apiKey) {
  const cfgPath = join(homedir(), '.flash-cast-mcp.json')
  try {
    if (existsSync(cfgPath)) {
      const cfg = JSON.parse(readFileSync(cfgPath, 'utf-8'))
      if (cfg.apiKey) apiKey = cfg.apiKey
    }
  } catch {
    /* ignore */
  }
}

async function req(path, { auth } = {}) {
  const headers = {}
  if (auth && apiKey) headers.Authorization = `Bearer ${apiKey}`
  const url = `${API_BASE}${path}`
  const r = await fetch(url, { headers })
  const text = await r.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    json = { _raw: text.slice(0, 300) }
  }
  return { status: r.status, json }
}

function ok(msg) {
  console.log(`[mcp-smoke] OK  ${msg}`)
}
function fail(msg) {
  console.log(`[mcp-smoke] FAIL ${msg}`)
}

console.log(`[mcp-smoke] API_BASE=${API_BASE}`)
console.log(`[mcp-smoke] API_KEY=${apiKey ? '(已配置)' : '(未配置，将跳过 /api/mcp/cast/*)'}`)

let exit = 0

try {
  const h = await req('/api/health', { auth: false })
  if (h.status === 200 && h.json?.code === 0 && h.json?.data === 'ok') {
    ok(`GET /api/health HTTP ${h.status} data=ok`)
  } else {
    fail(`GET /api/health HTTP ${h.status} ${JSON.stringify(h.json).slice(0, 200)}`)
    exit = 1
  }
} catch (e) {
  fail(`GET /api/health ${e.message || e}`)
  console.log('[mcp-smoke] 提示：先在本仓库 backend 启动 Spring Boot（默认 8080），或把 FLASH_CAST_API_BASE 指到已部署环境。')
  exit = 1
}

if (apiKey) {
  try {
    const g = await req('/api/mcp/cast/material-guidelines', { auth: true })
    if (g.status === 200 && g.json?.code === 0 && g.json?.data?.pageHoldsContract) {
      ok(`GET /api/mcp/cast/material-guidelines pageHoldsContract 前 100 字: ${String(g.json.data.pageHoldsContract).slice(0, 100)}…`)
    } else {
      fail(`GET /api/mcp/cast/material-guidelines HTTP ${g.status} ${JSON.stringify(g.json).slice(0, 250)}`)
      exit = 1
    }
  } catch (e) {
    fail(`material-guidelines ${e.message || e}`)
    exit = 1
  }

  try {
    const v = await req('/api/mcp/cast/voices', { auth: true })
    const n = Array.isArray(v.json?.data) ? v.json.data.length : null
    if (v.status === 200 && v.json?.code === 0 && n != null) {
      ok(`GET /api/mcp/cast/voices HTTP ${v.status} 共 ${n} 条音色`)
    } else {
      fail(`GET /api/mcp/cast/voices HTTP ${v.status} ${JSON.stringify(v.json).slice(0, 200)}`)
      exit = 1
    }
  } catch (e) {
    fail(`voices ${e.message || e}`)
    exit = 1
  }
}

console.log('[mcp-smoke] done')
process.exit(exit)
