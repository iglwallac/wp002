import { map as mapPromise } from 'bluebird'
import { get as apiGet, TYPE_BROOKLYN_JSON } from 'api-client'

export async function getTerm (options = {}) {
  const { id, language } = options
  const { body } = await apiGet(`term/${id}`, { language }, {}, TYPE_BROOKLYN_JSON)
  return body
}

export async function getTerms (options = {}) {
  const { ids, language } = options
  return mapPromise(ids, async (id) => {
    try {
      return await getTerm({ id, language })
    } catch (e) {
      return []
    }
  })
}
