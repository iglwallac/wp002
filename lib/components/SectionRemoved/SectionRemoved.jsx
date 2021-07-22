import React from 'react'
import Link from 'components/Link'
import { CUSTOM_ROW_REVERTED_EVENT } from 'services/event-tracking'

const SectionRemoved = (props) => {
  const { sectionTitle, addBackHandler, setDefaultGaEvent, adminTitle, staticText } = props
  const onAddItBack = () => {
    const eventData = CUSTOM_ROW_REVERTED_EVENT
      .set('eventLabel', adminTitle)
    setDefaultGaEvent(eventData)
    addBackHandler()
  }
  const bodyText = `${sectionTitle} ${staticText.get('removedIt')}`
  return (
    <div className="section-removed">
      <div className="section-removed__content">
        {bodyText} <Link onClick={onAddItBack}>{staticText.get('undo')}</Link>
      </div>
    </div >
  )
}

export default SectionRemoved
