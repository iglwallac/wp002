import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { fromJS } from 'immutable'
import get from 'lodash/get'
import Link from 'components/Link'
import { connect as connectStaticText } from 'components/StaticText/connect'
import IconV2, { ICON_TYPES } from 'components/Icon.v2'
import { isPastSession, getCurrentSessions, getPreviousSession, getNextThreeSessions } from 'services/live-access-events'

const TIME_FORMAT = { hour: 'numeric', minute: 'numeric' }
const TIME_RANGE_SEPARATOR = ' - '

function generateTimeString (language, startTime, endTime) {
  if (!startTime) {
    return 'Invalid Time'
  }
  let sessionTime = new Date(startTime).toLocaleTimeString(language, TIME_FORMAT)
  if (endTime) {
    // if have both a start and end time
    sessionTime += TIME_RANGE_SEPARATOR
    sessionTime += new Date(endTime).toLocaleTimeString(language, TIME_FORMAT)
  }
  return sessionTime
}

const scrollToRef = (ref) => {
  if (!global.BROWSER_TEST) {
    ref.current.scrollIntoView()
  }
}

export const ScheduleItem = ({ scheduleItem, isActive, isPast, isFirstActive,
  language, scroll }) => {
  const myRef = useRef(null)
  useEffect(() => {
    if (scroll && myRef.current) {
      setTimeout(() => { scrollToRef(myRef) }, 100)
      // scrollToRef(myRef)
    }
  },
  )
  return (
    <li
      ref={isFirstActive ? myRef : undefined}
      className={`live-access-schedule-list-item${isActive
        ? ' live-access-schedule-list-item--active' : ''}${isPast
        ? ' live-access-schedule-list-item--past' : ''}`}
    >
      <div
        className="live-access-schedule-list-item__time"
      >
        {generateTimeString(language, scheduleItem.get('startDate'), scheduleItem.get('endDate'))}
      </div>
      {scheduleItem.get('linkUrl') ?
        <Link
          target="_blank"
          directLink
          to={scheduleItem.get('linkUrl')}
        >
          <div className="live-access-schedule-list-item__title">
            {scheduleItem.get('title')}
          </div>
        </Link >
        : <div className="live-access-schedule-list-item__title">
          {scheduleItem.get('title')}
        </div>
      }
    </li >
  )
}

const ScheduleDay = ({ header, scheduleList, activeSessionIds, isActive, nowTs,
  language, scroll }) =>
  (
    <div className="live-access-schedule-day">
      <div className={`live-access-schedule-day__header${isActive ?
        ' live-access-schedule-day__header--active' : ''}`}
      >
        {header}
      </div>
      <ul className="live-access-schedule-list">
        {
          scheduleList.map(item => (
            <ScheduleItem
              key={item}
              scheduleItem={item}
              isFirstActive={activeSessionIds && activeSessionIds[0] === item.get('id')}
              isActive={activeSessionIds && activeSessionIds.includes(item.get('id'))}
              isPast={isPastSession(item.toJS(), nowTs)}
              language={language}
              scroll={scroll}
            />
          ))
        }
      </ul>
    </div>
  )

const getDateString = (time, language) => (
  `${(new Date(time)).toLocaleDateString(language, { weekday: 'long' })} ${
    (new Date(time)).toLocaleDateString(language, { month: 'numeric', day: 'numeric' })}`
)

const getDateStringForSessionFunction = useServerString => (useServerString ?
  session => session.localeLongDay :
  (session, language) => getDateString(session.startDate, language)
)

const groupByDateString = (sessions, language, getDateStringFunction) => {
  return sessions.reduce((schedule, session) => {
    const dateString = getDateStringFunction(session, language)
    const index = schedule.findIndex(scheduleItem =>
      scheduleItem.dateString === dateString)
    if (index > -1) {
      schedule[index].sessions.push(session)
    } else {
      schedule.push({
        dateString,
        sessions: [session],
      })
    }
    return schedule
  }, [])
}

const getShortList = (sessions, currentSessions, nowTs) => {
  const previousSession = getPreviousSession(sessions, nowTs)
  const previousSessionArray = previousSession ? [previousSession] : []
  const nextSessions = getNextThreeSessions(sessions, nowTs)
  return [...previousSessionArray, ...currentSessions, ...nextSessions]
}
const LiveAccessSchedule = (props) => {
  const { language, sessionList, nowTs,
    buttonUrl, buttonText, full, header, visible, closeHandler,
    staticText } = props
  const currentSessions = getCurrentSessions(sessionList.toJS(), nowTs)
  const activeSessionIds = currentSessions.map(session => get(session, 'id'))
  const currentDateString = getDateString(nowTs, language)
  const schedule = groupByDateString(full ?
    sessionList.toJS() : getShortList(sessionList.toJS(),
      currentSessions, nowTs), language, getDateStringForSessionFunction())

  return (
    <div className={`live-access-schedule${visible ? '' : ' live-access-schedule--hidden'}`}>
      <div className={`live-access-schedule__schedule-container${full ?
        ' live-access-schedule__schedule-container--full' : ''}`}
      >
        <div className="live-access-schedule__close live-access-schedule__close--mobile">
          <span className="live-access-schedule__close-link" onClick={closeHandler}>
            {staticText.getIn(['data', 'closeSchedule'])}
            <IconV2 type={ICON_TYPES.CLOSE} />
          </span>
        </div>
        <div className="live-access-schedule__close live-access-schedule__close--desktop">
          <span className="live-access-schedule__close-link" onClick={closeHandler}>
            {staticText.getIn(['data', 'hideSchedule'])}
            <IconV2 type={ICON_TYPES.CHEVRON_RIGHT} />
          </span>
        </div>
        <div className="live-access-schedule__header">
          {header}
        </div>
        <div className="live-access-schedule__link">
          {buttonText && buttonUrl &&
            <Link
              target="_blank"
              directLink
              text={buttonText}
              to={buttonUrl}
            />
          }
        </div>
        <div className="live-access-schedule__content">
          {
            schedule.map(day => (
              <ScheduleDay
                header={day.dateString}
                activeSessionIds={activeSessionIds}
                scheduleList={fromJS(day.sessions)}
                isActive={currentDateString === day.dateString}
                key={day.dateString}
                nowTs={nowTs}
                language={language}
                scroll={visible}
              />),
            )
          }
        </div>
      </div>
    </div>
  )
}

LiveAccessSchedule.propTypes = {
  language: PropTypes.string.isRequired,
  header: PropTypes.string,
  sessionList: PropTypes.object.isRequired,
  nowTs: PropTypes.number.isRequired,
  buttonUrl: PropTypes.string,
  buttonText: PropTypes.string,
  full: PropTypes.bool,
}

export default connectStaticText({ storeKey: 'liveAccessSchedule' })(LiveAccessSchedule)
