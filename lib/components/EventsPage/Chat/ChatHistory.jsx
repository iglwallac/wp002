import PropTypes from 'prop-types'
import _isString from 'lodash/isString'
import _isNumber from 'lodash/isNumber'
import { distanceInWords, format } from 'date-fns'
import ImmutablePropTypes from 'react-immutable-proptypes'
import React, { useRef, useState, useCallback, useLayoutEffect, useEffect } from 'react'
import { requestAnimationFrame } from 'services/animate'
import { Button, TYPES } from 'components/Button.v2'
import { ICON_TYPES } from 'components/Icon.v2'

const MESSAGE_PREFIX = ': '
const NUM_COLORS = 10

function getColor ({ current }, who) {
  current[who] = current[who] // eslint-disable-line
    || Math.floor(Math.random() * NUM_COLORS) + 1
  return current[who]
}

function getScrollPosition (el, index) {
  if (_isNumber(index)) {
    const children = el.childNodes || []
    const child = children[index]
    return (child && child.offsetTop - el.offsetTop) || 0
  }
  const { scrollHeight, clientHeight } = el
  const maxScrollTop = scrollHeight - clientHeight
  return maxScrollTop > 0 ? maxScrollTop : 0
}

function isScrollAtBottom ($content) {
  const scrollPos = $content.scrollTop
  const scrollBottom = $content.scrollHeight - $content.clientHeight
  return scrollBottom <= 0 || scrollPos + 1 > scrollBottom
}

function formatDate (date) {
  const then = new Date(date)
  const now = new Date()
  if (now.getDate() - then.getDate() >= 1) {
    return distanceInWords(now, then)
  }
  return format(then, 'h:mm')
}

function renderItem (item, colors) {
  const who = item.get('Who')
  const what = item.get('What', '')
  const when = item.get('When', '')
  const image = item.get('ImageUrl')
  const color = getColor(colors, who)
  return (
    <li key={when} className="message-item">
      <div className="message">
        <div
          style={{ backgroundImage: `url(${image})` }}
          className="profile-image"
          role="presentation"
        />
        <p className="message-text">
          <strong className={`nickname nickname-color-${color}`}>
            {who}{MESSAGE_PREFIX}
          </strong>
          {_isString(what) ? what : '...'}
        </p>
      </div>
      <aside className="time">
        {formatDate(when)}
      </aside>
    </li>
  )
}

export default function ChatHistory ({
  fetchHistory,
  messageList,
  username,
}) {
  //
  const prevList = useRef(messageList)
  const timer = useRef(null)
  const $elem = useRef(null)
  const colors = useRef({})

  const [showScroll, setScroll] = useState(false)

  const onScroll = useCallback(() => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      const { current: el } = $elem
      if (!el) return
      const isAtBottom = isScrollAtBottom(el)
      setScroll(!isAtBottom)
      if (el.scrollTop < 1) {
        fetchHistory()
      }
    }, 500)
  }, [$elem.current])

  const scroll = useCallback((index) => {
    const { current: el } = $elem
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollTop = getScrollPosition(el, index)
      setScroll(false)
    })
  }, [$elem.current])

  useEffect(() => {
    return function clearTimer () {
      clearTimeout(timer.current)
    }
  }, [])

  useLayoutEffect(() => {
    const { current: el } = $elem
    const { current } = prevList

    if (!el) {
      return
    }

    const currentRev = current.reverse()
    const messagesRev = messageList.reverse()
    const index = messagesRev.findIndex((m, i) => (
      m !== currentRev.get(i)
    ))

    const total = messageList.size - 1
    const trueIndex = total - index
    // set new messagelist ref
    prevList.current = messageList
    // if we aren't at the bottom of messages
    // and a new message comes in that isn't ours,
    // ignore scrolling down.
    if (showScroll && trueIndex === total) {
      const message = messageList.get(trueIndex)
      if (message.get('Who') !== username) {
        return
      }
    }
    requestAnimationFrame(() => {
      el.scrollTop = getScrollPosition(el, trueIndex)
    })
  }, [messageList])

  return (
    <div className="chat__history">
      <ul
        className="chat__content"
        onScroll={onScroll}
        ref={$elem}
      >{messageList.map(m => renderItem(m, colors))}
      </ul>
      {showScroll ? (
        <Button
          icon={ICON_TYPES.CHEVRON_DOWN}
          type={TYPES.ICON_PRIMARY}
          className="chat__scroll"
          onClick={scroll}
        />
      ) : null}
    </div>
  )
}

ChatHistory.propTypes = {
  fetchHistory: PropTypes.func.isRequired,
  messageList: ImmutablePropTypes.list.isRequired,
}
