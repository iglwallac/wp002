import React from 'react'
import { Tabs, Tab, TABS_TYPES } from 'components/Tabs'
import Expandable from 'components/Expandable'

const EventInformation = ({ headers, contents, selectedIndex = -1 }) => {
  return (
    <div className="event-information">
      <div className="hide-in-desktop">
        {headers.map((header, index) => (
          <Expandable key={header} header={header} initiallyExpanded={index === selectedIndex}>
            {contents[index]}
          </Expandable>
        ))}
      </div>
      <div className="hide-in-mobile">
        <Tabs type={TABS_TYPES.VERTICAL} noMobileSupport activeTab={selectedIndex}>
          {headers.map((header, index) => (
            <Tab key={header} label={header}>
              {contents[index]}
            </Tab>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

export default EventInformation
