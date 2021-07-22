/* eslint-disable max-len */
import React from 'react'

import Expandable from 'components/Expandable/Expandable'
import EmailSettings from 'components/MyAccount/MyAccountSettingsV2/EmailSettings'
import { connect as connectStaticText } from 'components/StaticText/connect'
import compose from 'recompose/compose'

const CommunicationSettings = (props) => {
  const { staticText } = props
  return (
    <Expandable
      className="my-account-settings-V2__settings-container"
      variant="setting"
      header={staticText.getIn(['data', 'communicationsHeader'])}
      description={staticText.getIn(['data', 'communicationsBody'])}
    >
      <EmailSettings />
    </Expandable>
  )
}

export default compose(connectStaticText({ storeKey: 'myAccountSettingsV2' }))(CommunicationSettings)

