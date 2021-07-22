import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import _isArray from 'lodash/isArray'
import _parseInt from 'lodash/parseInt'

export const FORMAT_HH_MM_SS = 'hh:mm:ss'
export const FORMAT_SS = 'ss'

function getFormattedTimer (durationMs, format, isReady) {
  //
  if (!isReady) {
    return '00h 00m 00s'
  }

  const hours = _parseInt(Math.floor((durationMs / 1000 / 60 / 60)))
  const minutes = _parseInt(Math.floor((durationMs / 1000 / 60) % 60))
  const seconds = _parseInt(Math.floor((durationMs / 1000) % 60))

  const formatHours = (hours < 10 ? '0' : '') + hours
  const formatMinutes = (minutes < 10 ? '0' : '') + minutes
  const formatSeconds = (seconds < 10 ? '0' : '') + seconds
  const HH_MM_SS = `${formatHours}h ${formatMinutes}m ${formatSeconds}s`

  switch (format) {
    case FORMAT_HH_MM_SS:
      return HH_MM_SS
    case FORMAT_SS:
      return seconds
    default:
      return HH_MM_SS
  }
}

function CountdownTimer ({ timerClass, durationMs, format }) {
  //
  const [isReady, setReady] = useState(false)
  const [duration, setDuration] = useState(durationMs)
  const itemClass = _isArray(timerClass) ? timerClass.join(' ') : ''

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDuration(duration - 1000)
    }, 1000)

    if (!isReady) {
      setReady(true)
    }

    return () => {
      clearTimeout(timeout)
    }
  })

  return (
    <span className={`countdown-timer ${itemClass}`}>
      {getFormattedTimer(duration, format, isReady)}
    </span>
  )
}

CountdownTimer.defaultProps = {
  durationMs: 0,
  enableTimer: true,
  format: FORMAT_HH_MM_SS,
}

CountdownTimer.propTypes = {
  enableTimer: PropTypes.bool,
  timerClass: PropTypes.array,
  durationMs: PropTypes.number.isRequired,
  format: PropTypes.string,
}

export default CountdownTimer
