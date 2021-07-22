import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { getBoundActions } from 'actions'
import { connect as connectStaticText } from 'components/StaticText/connect'

const zeroPad = (num, places) => String(num).padStart(places, '0')

const Countdown = ({ staticText, countdown, localeTitleDate, title, speakerName,
  getLiveAccessNextEvent, language }) => {
  const [remaining, setRemaining] = useState(countdown)

  const requestRef = useRef()
  const previousTimeRef = useRef()
  const timeoutRef = useRef()
  const animate = (time) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current
      setRemaining(prevRemaining => (Math.max(0, prevRemaining - deltaTime)))
    }
    previousTimeRef.current = time
    requestRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    clearTimeout(timeoutRef.current)
    if (countdown) {
      timeoutRef.current = setTimeout(() => {
        getLiveAccessNextEvent({ language })
      }, countdown)
    }
  }, [countdown])

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate)
    return () => {
      clearTimeout(timeoutRef.current)
      cancelAnimationFrame(requestRef.current)
    }
  }, [])

  const days = Math.floor(remaining / (24 * 60 * 60 * 1000))
  const daysms = remaining % (24 * 60 * 60 * 1000)
  const hours = Math.floor((daysms) / (60 * 60 * 1000))
  const hoursms = remaining % (60 * 60 * 1000)
  const minutes = Math.floor((hoursms) / (60 * 1000))
  const minutesms = remaining % (60 * 1000)
  const seconds = Math.floor((minutesms) / (1000))

  const daysLabel = (days === 1) ? staticText.getIn(['data', 'day']) : staticText.getIn(['data', 'days'])
  const hoursLabel = (hours === 1) ? staticText.getIn(['data', 'hour']) : staticText.getIn(['data', 'hours'])
  const minutesLabel = (minutes === 1) ? staticText.getIn(['data', 'minute']) : staticText.getIn(['data', 'minutes'])
  const secondsLabel = (seconds === 1) ? staticText.getIn(['data', 'second']) : staticText.getIn(['data', 'seconds'])

  return (
    <div className="live-page-countdown__component">
      <div className="live-page-countdown__container">
        <div className="live-page-countdown__text_container">
          <div className="live-page-countdown__date">{localeTitleDate}</div>
          <div className="live-page-countdown__title">{title}</div>
          {speakerName &&
            <div className="live-page-countdown__speaker">{staticText.getIn(['data', 'with'])} {speakerName}</div>
          }
        </div>
        <div className="live-page-countdown__timer_container">
          <div className="live-page-countdown__item">
            <span className="live-page-countdown__time">{zeroPad(days, 2)}:</span>
            <div className="live-page-countdown__label">{daysLabel}</div>
          </div>
          <div className="live-page-countdown__item">
            <span className="live-page-countdown__time">{zeroPad(hours, 2)}:</span>
            <div className="live-page-countdown__label">{hoursLabel}</div>
          </div>
          <div className="live-page-countdown__item">
            <span className="live-page-countdown__time">{zeroPad(minutes, 2)}:</span>
            <div className="live-page-countdown__label">{minutesLabel}</div>
          </div>
          <div className="live-page-countdown__item">
            <span className="live-page-countdown__time">{zeroPad(seconds, 2)}</span>
            <div className="live-page-countdown__label-seconds">{secondsLabel}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

Countdown.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default compose(
  connectRedux(
    (state) => {
      const language = state.user.getIn(['data', 'language', 0], 'en')
      const countdown = state.liveAccessEvents.getIn(['eventDetails', language, 'data', 'countdown'])
      const localeTitleDate = state.liveAccessEvents.getIn(['eventDetails', language, 'data', 'event', 'localeTitleDate'])
      const title = state.liveAccessEvents.getIn(['eventDetails', language, 'data', 'event', 'title'])
      const speakerName = state.liveAccessEvents.getIn(['eventDetails', language, 'data', 'event', 'speakerName'])
      const isAnonymous = !state.auth.get('username')
      const hasEntitlements = state.auth.get('subscriptions') && state.auth.get('subscriptions').size > 0
      return {
        isAnonymous,
        user: state.user,
        language,
        hasEntitlements,
        countdown,
        localeTitleDate,
        title,
        speakerName,
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setPageSeo: actions.page.setPageSeo,
        getLiveAccessSchedule: actions.liveAccessEvents.getLiveAccessSchedule,
        getLiveAccessSessionDetails: actions.liveAccessEvents.getLiveAccessSessionDetails,
        setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
        getLiveAccessNextEvent: actions.liveAccessEvents.getLiveAccessNextEvent,
      }
    },
  ),
  connectStaticText({ storeKey: 'livePage' }),
)(Countdown)
