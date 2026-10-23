// AWS builds replace this module through a Vite loader. The default
// remains the existing Sites/Cloudflare runtime.
export async function getBindings() {
  const { env } = await import('cloudflare:workers');
  return env;
}
