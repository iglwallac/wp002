import React from 'react'

import { connect as connectRedux } from 'react-redux'
import { Map, List } from 'immutable'
import compose from 'recompose/compose'

import { getBoundActions } from 'actions'
import Icon from 'components/Icon'
import IconV2, { ICON_TYPES } from 'components/Icon.v2'
import Expandable from 'components/Expandable/Expandable'
import FeedbackBox, { FEEDBACK_BOX_TYPES } from 'components/FeedbackBox'
import StaticTextToHtml from 'components/StaticTextToHtml'

import useRemovedRowsSettings from './useRemovedRowsSettings'

const RemovedRowsSettings = ({
  removedRowsIds,
  pmSection,
  staticText,
  getMultiplePmSections,
  setFeatureTrackingDataPersistent,
  setDefaultGaEvent,
}) => {
  const { removedRows, hideRow, addRowBack } = useRemovedRowsSettings(
    removedRowsIds,
    pmSection,
    getMultiplePmSections,
    setFeatureTrackingDataPersistent,
    setDefaultGaEvent,
  )

  return (
    <Expandable
      variant="setting"
      header={staticText.getIn(['data', 'removedRows'])}
      description={() => (
        <StaticTextToHtml staticText={staticText} staticTextKey={['data', 'removedRowsDescription']} />
      )}
    >
      {removedRows.count() > 0 ? (
        <React.Fragment>
          <div className="content-preferences__intro content-preferences__item">
            <div className="content-preferences__label-container">
              <p className="content-preferences__space-holder" />
              <p className="content-preferences__space-holder" />
              <p className="content-preferences__cta">{staticText.getIn(['data', 'addItBack'])}</p>
            </div>
          </div>
          <ul className="no-border-bottom-on-last-child">
            {removedRows.valueSeq().map((item) => {
              const id = item.getIn(['data', 'id'])
              const title = item.getIn(['data', 'data', 'header', 'label'])
              const addedBack = item.get('addedBack')
              return (
                <li key={id} className="content-preferences__item">
                  <div className="content-preferences__item--wrapper">
                    <p><strong>{title}</strong></p>
                  </div>
                  <p className="content-preferences__title content-preferences__item-title">
                    {title}
                  </p>
                  { addedBack ?
                    <Icon
                      iconClass={['icon icon--check-active']}
                      onClick={() => hideRow(item)}
                    />
                    :
                    <IconV2
                      type={ICON_TYPES.CIRCULAR_ADD}
                      onClick={() => addRowBack(item)}
                    />
                  }
                </li>
              )
            })}
          </ul>
        </React.Fragment>
      ) : (
        <FeedbackBox type={FEEDBACK_BOX_TYPES.INFO}>
          <StaticTextToHtml staticText={staticText} staticTextKey={['data', 'emptyMessageRemovedRows']} />
        </FeedbackBox>
      )}
    </Expandable>
  )
}

export default compose(
  connectRedux(
    (state) => {
      return {
        removedRowsIds: state.featureTracking.getIn(['data', 'hiddenPmSectionIds']) || List(),
        pmSection: state.pmSection || Map(),
        staticText: state.staticText.getIn(['data', 'myAccountContentPreferencesPage'], Map()),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        getMultiplePmSections: actions.pmSection.getMultiplePmSections,
        setFeatureTrackingDataPersistent: actions.featureTracking.setFeatureTrackingDataPersistent,
        setDefaultGaEvent: actions.eventTracking.setDefaultGaEvent,
      }
    }),
)(RemovedRowsSettings)
