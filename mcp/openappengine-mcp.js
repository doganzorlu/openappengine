#!/usr/bin/env node
/**
 * OpenAppEngine MCP Server
 * Standard Model Context Protocol (MCP) Server for OpenAppEngine.
 * Connects AI assistants (Claude Desktop, Cursor, Antigravity, etc.) to your site.
 */

const http = require('http');
const https = require('https');
const readline = require('readline');

const API_BASE = process.env.OPENAPPENGINE_URL || 'http://localhost:11001';
const API_TOKEN = process.env.OPENAPPENGINE_TOKEN || 'oae_admin_live_token_2026';

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
        version: '1.0.0',
      },
      capabilities: {
        tools: {},
      },
    });
    return;
  }

  if (method === 'notifications/initialized') {
    // No-op for initialized notification
    return;
  }

  if (method === 'tools/list') {
    try {
      const data = await apiRequest('/api/v1/mcp/tools');
      sendResponse(id, { tools: data.tools || [] });
    } catch (e) {
      sendResponse(id, null, { code: -32603, message: e.message });
    }
    return;
  }

  if (method === 'tools/call') {
    try {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};
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

  // Fallback for unknown methods
  if (id !== undefined) {
    sendResponse(id, null, { code: -32601, message: `Method not found: ${method}` });
  }
});
