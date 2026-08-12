// Supabase Edge Function: 상담 신청(consultations) INSERT 시 Database Webhook이 호출합니다.
// 관리자에게 알림 메일, 신청자에게 확인 메일을 Resend로 발송합니다.

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET')!;
// TODO: Resend 도메인 인증 완료 후 ontheway@gmail.com으로 변경하세요.
// 인증 전에는 Resend 계정 가입 이메일로만 발송이 허용됩니다.
const ADMIN_EMAIL = 'bdslee72@gmail.com';

Deno.serve(async (req) => {
  if (req.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  const payload = await req.json();
  const record = payload.record;

  const adminEmail = sendEmail({
    to: ADMIN_EMAIL,
    subject: '[첫 런칭을 위한 30일 챌린지] 새 상담 신청이 접수되었습니다',
    html: `
      <p>새로운 상담 신청이 접수되었습니다.</p>
      <ul>
        <li>이름: ${escapeHtml(record.name)}</li>
        <li>연락처: ${escapeHtml(record.phone)}</li>
        <li>이메일: ${escapeHtml(record.email)}</li>
        <li>현재 상황: ${escapeHtml(record.situation ?? '')}</li>
        <li>희망 결과: ${escapeHtml(record.goal ?? '')}</li>
      </ul>
    `,
  });

  const userEmail = sendEmail({
    to: record.email,
    subject: '상담 신청이 접수되었습니다',
    html: `
      <p>${escapeHtml(record.name)}님, 상담 신청이 정상적으로 접수되었습니다.</p>
      <p>24시간 내로 연락드리겠습니다.</p>
    `,
  });

  const results = await Promise.allSettled([adminEmail, userEmail]);
  return new Response(JSON.stringify({ results }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev',
      to,
      subject,
      html,
    }),
  });
  const body = await res.json();
  return { status: res.status, body };
}

function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
