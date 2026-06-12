import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'database.json');

async function readDatabase() {
  try {
    const raw = await fs.readFile(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Arquivo inexistente ou corrompido: recomeça com lista vazia.
    return [];
  }
}

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido.' }, { status: 400 });
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return NextResponse.json({ ok: false, error: 'Payload inválido.' }, { status: 400 });
  }

  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    const db = await readDatabase();

    const record = {
      id: `ybt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      savedAt: new Date().toISOString(),
      ...payload,
    };
    db.push(record);

    await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');

    return NextResponse.json({ ok: true, id: record.id, total: db.length });
  } catch (err) {
    console.error('Erro ao salvar avaliação:', err);
    return NextResponse.json(
      { ok: false, error: 'Erro ao gravar os dados no servidor.' },
      { status: 500 }
    );
  }
}
