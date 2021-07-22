import React from 'react'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { Tabs, Tab } from 'components/Tabs'

const ScheduleItem = ({ scheduleItem }) => (
  <li className="event-details__schedule__item">
    <div className="event-details__schedule__item__time">
      {scheduleItem.get('sessionTime')}
    </div>
    <div>
      <div className="event-details__schedule__item__title">
        {scheduleItem.get('title')}
      </div>
      <div className="event-details__schedule__item__description">
        {scheduleItem.get('description')}
      </div>
    </div>
  </li>
)

const ScheduleList = ({ scheduleList }) => (
  <ul className="event-details__schedule-list">
    {
      scheduleList.map(item => (
        <ScheduleItem key={item} scheduleItem={item} />
      ))
    }
  </ul>
)

// eslint-disable-next-line no-unused-vars
const Schedule = ({ route, language, liveAccessEvents }) => {
  const scheduleDetails = liveAccessEvents.getIn(['eventDetails', language, 'data', 'event', 'tracks', '0', 'schedule'])
  const scheduleDetailsByDateDesktop = scheduleDetails.groupBy(x => x.get('localeLongDay'))
  const scheduleDetailsByDateMobile = scheduleDetails.groupBy(x => x.get('localeShortDay'))

  return (
    <div className="event-details__schedule">
      <div className="hide-in-mobile">
        <Tabs>
          {scheduleDetailsByDateDesktop.entrySeq().map(([date, scheduleList]) => (
            <Tab key={date} label={date}>
              <ScheduleList scheduleList={scheduleList} />
            </Tab>
          ))}
        </Tabs>
      </div>
      <div className="hide-in-desktop">
        <Tabs>
          {scheduleDetailsByDateMobile.entrySeq().map(([date, scheduleList]) => (
            <Tab key={date} label={date}>
              <ScheduleList scheduleList={scheduleList} />
            </Tab>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

export default compose(
  connectRedux(
    (state) => {
      return {
        liveAccessEvents: state.liveAccessEvents,
      }
    },
  ),
  connectStaticText({ storeKey: 'eventDetailsPage' }),
)(Schedule)
