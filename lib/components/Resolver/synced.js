import { RESOLVER_TYPE_STATIC } from 'services/resolver/types'

export default isSynced

export function isSynced (resolver, location) {
  const resolvedId = resolver.getIn(['data', 'id'])
  const resolvedPath = resolver.getIn(['data', 'path'])
  const resolvedType = resolver.getIn(['data', 'type'])
  const idIsResolved = resolvedId && resolvedId > -1
  return (
    resolvedPath === location.pathname &&
    (idIsResolved || resolvedType === RESOLVER_TYPE_STATIC)
  )
}
