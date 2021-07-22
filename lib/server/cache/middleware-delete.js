import _isArray from 'lodash/isArray'
import _size from 'lodash/size'
import { createInvalidation } from 'cloudfront'
import { setResNoCache } from 'server/common'

const MAX_ITEMS_SIZE = 20
const ACCESS_KEY = 'mwQfyzadcq'

export default function middleware (options = {}) {
  const { cloudfrontDistributionId } = options
  if (!cloudfrontDistributionId) {
    throw new Error('The cloudfrontDistributionId option is required')
  }
  return async function route (req, res) {
    const { body = {} } = req
    const { accessKey, items } = body
    setResNoCache(res)
    if (accessKey !== ACCESS_KEY) {
      res.status(403)
      res.json({
        name: 'Forbidden',
        message: 'The accessKey field is not valid',
      })
      return
    }
    if (!_isArray(items) || _size(items) > MAX_ITEMS_SIZE) {
      res.status(400)
      res.json({
        name: 'Items Error',
        message: `The items field must be an array less than or equal to ${MAX_ITEMS_SIZE}`,
      })
      return
    }
    try {
      const data = await createInvalidation({
        DistributionId: cloudfrontDistributionId,
        InvalidationBatch: {
          Paths: {
            Quantity: _size(items),
            Items: items,
          },
          CallerReference: `${Date.now()}`,
        },
      })
      res.status(200)
      res.json(data)
    } catch (e) {
      res.status(400)
      res.json({
        name: 'Invalidation Error',
        message: e.message,
      })
    }
  }
}
