import React from 'react'

import { connect as connectRedux } from 'react-redux'
import { OrderedMap, Map } from 'immutable'
import compose from 'recompose/compose'

import { getBoundActions } from 'actions'
import Link, { TARGET_BLANK } from 'components/Link'
import { Button, TYPES } from 'components/Button.v2'
import Icon from 'components/Icon'
import IconV2, { ICON_TYPES } from 'components/Icon.v2'
import Expandable from 'components/Expandable/Expandable'
import FeedbackBox, { FEEDBACK_BOX_TYPES } from 'components/FeedbackBox'
import StaticTextToHtml from 'components/StaticTextToHtml'
import { format as formatDateTime } from 'services/date-time'
import { createAbsolute } from 'services/url'

import useHiddenContentSettings from './useHiddenContentSettings'

const HiddenContentSettings = ({
  hiddenContent,
  totalCount,
  page,
  getHiddenContent,
  hideContent,
  unhideContent,
  staticText,
  setDefaultGaEvent,
}) => {
  const { content, toggleContent, loadMoreContent } = useHiddenContentSettings(
    hiddenContent, getHiddenContent, hideContent, unhideContent, setDefaultGaEvent,
  )

  const hasToLoadMore = React.useMemo(() => totalCount > content.size, [totalCount, content])

  const sortedContent = React.useMemo(() => {
    // eslint-disable-next-line
    return content.sort((a, b) => {
      const aTime = new Date(a.get('updatedAt')).getTime()
      const bTime = new Date(b.get('updatedAt')).getTime()
      if (aTime < bTime) { return 1 }
      if (aTime > bTime) { return -1 }
      if (aTime === bTime) { return 0 }
    })
  }, [content])

  return (
    <Expandable
      className="my-account-settings-V2__settings-container"
      variant="setting"
      header={staticText.getIn(['data', 'hiddenContent'])}
      description={() => (
        <StaticTextToHtml staticText={staticText} staticTextKey={['data', 'hiddenContentDescription']} />
      )}
    >
      {sortedContent.count() > 0 ? (
        <React.Fragment>
          <div className="content-preferences__intro content-preferences__item">
            <div className="content-preferences__label-container">
              <p className="content-preferences__space-holder" />
              <p className="content-preferences__date">
                {staticText.getIn(['data', 'dateRemoved'])}
              </p>
              <p className="content-preferences__type">
                {staticText.getIn(['data', 'type'])}
              </p>
              <p className="content-preferences__cta">
                {staticText.getIn(['data', 'addItBack'])}
              </p>
            </div>
          </div>
          <ul className={!hasToLoadMore ? 'no-border-bottom-on-last-child' : ''}>
            { sortedContent.valueSeq().map((item) => {
              const dateFormatString = 'M/D/YYYY'
              const locale = page.get('locale')
              const date = formatDateTime(item.get('updatedAt'), locale, dateFormatString)
              const contentId = item.get('contentId')
              const url = item.get('path')
              const addedBack = !hiddenContent.getIn([contentId, 'id'])
              const disabled = hiddenContent.getIn([contentId, 'processing'])

              return (
                <li className="content-preferences__item" key={item.get('id')}>
                  <div className="content-preferences__item--wrapper">
                    <p><strong>{item.get('title')}</strong></p>
                    <p><strong>{staticText.getIn(['data', 'dateRemoved'])}:</strong> {date}</p>
                    <p><strong>{staticText.getIn(['data', 'type'])}:</strong> {item.get('contentType')}</p>
                  </div>
                  <div className="content-preferences__title content-preferences__item-title">
                    { url ?
                      <Link
                        to={createAbsolute(url)}
                        className="content-preferences__title content-preferences__item-title"
                        target={TARGET_BLANK}
                        directLink
                      >
                        {item.get('title')}
                      </Link>
                      :
                      item.get('title')
                    }
                  </div>
                  <p className="content-preferences__date content-preferences__item-date">{date}</p>
                  <p className="content-preferences__type content-preferences__item-type">{item.get('contentType')}</p>
                  { addedBack ?
                    <Icon
                      iconClass={[`icon icon--check-active ${disabled ? 'content-preferences__icon--disabled' : ''}`]}
                      onClick={() => toggleContent(addedBack, item)}
                    />
                    :
                    <IconV2
                      className={disabled ? 'content-preferences__icon--disabled' : ''}
                      type={ICON_TYPES.CIRCULAR_ADD}
                      onClick={() => toggleContent(addedBack, item)}
                    />
                  }
                </li>
              )
            })}
            { hasToLoadMore ?
              <Button
                className="content-preferences__load-button"
                type={TYPES.GHOST}
                onClick={loadMoreContent}
              >
                Load More
              </Button>
              :
              null
            }

          </ul>
        </React.Fragment>
      ) : (
        <FeedbackBox type={FEEDBACK_BOX_TYPES.INFO}>
          <StaticTextToHtml staticText={staticText} staticTextKey={['data', 'emptyMessageHiddenContent']} />
        </FeedbackBox>
      )}

    </Expandable>
  )
}

export default compose(
  connectRedux(
    (state) => {
      return {
        hiddenContent: state.hiddenContentPreferences.get('content') || OrderedMap(),
        totalCount: state.hiddenContentPreferences.get('totalCount'),
        page: state.page,
        staticText: state.staticText.getIn(['data', 'myAccountContentPreferencesPage'], Map()),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        getHiddenContent: actions.hiddenContentPreferences.getHiddenContent,
        hideContent: actions.hiddenContentPreferences.hideContent,
        unhideContent: actions.hiddenContentPreferences.unhideContent,
        setDefaultGaEvent: actions.eventTracking.setDefaultGaEvent,
      }
    }),
)(HiddenContentSettings)
