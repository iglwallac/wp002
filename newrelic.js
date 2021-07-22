/**
 * New Relic agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
const config = {
  agent_enabled: process.env.NEW_RELIC_ENABLED || !!process.env.NEW_RELIC_LICENSE_KEY,
  rules: {
    ignore: ['/server-status'],
  },
  browser_monitoring: {
    enable: true,
  },
  error_collector: {
    enabled: true,
    ignore_status_codes: [400, 401, 403, 404, 405, 406, 410, 501],
  },
  distributed_tracing: {
    enabled: true,
  },
  transaction_tracer: {
    enabled: true,
    record_sql: 'obfuscated',
  },
  slow_sql: {
    enabled: true,
  },
  logging: {
    level: 'error',
    filepath: 'stdout',
  },
}

export default { config }
