import React from 'react'
import compose from 'recompose/compose'
import { connect as connectStaticText } from 'components/StaticText/connect'
import Expandable from 'components/Expandable/Expandable'
import StaticTextToHtml from 'components/StaticTextToHtml'
import NotificationRecommendedSettings from './NotificationRecommendedSettings'
import NotificationNewEpisodeSettings from './NotificationNewEpisodeSettings'

const NotificationSettings = (props) => {
  const { staticText } = props
  return (
    <Expandable
      variant="setting"
      header={staticText.getIn(['data', 'notificationsHeader'])}
      description={() => (
        <StaticTextToHtml staticText={staticText} staticTextKey={['data', 'notificationsBody']} />
      )}
    >
      <NotificationRecommendedSettings />
      <NotificationNewEpisodeSettings />
    </Expandable>
  )
}

export default compose(
  connectStaticText({ storeKey: 'myAccountSettingsV2' }),
)(NotificationSettings)
