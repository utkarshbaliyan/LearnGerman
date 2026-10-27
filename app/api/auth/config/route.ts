import { captchaConfig } from '@/app/lib/auth-captcha';

export function GET() {
  const headers = { 'cache-control': 'private, no-store' };
  try { return Response.json(captchaConfig(process.env), { headers }); }
  catch { return Response.json({ error: 'Security check is temporarily unavailable.' }, { status: 503, headers }); }
}
