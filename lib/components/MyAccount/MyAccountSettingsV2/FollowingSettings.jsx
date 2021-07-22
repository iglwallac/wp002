import React, { useState, useEffect, useMemo } from 'react'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import compose from 'recompose/compose'
import { List, Map } from 'immutable'
import IconV2, { ICON_TYPES } from 'components/Icon.v2'
import Link, { TARGET_BLANK } from 'components/Link'
import { Button, TYPES } from 'components/Button.v2'
import Expandable from 'components/Expandable/Expandable'
import FeedbackBox, { FEEDBACK_BOX_TYPES } from 'components/FeedbackBox'
import StaticTextToHtml from 'components/StaticTextToHtml'
import { createAbsolute } from 'services/url'

const PP_DEFAULT = 10

const FollowingSettings = ({
  staticText,
  paginatedSubscriptions,
  total,
  getSubscriptions,
  createSubscriber,
  removeSubscriber,
  processing,

}) => {
  const [page, setPaginationPage] = useState(1)
  const [reloaded, setReloaded] = useState(false)
  const [unFollowedIds, setUnFollowedIds] = useState(List())
  const [subscriptions, setSubscriptions] = useState(List())

  useEffect(() => {
    // don't render anything until redux has been repopulated with page 1
    if (processing && !reloaded) {
      setReloaded(true)
    }
  }, [processing])

  useEffect(() => {
    getSubscriptions({ p: page, pp: PP_DEFAULT, version: 'v1' })
  }, [page])

  useEffect(() => {
    if (reloaded) {
      setSubscriptions(subscriptions.concat(paginatedSubscriptions))
    }
  }, [paginatedSubscriptions])

  const loadMore = () => {
    setPaginationPage(page + 1)
  }

  const followHandler = (subscription) => {
    // set state to rerender
    setUnFollowedIds(unFollowedIds.filter(id => id !== subscription.get('id')))
    createSubscriber(subscription)
  }

  const unfollowHandler = (subscription) => {
    // set state to rerender
    setUnFollowedIds(unFollowedIds.push(subscription.get('id')))
    removeSubscriber(subscription)
  }

  const hasToLoadMore = useMemo(() => total > subscriptions.size, [total, subscriptions])

  return (
    <Expandable
      className="my-account-settings-V2__settings-container"
      variant="setting"
      header={staticText.getIn(['data', 'following'])}
      description={() => (
        <StaticTextToHtml staticText={staticText} staticTextKey={['data', 'followingDescription']} />
      )}
    >
      {subscriptions.count() > 0 ? (
        <React.Fragment>
          <div className="content-preferences__intro content-preferences__item">
            <div className="content-preferences__label-container">
              <p className="content-preferences__space-holder" />
              <p className="content-preferences__space-holder" />
              <p className="content-preferences__type">{staticText.getIn(['data', 'type'])}</p>
              <p className="content-preferences__cta">{staticText.getIn(['data', 'unfollow'])}</p>
            </div>
          </div>
          <ul className={!hasToLoadMore ? 'no-border-bottom-on-last-child' : ''}>
            {
              subscriptions.map((item) => {
                const id = item.get('id')
                const title = item.get('contentTitle')
                const url = item.getIn(['tile', 'url'])
                const isFollowing = !unFollowedIds.includes(id)
                return (
                  <li key={id} className="content-preferences__item">
                    <div className="content-preferences__item--wrapper">
                      <p><strong>{title}</strong></p>
                      <p><strong>{staticText.getIn(['data', 'type'])}:</strong> {item.get('contentType')}</p>
                    </div>
                    <p className="content-preferences__title content-preferences__item-title">
                      { url ?
                        <Link
                          to={createAbsolute(url)}
                          className="content-preferences__title content-preferences__item-title"
                          target={TARGET_BLANK}
                          directLink
                        >{title}
                        </Link>
                        :
                        title
                      }
                    </p>
                    <p className="content-preferences__title content-preferences__item-title" />
                    <p className="content-preferences__type content-preferences__item-type">{item.get('contentType')}</p>
                    { isFollowing ?
                      <IconV2
                        type={ICON_TYPES.CIRCULAR_FOLLOW_BELL}
                        onClick={() => unfollowHandler(item)}
                      />
                      :
                      <IconV2
                        type={ICON_TYPES.CIRCULAR_BELL_OFF}
                        onClick={() => followHandler(item)}
                      />
                    }
                  </li>
                )
              })}
            { hasToLoadMore ?
              <Button
                className="content-preferences__load-button"
                type={TYPES.GHOST}
                onClick={loadMore}
              >
                Load More
              </Button>
              :
              <div className="content-preferences__title content-preferences__item--bottom-padding" />
            }
          </ul>
        </React.Fragment>
      ) : (
        <FeedbackBox type={FEEDBACK_BOX_TYPES.INFO}>
          <StaticTextToHtml staticText={staticText} staticTextKey={['data', 'emptyMessageFollowing']} />
        </FeedbackBox>
      )}
    </Expandable>
  )
}

export default compose(
  connectRedux(
    (state) => {
      return {
        paginatedSubscriptions: state.notifications.getIn(['subscriptions', 'data'], List()),
        total: state.notifications.getIn(['subscriptions', 'total'], 0),
        processing: state.notifications.getIn(['subscriptions', 'processing']),
        staticText: state.staticText.getIn(['data', 'myAccountContentPreferencesPage'], Map()),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        getSubscriptions: actions.notifications.getSubscriptions,
        createSubscriber: actions.notifications.createSubscriber,
        removeSubscriber: actions.notifications.removeSubscriber,
        setDefaultGaEvent: actions.eventTracking.setDefaultGaEvent,
      }
    }),
)(FollowingSettings)
