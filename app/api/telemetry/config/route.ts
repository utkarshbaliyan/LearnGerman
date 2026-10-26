import configuration from '@/deploy/aws/observability-public.json';
export const dynamic = 'force-dynamic';
export async function GET() {
  return Response.json({ enabled: process.env.LESELAUT_RUM_ENABLED === '1',
    region: configuration.region, appMonitorId: configuration.appMonitorId,
    identityPoolId: configuration.identityPoolId },
  { headers: { 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } });
}
