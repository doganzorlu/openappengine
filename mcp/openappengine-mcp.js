#!/usr/bin/env node
/**
 * OpenAppEngine MCP Server
 * Standard Model Context Protocol (MCP) Server for OpenAppEngine with Live Visual Preview.
 * Connects AI assistants (Claude Desktop, Cursor, Antigravity, etc.) to your site.
 */

const http = require('http');
const https = require('https');
const readline = require('readline');
const { execSync } = require('child_process');
const fs = require('fs');

const API_BASE = process.env.OPENAPPENGINE_URL || 'http://localhost:11001';
const API_FRONTEND = process.env.OPENAPPENGINE_FRONTEND || 'http://localhost:11000';
const API_TOKEN = process.env.OPENAPPENGINE_TOKEN || 'oae_admin_live_token_2026';
const CHROME_BIN = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

function apiRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, API_BASE);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const payload = data ? JSON.stringify(data) : null;
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    if (payload) {
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = client.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (e) {
          resolve({ raw: body, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (payload) req.write(payload);
    req.end();
  });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

function sendResponse(id, result, error = null) {
  const response = { jsonrpc: '2.0', id };
  if (error) {
    response.error = error;
  } else {
    response.result = result;
  }
  process.stdout.write(JSON.stringify(response) + '\n');
}

rl.on('line', async (line) => {
  if (!line.trim()) return;

  let msg;
  try {
    msg = JSON.parse(line);
  } catch (e) {
    return;
  }

  const { id, method, params } = msg;

  if (method === 'initialize') {
    sendResponse(id, {
      protocolVersion: '2024-11-05',
      serverInfo: {
        name: 'openappengine-mcp',
        version: '1.2.0',
      },
      capabilities: {
        tools: {},
      },
    });
    return;
  }

  if (method === 'notifications/initialized') {
    return;
  }

  if (method === 'tools/list') {
    try {
      const data = await apiRequest('/api/v1/mcp/tools');
      const backendTools = data.tools || [];

      // Append Live Visual Preview tool
      const previewTool = {
        name: 'preview_page_screenshot',
        description: 'Visually inspect and verify the rendered web page layout, colors, typography and design by capturing a live headless screenshot. Returns the screenshot directly as an image so the AI agent can visually see what it created and evaluate design balance.',
        inputSchema: {
          type: 'object',
          properties: {
            site_slug: { type: 'string', description: 'Site slug (e.g. otizmuzikokulu)' },
            page_slug: { type: 'string', description: 'Page slug (leave empty for homepage)' },
            viewport: {
              type: 'string',
              enum: ['desktop', 'tablet', 'mobile'],
              default: 'desktop',
              description: 'Screen viewport device mode',
            },
          },
          required: ['site_slug'],
        },
      };

      sendResponse(id, { tools: [previewTool, ...backendTools] });
    } catch (e) {
      sendResponse(id, null, { code: -32603, message: e.message });
    }
    return;
  }

  if (method === 'tools/call') {
    const toolName = params?.name;
    const toolArgs = params?.arguments || {};

    // 1. Handle Visual Preview Tool
    if (toolName === 'preview_page_screenshot') {
      try {
        const siteSlug = toolArgs.site_slug || 'otizmuzikokulu';
        const pageSlug = toolArgs.page_slug || '';
        const viewport = toolArgs.viewport || 'desktop';

        const viewports = {
          desktop: { w: 1440, h: 900 },
          tablet: { w: 768, h: 1024 },
          mobile: { w: 375, h: 812 },
        };
        const dim = viewports[viewport] || viewports.desktop;

        const targetUrl = `${API_FRONTEND}/?site=${siteSlug}${pageSlug ? `&page=${pageSlug}` : ''}&viewport=${viewport}`;
        const tmpFile = `/tmp/mcp_snap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.png`;

        const cmd = `"${CHROME_BIN}" --headless=new --disable-gpu --window-size=${dim.w},${dim.h} --virtual-time-budget=3500 --screenshot="${tmpFile}" "${targetUrl}"`;
        execSync(cmd, { stdio: 'pipe' });

        if (!fs.existsSync(tmpFile)) {
          throw new Error('Screenshot file could not be generated');
        }

        const imgBuffer = fs.readFileSync(tmpFile);
        const base64Data = imgBuffer.toString('base64');
        fs.unlinkSync(tmpFile);

        sendResponse(id, {
          content: [
            {
              type: 'text',
              text: `[Visual Verification]: Successfully captured screenshot for '${siteSlug}' (page: '${pageSlug || 'home'}', viewport: '${viewport}', resolution: ${dim.w}x${dim.h}).\nURL: ${targetUrl}`,
            },
            {
              type: 'image',
              data: base64Data,
              mimeType: 'image/png',
            },
          ],
        });
      } catch (err) {
        sendResponse(id, {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Visual preview failed: ${err.message}`,
            },
          ],
        });
      }
      return;
    }

    // 2. Proxy other tools to backend
    try {
      const res = await apiRequest('/api/v1/mcp', 'POST', {
        name: toolName,
        arguments: toolArgs,
      });

      if (res.success) {
        sendResponse(id, {
          content: [
            {
              type: 'text',
              text: JSON.stringify(res.result, null, 2),
            },
          ],
        });
      } else {
        sendResponse(id, {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Error: ${res.error || 'Unknown error'}`,
            },
          ],
        });
      }
    } catch (e) {
      sendResponse(id, null, { code: -32603, message: e.message });
    }
    return;
  }

  if (id !== undefined) {
    sendResponse(id, null, { code: -32601, message: `Method not found: ${method}` });
  }
});
