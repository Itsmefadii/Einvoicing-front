import { NextRequest, NextResponse } from 'next/server'

function getApiBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL || ''
  const trimmed = fromEnv.replace(/\/$/, '')
  return trimmed || 'http://localhost:8000'
}

async function handle(request: NextRequest, { params }: { params: { path: string[] } }) {
  const apiBase = getApiBase()
  const url = new URL(request.url)
  const subPath = params.path?.join('/') || ''
  const targetUrl = `${apiBase}/${subPath}${url.search}`

  const token = request.cookies.get('token')?.value

  const headers = new Headers(request.headers)
  headers.set('host', new URL(apiBase).host)
  if (token) {
    headers.set('authorization', `Bearer ${token}`)
  }
  // Do not forward next headers
  headers.delete('x-forwarded-host')
  headers.delete('x-forwarded-proto')
  headers.delete('x-middleware-invoke')

  const init: RequestInit = {
    method: request.method,
    headers,
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer(),
    redirect: 'manual',
  }

  try {
    const resp = await fetch(targetUrl, init)
    const respHeaders = new Headers(resp.headers)
    // Remove CORS headers; Next will handle
    respHeaders.delete('access-control-allow-origin')
    respHeaders.delete('access-control-allow-credentials')
    return new NextResponse(resp.body, {
      status: resp.status,
      statusText: resp.statusText,
      headers: respHeaders,
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'Proxy request failed', message: e?.message || 'Network error' }, { status: 502 })
  }
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const DELETE = handle
export const PATCH = handle
export const OPTIONS = handle


