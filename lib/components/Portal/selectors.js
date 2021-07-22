import { Map, List } from 'immutable'
import parseInt from 'lodash/parseInt'

export function selectTitle ({ pmSection, pmScreen, user }) {
  const language = user.getIn(['data', 'language', 0], 'en')
  const sectionId = pmScreen.getIn(['portal', language, 'data', 'sectionIds', 0], '')
  const section = pmSection.getIn([sectionId, 'data'], Map())
  return section.getIn(['data', 'content', 0, 'label'], '')
}

export function selectVideos ({ pmSection, pmScreen, pmList, videos, auth, user }) {
  const language = user.getIn(['data', 'language', 0], 'en')
  const sectionId = pmScreen.getIn(['portal', language, 'data', 'sectionIds', 0], '')
  const section = pmSection.getIn([sectionId, 'data'], Map())
  const listId = section.getIn(['data', 'content', 0, 'listId'], '')
  const items = pmList.getIn([listId, 'data', 'listItems'], List())

  return items.map((item, index) => {
    const id = item.get('id')
    const video = videos.get(parseInt(id), Map())
    const data = video.getIn([language, 'data'], null)
    if (data && index === 0) {
      const isFree = !auth.get('jwt')
      return data.set('isFree', isFree)
    }
    return data
  })
}
