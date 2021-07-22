import { v4 as uuidv4 } from 'uuid'
import get from 'lodash/get'
import jwt from 'jsonwebtoken'
import replace from 'lodash/replace'
import { setResCache } from 'server/common'

function createToken (uuid, secret) {
  if (uuid) {
    return jwt.sign({ uuid }, secret)
  }
  return null
}

function verifyToken (token, secret) {
  if (token) {
    try {
      const t = jwt.verify(token, secret)
      const { uuid = null } = t
      return uuid
    } catch (_) {
      // ...
    }
  }
  return null
}

function getToken (auth, secret) {
  if (auth) {
    const authUuid = verifyToken(auth, secret)
    if (authUuid) {
      return {
        uuid: authUuid,
        token: auth,
      }
    }
  }
  const uuid = uuidv4()
  const token = createToken(uuid, secret)
  return { token, uuid }
}

export default function createMiddleware (config) {
  const secret = get(config, 'anonymousUuidSecret')

  if (!secret) {
    throw new Error('The anonymous uuid secret is required.')
  }

  return function middleware (req, res) {
    const rawAuth = req.get('Authorization')
    const auth = replace(rawAuth, /^Bearer\s+/i, '')
    const { uuid, token } = getToken(auth, secret)

    setResCache(res, {
      maxAge: 31536000,
      private: true,
    })

    res.type('application/json')
    res.status(200)
    res.json({ uuid, token })
  }
}
