import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ext_user_id = searchParams.get('ext_user_id');

  if (!ext_user_id) {
    return NextResponse.json({ error: 'Missing ext_user_id' }, { status: 400 });
  }

  const cpxAppId = process.env.CPX_APP_ID || '12345'; // Example default
  const cpxSecureHash = process.env.CPX_SECURE_HASH || 'mock_secure_hash';
  const textToHash = `${ext_user_id}-${cpxSecureHash}`;
  const secure_hash = crypto.createHash('md5').update(textToHash).digest('hex');

  return NextResponse.json({ ext_user_id, secure_hash, app_id: cpxAppId });
}
