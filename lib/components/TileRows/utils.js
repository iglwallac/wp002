import { List, fromJS } from 'immutable'
import { SHELF_BUTTON } from 'services/upstream-context'

function createShelfId ({ id, rowId }) {
  return `${id}.row${rowId}`
}

export function getClassName (inputClassName) {
  return ['tile-rows'].concat(inputClassName || []).join(' ')
}

export function onClickCloseShelf (props) {
  const {
    storeKey,
    setTileRowsActiveId,
    setTileRowsRowActiveId,
    setShelfVisibleId,
  } = props

  setTileRowsActiveId(storeKey, null)
  setTileRowsRowActiveId(storeKey, null)
  setShelfVisibleId(null, false)
}

export function onChangePrevNext (props, e, active, id, type, rowId) {
  const { shelf } = props

  if (shelf.get('visible')) {
    onChangeTitleActive(props, e, active, id, type, rowId)
  }
}

export function onChangeTitleActive (
  props,
  e,
  active,
  id,
  type,
  rowId,
  upstreamContext,
  itemIndex,
  itemId,
  itemContextType,
) {
  const {
    app,
    auth,
    user,
    page,
    shelf,
    storeKey,
    getShelfData,
    setShelfVisibleId,
    setTileRowsActiveId,
    setEventShelfExpanded,
    setTileRowsRowActiveId,
  } = props

  const jwt = auth.get('jwt')
  const language = (user.getIn(['data', 'language'], List()) || List()).toJS()

  setTileRowsActiveId(storeKey, active ? id : null)
  setTileRowsRowActiveId(storeKey, active ? rowId : null)

  if (!active) {
    setShelfVisibleId(null, false)
    return
  }

  if (active && upstreamContext && upstreamContext.size > 0) {
    const idPropertyName = itemContextType === 'video'
      ? 'videoId'
      : 'seriesId'
    let newContext = upstreamContext.mergeDeep(fromJS({
      [idPropertyName]: itemId,
      itemIndex,
      element: SHELF_BUTTON,
    }))
      .delete('storeKey')

    if (upstreamContext.get('destId') < 0) {
      newContext = newContext.delete('destId')
    }

    setEventShelfExpanded({ auth, location, shelf, page, app, upstreamContext: newContext })
  }

  getShelfData({ id, language, contentType: type, auth: jwt })
  setShelfVisibleId(createShelfId({ id, rowId }), true)
}

export function getBottomPosition (domNode) {
  let bottomPosition = domNode.getBoundingClientRect().bottom

  if (window) {
    const scrollYPosition =
      window.pageYOffset || document.documentElement.scrollTop || window.scrollY
    bottomPosition += scrollYPosition
  }
  return bottomPosition
}
