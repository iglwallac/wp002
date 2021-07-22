import React from 'react'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { Map } from 'immutable'
import Spotlight from 'components/Spotlight'
import SpotlightLiveAccess from 'components/SpotlightLiveAccess'
import { PM_PLACEMENT_SPOTLIGHT_LIVE_ACCESS } from 'services/pm-placement/constants'
import { TestarossaSwitch, TestarossaCase, TestarossaDefault } from 'components/Testarossa'

const SPOTLIGHT_A = 'member-home-spotlight-a-v1'
const SectionPlacement = (props) => {
  const {
    placementName,
    data,
    sectionId,
    history,
    sectionIndex,
  } = props

  if (placementName === SPOTLIGHT_A) {
    if (data.get('payloadType') === PM_PLACEMENT_SPOTLIGHT_LIVE_ACCESS) {
      return <SpotlightLiveAccess data={data.get('payload')} />
    }
    return (
      <TestarossaSwitch key={sectionId}>
        <TestarossaCase campaign="ME-3043" variation={[1]} unwrap>
          <Spotlight
            sectionId={sectionId}
            history={history}
            sectionIndex={sectionIndex}
            showMinimizeButton
          />
        </TestarossaCase>
        <TestarossaDefault unwrap>
          <Spotlight
            sectionId={sectionId}
            history={history}
            sectionIndex={sectionIndex}
          />
        </TestarossaDefault>
      </TestarossaSwitch>
    )
  }
  // TODO: support spotlight b
  return null
}

export default compose(
  connectRedux(
    (state, props) => {
      const { sectionId } = props
      // Get section
      const sectionStore = state.pmSection.get(sectionId, Map())
      const section = sectionStore.get('data', Map())
      const placementName = section.getIn(['data', 'placement'])
      const language = state.user.getIn(['data', 'language', 0], 'en')
      const data = state.pmPlacement.getIn([placementName, language, 'data'], Map())
      return {
        placementName,
        data,
      }
    },
  ),
)(SectionPlacement)
