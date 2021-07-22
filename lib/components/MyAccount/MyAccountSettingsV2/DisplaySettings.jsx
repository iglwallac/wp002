import React from 'react'
import compose from 'recompose/compose'
import { connect as connectStaticText } from 'components/StaticText/connect'
import StaticTextToHtml from 'components/StaticTextToHtml'
import Expandable from 'components/Expandable/Expandable'
import AutoplaySettings from './AutoplaySettings'
import MinimizeSpotlightSettings from './MinimizeSpotlightSettings'
import VideoPlayerInfo from './VideoPlayerInfo'

const DisplaySettings = (props) => {
  const { staticText } = props
  return (
    <Expandable
      className="my-account-settings-V2__settings-container"
      variant="setting"
      header={staticText.getIn(['data', 'displaySettings'])}
      description={() => (
        <StaticTextToHtml staticText={staticText} staticTextKey={['data', 'displaySettingsDescription']} />
      )}
    >
      <MinimizeSpotlightSettings />
      <VideoPlayerInfo />
      <AutoplaySettings />
    </Expandable>
  )
}

export default compose(connectStaticText({ storeKey: 'myAccountSettingsV2' }))(
  DisplaySettings,
)
