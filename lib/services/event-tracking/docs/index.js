/* eslint-disable import/prefer-default-export */
import { readFile } from 'fs'
import _isFunction from 'lodash/isFunction'
import { Map, fromJS } from 'immutable'
import {
  buildEventVideoPlayed,
  buildEventShelfExpanded,
  buildEventVideoVisited,
  buildEventSeriesVisited,
  buildEventVideoView,
  buildEventPlaylistVideoAdded,
  buildEventGiftVideoViewed,
  buildEventPageViewed,
} from '../index'

const auth = Map({
  uid: 1,
})
const page = Map({
  title: 'Test Page',
})
const location = {
  hash: 'hash',
  pathname: 'pathname',
  search: 'search',
}
const windowLocation = {
  href: 'http://localhost/test?test=1#test',
}
const video = Map({
  id: 2,
})
const shelf = Map({
  event: 'Shelf Expanded',
  type: 'test',
  id: 3,
})
const siteSegment = Map({
  id: 4,
  name: 'test',
})
const series = Map({
  id: 5,
})
const media = Map({
  id: 6,
})
const date = new Date()

export function generateMd (cb) {
  const sections = fromJS([
    {
      title: 'Video Played',
      event: buildEventVideoPlayed({
        auth,
        page,
        location,
        windowLocation,
        date,
        video,
      }),
    },
    {
      title: 'Shelf Expanded',
      event: buildEventShelfExpanded({
        auth,
        page,
        location,
        windowLocation,
        date,
        shelf,
      }),
    },
    {
      title: 'Video Visited',
      event: buildEventVideoVisited({
        auth,
        page,
        location,
        windowLocation,
        date,
        id: video.get('id'),
      }),
    },
    {
      title: 'Video View Qualified',
      event: buildEventVideoView({
        auth,
        page,
        location,
        windowLocation,
        date,
        video,
        media,
      }, 'Qualified'),
    },
    {
      title: 'Playlist Video Added',
      event: buildEventPlaylistVideoAdded({
        auth,
        page,
        location,
        windowLocation,
        date,
        id: video.get('id'),
      }),
    },
    {
      title: 'Gift Video Viewed',
      event: buildEventGiftVideoViewed({
        auth,
        page,
        location,
        windowLocation,
        date,
        siteSegment,
      }),
    },
    {
      title: 'Series Visited',
      event: buildEventSeriesVisited({
        auth,
        page,
        location,
        windowLocation,
        date,
        id: series.get('id'),
      }),
    },
    {
      title: 'Page Viewed',
      event: buildEventPageViewed({
        auth,
        page,
        location,
        windowLocation,
        date,
      }),
    },
  ])
  readFile(`${__dirname}/template.md`, 'utf8', (err, data = '') => {
    if (!_isFunction(cb)) {
      return
    }
    const eventString = sections.reduce(reduceEventString, '')
    cb(err, data + eventString)
  })
}

function reduceEventString (reduction, section) {
  const separator = '\n\n'
  const blockStart = '```javascript\n'
  const blockEnd = '\n```'
  return (
    `${reduction
    }##${section.get('title')}${separator}${blockStart}${JSON.stringify(
      section.get('event').toJS(),
      null,
      '  ',
    )}${blockEnd}${separator}`
  )
}
