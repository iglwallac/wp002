import React from 'react'
import PropTypes from 'prop-types'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import DropInVideoPlayer from 'components/DropInVideoPlayer'
import {
  BASIC_CONTROLS,
  BASIC_CONTROL_OPTIONS_VOLUME,
} from 'components/DropInVideoPlayer/DropInVideoPlayer'
import EmailCapture, { isEmailCaptured, getEventEmailCaptureKey } from './EmailCapture'
import PreviewDone from './PreviewDone'

const Preview = (props) => {
  const { eventDetails, videoEnded, showEmailCapture } = props
  if (!eventDetails) { return null }
  const previewUrl = eventDetails.get('previewUrl')
  const title = `Preview - ${eventDetails.get('route')}`
  return (
    <div className="live-preview">
      {
        videoEnded ? <PreviewDone />
          : <DropInVideoPlayer
            controls={{
              type: BASIC_CONTROLS,
              visibleControls: [BASIC_CONTROL_OPTIONS_VOLUME],
            }}
            mediaId={6031111169001}
            playerSrc={previewUrl}
            title={title}
          />
      }
      {
        showEmailCapture && <EmailCapture />
      }
    </div>
  )
}

Preview.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default compose(
  connectRedux(
    (state) => {
      const language = state.user.getIn(['data', 'language', 0], 'en')
      const eventDetails = state.liveAccessEvents.getIn(['eventDetails',
        language, 'data', 'event'])
      return {
        eventDetails,
        videoEnded: state.videoPlayer.get('ended'),
        showEmailCapture: !isEmailCaptured(getEventEmailCaptureKey(eventDetails)),
      }
    },
  ),
)(Preview)
