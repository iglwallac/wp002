import _assign from 'lodash/assign'
import _cloneDeep from 'lodash/cloneDeep'
import _get from 'lodash/get'
import _set from 'lodash/set'
import _map from 'lodash/map'
import _size from 'lodash/size'
import _find from 'lodash/find'
import _uniqBy from 'lodash/uniqBy'
import _compact from 'lodash/compact'
import _replace from 'lodash/replace'
import _reduce from 'lodash/reduce'
import _findIndex from 'lodash/findIndex'
import _parseInt from 'lodash/parseInt'
import { campaignShouldRender, getVariation } from 'services/testarossa'
import { createModel as createTileModel } from 'services/tile'
import { getNodes } from 'services/node'
import { get as apiGet, TYPE_BROOKLYN_JSON } from 'api-client'
import { get as getConfig } from 'config'
import { Map, List } from 'immutable'

export const ROW_TYPE_MY_SERIES = 'my-series'
export const ROW_TYPE_PRACTICES = 'my-practices'
export const ROW_TYPE_NOTEWORTHY = 'new-noteworthy'
export const ROW_TYPE_FEATURED_VIDEOS = 'featured-videos'
export const ROW_TYPE_TOP_VIDEO = 'pine-top-video'
export const ROW_TYPE_TOP_VIDEOS = 'pine-top-videos'
export const ROW_TYPE_MERCHANDISING_CONTENT = 'merchandising-content'
export const ROW_TYPE_FEATURED_CONTENT_IMPRESSION =
  'featured-content-impression'
export const ROW_TYPE_FEATURED_CONTENT_IMPRESSION_ROW =
  'featured-content-impression-row'
export const ROW_TYPE_SUBCAT = 'pine-subcat'
export const ROW_TYPE_PERSON = 'pine-person'
export const ROW_TYPE_FACET = 'pine-facet'
export const ROW_TYPE_CENTER = 'pine-center'
export const ROW_TYPE_LATEST_PROMOTED_EPISODES = 'latest-promoted-episodes'
export const ROW_TYPE_RECENTLY_WATCH = 'recently-watched'
export const ROW_TYPE_MY_PLAYLIST = 'my-playlist'
export const ROW_TYPE_RECENTLY_ADDED_VIDEOS = 'recently-added-videos'

export const MEMBER_HOME_LESS_LIKE_TERM = 'member-home-less-like-term'

const config = getConfig()

const SCHEMA = {
  _dataError: null,
  rows: [],
}

const SCHEMA_ROW = {
  campaignId: null,
  destId: -1,
  destPath: null,
  destType: null,
  rowLabel: null,
  rowType: null,
  totalCount: 0,
  payload: [],
  viewMode: 'normal',
}

async function getRI103Row (result, language) {
  if (campaignShouldRender({ campaign: 'RI-103' })) {
    const variation = getVariation({ campaign: 'RI-103' })
    const nids = _get(variation, ['data', 'config', 'value', 'nids'], [])
    const rowLabel = _get(variation, ['data', 'config', 'value', 'label'], '')
    if (_size(nids) && rowLabel) {
      const payload = await getNodes({ ids: nids, asTile: true, language })
      const rows = _map(_get(result, 'rows', []), (row, index) => {
        _set(row, 'originalIndex', index)
        return row
      })
      const recentlyWatched = _find(rows, row => (
        row.rowType === 'recently-watched'
      ))
      const index = recentlyWatched ? 2 : 1
      rows.splice(index, 0, {
        originalIndex: _size(rows),
        rowType: 'ri-103',
        destId: -1,
        rowLabel,
        payload,
      })
      return _set(result, 'rows', rows)
    }
  }
  return result
}

function getRI104Title (data, auth) {
  if (campaignShouldRender({ campaign: 'RI-104' })) {
    const variation = getVariation({ campaign: 'RI-104' })
    if (variation.friendlyId === 0) {
      return data
    }
    const variationLabel = _get(variation, ['data', 'config', 'value', 'label'], '')
    const updatedRows = _reduce(data.rows, (rows, row) => {
      if (row.rowType === 'pine-top-videos' && variationLabel) {
        const newRow = row
        newRow.rowLabel = _replace(variationLabel, /\$\{user\}/, auth.get('username'))
        rows.push(newRow)
      } else {
        rows.push(row)
      }
      return rows
    }, [])
    const updatedData = data
    updatedData.rows = updatedRows
    return updatedData
  }
  return data
}

