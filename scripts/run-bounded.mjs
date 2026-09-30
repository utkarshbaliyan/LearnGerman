import { spawn } from 'node:child_process';

// Node is already required for the build; GNU timeout is absent on stock macOS.
const [limit, grace, command, ...args] = process.argv.slice(2);
function milliseconds(value) {
  const match = /^(\d+(?:\.\d+)?)(ms|s|m|h)?$/.exec(value ?? '');
  if (!match) throw new Error(`Invalid timeout duration: ${value}`);
  const duration = Number(match[1]) * ({ ms: 1, s: 1000, m: 60000, h: 3600000 }[match[2] ?? 's']);
  if (!Number.isFinite(duration) || duration <= 0) throw new Error('Timeout must be positive.');
  return duration;
}
const limitMs = milliseconds(limit), graceMs = milliseconds(grace);
if (!command) throw new Error('Expected timeout, kill grace, command and arguments.');
const grouped = process.platform !== 'win32';
const child = spawn(command, args, { stdio: 'inherit', detached: grouped });
let timedOut = false, failedToStart = false, forceKill;
function signalChild(signal) {
  if (!child.pid) return;
  try { if (grouped) process.kill(-child.pid, signal); else child.kill(signal); }
  catch (error) { if (error.code !== 'ESRCH') throw error; }
}
const timer = setTimeout(() => {
  timedOut = true;
  console.error(`Command exceeded ${limit}; stopping it.`);
  signalChild('SIGTERM');
  forceKill = setTimeout(() => signalChild('SIGKILL'), graceMs);
}, limitMs);
process.on('SIGINT', () => signalChild('SIGINT'));
process.on('SIGTERM', () => signalChild('SIGTERM'));
child.on('error', error => { failedToStart = true; console.error(error.message); });
child.on('close', (code, signal) => {
  clearTimeout(timer);
  clearTimeout(forceKill);
  process.exitCode = timedOut ? 124 : failedToStart ? 127 : code ?? (signal === 'SIGINT' ? 130 : 143);
});
