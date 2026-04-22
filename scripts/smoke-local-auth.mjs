#!/usr/bin/env node
/**
 * 冒烟：本机代理 -> FLASH_CAST_API_BASE（默认 http://localhost:8080）
 * 不启动 MCP stdio；只验证 /auth/send-code 代理链路。
 * 用法：FLASH_CAST_API_BASE=http://localhost:8080 node scripts/smoke-local-auth.mjs
 */
import { createServer } from 'node:http'

const API_BASE = process.env.FLASH_CAST_API_BASE || 'http://localhost:8080'
const PORT = parseInt(process.env.SMOKE_LOCAL_PORT || '19991', 10)

function readReqBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

const sendJson = (res, status, obj) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(obj))
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`)

  if (req.method === 'POST' && url.pathname === '/auth/send-code') {
    try {
      const body = JSON.parse((await readReqBody(req)) || '{}')
      const phone = String(body.phone || '').trim()
      if (!/^1\d{10}$/.test(phone)) {
        sendJson(res, 400, { ok: false, msg: '请输入 11 位手机号' })
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
      sendJson(res, 500, { ok: false, msg: e.message || '发送失败' })
    }
    return
  }

  if (req.method === 'GET' && url.pathname === '/auth') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end(`proxy ok -> ${API_BASE}`)
    return
  }

  res.writeHead(404)
  res.end('not found')
})

await new Promise((resolve, reject) => {
  server.listen(PORT, '127.0.0.1', resolve)
  server.on('error', reject)
})

console.log(`[smoke] proxy listening 127.0.0.1:${PORT} -> ${API_BASE}`)

async function hit(path, opts) {
  const u = `http://127.0.0.1:${PORT}${path}`
  const r = await fetch(u, opts)
  const t = await r.text()
  console.log(`[smoke] ${opts?.method || 'GET'} ${path} -> HTTP ${r.status}`)
  try {
    console.log(JSON.stringify(JSON.parse(t), null, 2))
  } catch {
    console.log(t.slice(0, 500))
  }
}

await hit('/auth')
await hit('/auth/send-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phone: '13800138000' }),
})

server.close()
console.log('[smoke] done')