function getRI105Playlist (data, auth) {
  if (campaignShouldRender({ campaign: 'RI-105' })) {
    const variation = getVariation({ campaign: 'RI-105' })
    if (variation.friendlyId === 0) {
      return data
    }
    const variationLabel = _get(variation, ['data', 'config', 'value', 'rowLabel'], '')
    const variationIndex = _get(variation, ['data', 'config', 'value', 'rowIndex'], 1)
    const updatedRows = data.rows.reduce((rows, row) => {
      if (row.rowType === 'my-playlist' && variationLabel) {
        const newRow = row
        newRow.rowLabel = _replace(variationLabel, /\$\{user\}/, auth.get('username'))
        rows.push(newRow)
      } else {
        rows.push(row)
      }
      return rows
    }, [])
    const updatedData = data
    updatedData.rows = updatedRows
    const playlistRow = _find(updatedData.rows, row => row.rowType === 'my-playlist')
    if (playlistRow) {
      const playlistIndex = _findIndex(updatedData.rows, row => row.rowType === 'my-playlist')
      updatedData.rows.splice(playlistIndex, 1)
      updatedData.rows.splice(variationIndex, 0, playlistRow)
      return updatedData
    }
  }
  return data
}

async function getOriginalSeries (result, language) {
  if (campaignShouldRender({ campaign: 'WA-2' })) {
    const variation = getVariation({ campaign: 'WA-2' })
    const { data = {} } = variation
    const { nids = [], labels = {} } = data
    const payload = await getNodes({ ids: nids, asTile: true, language })
    const rowLabel = _get(labels, language, 'Popular Originals on Gaia')
    const rows = _map(_get(result, 'rows', []), (row, index) => {
      _set(row, 'originalIndex', index)
      return row
    })
    const recentlyWatched = _find(rows, row => (
      row.rowType === 'recently-watched'
    ))
    const index = recentlyWatched ? 2 : 1
    rows.splice(index, 0, {
      originalIndex: _size(rows),
      rowType: 'original-series',
      destId: -1,
      rowLabel,
      payload,
    })
    return _set(result, 'rows', rows)
  }
  return result
}

export const DEFAULT_WIDTH = 12

export async function get (options) {
  try {
    const {
      auth,
      language,
      variantId,
      experimentId,
      experimentVersion,
      width = DEFAULT_WIDTH,
    } = options

    const { disableImpressionCap } = config.features
    const path = _get(config, ['services', 'memberHome', 'path'], '')
    const data = { width, language, experimentId, variantId, experimentVersion, view: 'list', disableImpressionCap }
    const res = await apiGet(path, data, { auth }, TYPE_BROOKLYN_JSON)
    const result = handleResponse(res)
    const resultWithOriginalSeries = await getOriginalSeries(result, language)
    const resultWithRow103 = await getRI103Row(resultWithOriginalSeries, language)
    const resultWithRI104 = getRI104Title(resultWithRow103, auth)
    const resultWithRI105 = getRI105Playlist(resultWithRI104, auth)
    return resultWithRI105
  } catch (e) {
    return handleResponse({}, true)
  }
}

export function handleResponse (res, _dataError) {
  const data = _get(res, 'body', {})
  return createModel(data, _dataError)
}

function createModel (data, _dataError) {
  return _assign(_cloneDeep(SCHEMA), {
    _dataError,
    rows: _map(_get(data, 'rows', []), row => createRowModel(row)),
  })
}

function createRowModel (row) {
  return _assign(_cloneDeep(SCHEMA_ROW), {
    campaignId: _parseInt(_get(row, 'campaignId', null)),
    destId: _parseInt(_get(row, 'destId', -1)),
    destPath: _get(row, 'destPath'),
    destType: _get(row, 'destType'),
    rowLabel: _get(row, 'rowLabel'),
    rowType: _get(row, 'rowType'),
    viewMode: _get(row, 'viewMode', 'normal'),
    rowDescription: _get(row, 'rowDescription'),
    totalCount: _parseInt(_get(row, 'totalCount', 0)),
    payload: createPayload(_get(row, 'payload', [])),
    merchEventId: _get(row, 'merchEventId'),
  })
}

export function createPayload (payload) {
  const compactPayload = _compact(payload)
  const tilesPayload = _map(compactPayload, createTileModel)
  return _uniqBy(tilesPayload, 'id')
}

export const buildContentMap = (videosOrSeriesState = Map(), ids = List(), language) => {
  const first = videosOrSeriesState.first() || Map()
  const processing = first.getIn([language, 'processing'])
  if (!videosOrSeriesState.size || processing) {
    return null
  }

  return ids.reduce((acc, item) => {
    const contentId = Number(item.get('id'))
    const content = videosOrSeriesState.getIn([contentId, language, 'data'], Map())
    return acc.set(contentId, content)
  }, Map())
}
