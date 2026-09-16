// src/app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getToken(request: NextRequest): string | null {
  return (
    request.cookies.get('auth-token')?.value ||
    request.cookies.get('access_token')?.value ||
    request.cookies.get('token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '') ||
    null
  );
}

export async function GET(request: NextRequest) {
  const token = getToken(request);

  if (!token) {
    console.warn('[api/notifications] ⚠️  Pas de token');
    return NextResponse.json([]);
  }

  try {
    const res = await fetch(
      `${BACKEND_URL}/notifications/my-notifications`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      console.warn(`[api/notifications] Backend ${res.status}`);
      return NextResponse.json([]);
    }

    const raw = await res.json();

    // ✅ TOUJOURS renvoyer un tableau
    let data: unknown[] = [];

    if (Array.isArray(raw)) {
      data = raw;
    } else if (raw && typeof raw === 'object') {
      const obj = raw as any;
      if (Array.isArray(obj.data)) data = obj.data;
      else if (Array.isArray(obj.notifications)) data = obj.notifications;
      else if (Array.isArray(obj.items)) data = obj.items;
      else if (obj.data && Array.isArray(obj.data.notifications))
        data = obj.data.notifications;
      else if (obj.data && Array.isArray(obj.data.items))
        data = obj.data.items;
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('[api/notifications] Erreur:', err);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  const token = getToken(request);

  if (!token) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const res = await fetch(`${BACKEND_URL}/notifications/admin`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[api/notifications POST] Erreur:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}