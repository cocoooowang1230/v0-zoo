import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Example query params from CPX:
  // ?trans_id=12345&status=1&user_id=ext_user_id&amount_local=10&amount_usd=0.1&hash=some_hash
  const trans_id = searchParams.get('trans_id');
  const status = searchParams.get('status');
  const user_id = searchParams.get('user_id');
  const amount_local = searchParams.get('amount_local');
  const hash = searchParams.get('hash');

  const cpxSecureHash = process.env.CPX_SECURE_HASH || 'mock_secure_hash';

  // 1. Verify Hash
  if (trans_id && hash) {
    const expectedHash = crypto.createHash('md5').update(`${trans_id}-${cpxSecureHash}`).digest('hex');
    if (hash !== expectedHash && process.env.NODE_ENV === 'production') {
       return NextResponse.json({ error: 'Invalid hash' }, { status: 400 });
    }
  }

  // 2. Validate user and transaction
  if (!user_id || !trans_id) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  // 3. Status check (1 = Success, 2 = Screenout)
  if (status === '1') {
    // TODO: Connect to your actual database here (e.g. Prisma or Drizzle)
    // 
    // Example Database Logic:
    // const existingTx = await db.cpx_survey_transactions.findUnique({ where: { cpx_transaction_id: trans_id } })
    // if (existingTx) return NextResponse.json({ success: true, message: 'Already processed' })
    //
    // await db.$transaction(async (tx) => {
    //   // a) Create survey transaction record
    //   await tx.cpx_survey_transactions.create({
    //     data: {
    //       user_id: user_id, // map to internal user
    //       ext_user_id: user_id,
    //       cpx_transaction_id: trans_id,
    //       reward_amount: Number(amount_local),
    //       honey_amount: Number(amount_local) * 10, // conversion rate logic
    //       status: "COMPLETED",
    //       raw_payload: searchParams.toString()
    //     }
    //   })
    //   
    //   // b) Create global reward transaction
    //   await tx.reward_transactions.create({
    //     data: {
    //       user_id: user_id,
    //       type: "CPX_SURVEY_REWARD",
    //       amount: Number(amount_local) * 10
    //     }
    //   })
    //   
    //   // c) Update user balance
    //   await tx.user.update({
    //     where: { id: user_id },
    //     data: { honey_balance: { increment: Number(amount_local) * 10 } }
    //   })
    // })

    console.log(`[CPX Webhook] Success: Awarded user ${user_id} for transaction ${trans_id} amount ${amount_local}`);
  } else if (status === '2') {
    console.log(`[CPX Webhook] Screenout: User ${user_id} screened out from survey (trans_id: ${trans_id})`);
  }

  return NextResponse.json({ success: true, message: 'Postback processed' });
}

export async function POST(request: Request) {
  const body = await request.text();
  console.log(`[CPX Webhook POST received]`, body);
  // Implementation for POST would be similar to GET, parse the URL encoded body or JSON.
  return NextResponse.json({ success: true });
}
