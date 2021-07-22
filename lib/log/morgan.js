/**
 * Express middleware that creates a morgan logger
 */
import { getLogger } from 'log'
import morgan from 'morgan'

export default function middleware (options = {}) {
  const format = options.format || 'combined'
  return morgan(format, {
    stream: {
      write: function handleStreamWrite (str) {
        getLogger()
          .child({ type: 'http' })
          .info(str)
      },
    },
  })
}
