// Domain tests already stub the HTTP transport. Keep their scope independent
// of deployment bindings; launch-readiness.test.mjs tests the real usage gate.
export const providerTransport = {
  name: 'isolated-provider-transport', enforce: 'pre',
  transform(_code, id) {
    if (id.endsWith('/app/api/tutor/_usage.ts')) return 'export const providerFetch = (input, init) => fetch(input, init);';
  },
};
