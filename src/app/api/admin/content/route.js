'use strict';

import { cookies } from 'next/headers';

const GH_API = 'https://api.github.com';

function ghHeaders() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

function contentUrl() {
  const { GITHUB_OWNER, GITHUB_REPO, GITHUB_CONTENT_PATH, GITHUB_BRANCH = 'main' } = process.env;
  return `${GH_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_CONTENT_PATH}?ref=${GITHUB_BRANCH}`;
}

async function checkAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  if (!session?.value || session.value !== process.env.ADMIN_PASSWORD) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const authErr = await checkAuth();
  if (authErr) return authErr;

  const res = await fetch(contentUrl(), { headers: ghHeaders(), cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json();
    return Response.json({ ok: false, error: err.message }, { status: res.status });
  }
  const { content } = await res.json();
  const decoded = JSON.parse(Buffer.from(content, 'base64').toString('utf8'));
  return Response.json(decoded, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request) {
  const authErr = await checkAuth();
  if (authErr) return authErr;

  const newContent = await request.json();
  if (!newContent || typeof newContent !== 'object') {
    return Response.json({ ok: false, error: 'Invalid content' }, { status: 400 });
  }

  // Fetch current SHA (required for GitHub update)
  const shaRes = await fetch(contentUrl(), { headers: ghHeaders(), cache: 'no-store' });
  if (!shaRes.ok) {
    return Response.json({ ok: false, error: 'Could not fetch current file from GitHub' }, { status: 500 });
  }
  const { sha } = await shaRes.json();

  const encoded = Buffer.from(JSON.stringify(newContent, null, 2)).toString('base64');
  const { GITHUB_OWNER, GITHUB_REPO, GITHUB_CONTENT_PATH, GITHUB_BRANCH = 'main' } = process.env;

  const putRes = await fetch(
    `${GH_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_CONTENT_PATH}`,
    {
      method: 'PUT',
      headers: ghHeaders(),
      body: JSON.stringify({
        message: 'chore: update content via admin panel',
        content: encoded,
        sha,
        branch: GITHUB_BRANCH,
      }),
    },
  );

  if (!putRes.ok) {
    const err = await putRes.json();
    return Response.json({ ok: false, error: err.message }, { status: putRes.status });
  }
  return Response.json({ ok: true });
}
