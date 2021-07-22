import { Map, List } from 'immutable'
import PropTypes from 'prop-types'
import { getBoundActions } from 'actions'
import { connect as connectRedux } from 'react-redux'
import { REFERRAL_TYPE } from 'services/referral'
import React, { useRef, useCallback } from 'react'
import InviteFriendReferralLink from 'components/InviteFriend/InviteFriendReferralLink'
import VerticalNavigation, { ACCOUNT } from 'components/VerticalNavigation'
import { format as formatDateTime } from 'services/date-time'
import Sherpa, { TYPE_SMALL_WHITE } from 'components/Sherpa'
import Link, { URL_JAVASCRIPT_VOID } from 'components/Link'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { getElementToWindowTopOffset } from 'services/dom'
import { requestAnimationFrame } from 'services/animate'
import Icon, { ICON_TYPES } from 'components/Icon.v2'
import UserAvatar from 'components/UserAvatar'
import Pager from 'components/Pager.v2'
import { URL_REFER } from 'services/url/constants'
import { H1, H2, HEADING_TYPES } from 'components/Heading'

function renderNoResults (hasReferrals, isValidPage, staticText) {
  if (hasReferrals) {
    return null
  }
  return (
    <div className="invite-friend-referrals__empty">
      {isValidPage
        ? staticText.getIn(['data', 'emptyState'])
        : staticText.getIn(['data', 'invalidPage'])}
    </div>
  )
}

function renderTop (userReferrals, staticText) {
  const total = userReferrals.getIn(['data', 'referrals', 'count'], 0)
  const baseClassName = 'invite-friend-referrals__total-count'
  const className = [baseClassName]

  if (total >= 100) {
    className.push(`${baseClassName}--large`)
  }

  return (
    <div className="invite-friend-referrals__top">
      <div className="invite-friend-referrals__top-left">
        <InviteFriendReferralLink fixed />
      </div>
      <div className="invite-friend-referrals__top-right">
        <div className="invite-friend-referrals__total">
          <H2 as={HEADING_TYPES.H5} inverted className="invite-friend-referrals__total-title">
            {staticText.getIn(['data', 'totalFriendsReferred'])}
          </H2>
          <div className={className.join(' ')}>
            {total}
          </div>
          <div className="invite-friend-referrals__gift" />
        </div>
      </div>
    </div>
  )
}

function renderRow (row, staticText, locale) {
  const source = row.get('source', 'referral')
  const src = REFERRAL_TYPE[source]
  return (
    <tr key={row.get('id')}>
      <td className="invite-friend-referrals__table-cell">
        <div className="invite-friend-referrals__name-avatar">
          <div className="invite-friend-referrals__avatar">
            <UserAvatar path={row.get('image', '')} />
          </div>
          <span className="invite-friend-referrals__name">
            {row.get('title')}
          </span>
        </div>
      </td>
      <td className="invite-friend-referrals__table-cell">
        {staticText.getIn(['data', src])}
      </td>
      <td className="invite-friend-referrals__table-cell">
        {formatDateTime(row.get('createdAt'), locale, 'MM/DD/YYYY')}
      </td>
    </tr>
  )
}

function InviteFriendReferralsPage ({
  userReferrals,
  pushHistory,
  staticText,
  location,
  locale,
}) {
  const data = userReferrals.get('data', Map())
  const referrals = data.getIn(['referrals', 'referredUsers'], List())
  const totalItems = data.getIn(['referrals', 'count'], -1)
  const order = data.get('order')
  const field = data.get('field')
  const hasData = data.size > 0
  const pp = data.get('pp')
  const p = data.get('p')

  // error state stuff
  const hasReferrals = referrals.size > 0
  const isValidPage = p === 1 || p <= Math.ceil(totalItems / pp)

  const $table = useRef(null)

  const onChangePage = useCallback((next) => {
    pushHistory({
      query: { p: next, order, field },
      scrollToTop: false,
      url: URL_REFER,
    })
    if ($table.current) {
      const offset = getElementToWindowTopOffset($table.current) - 100 || 0
      requestAnimationFrame(() => global.scrollTo(0, offset))
    }
  }, [order, field])

  const onSortReferralType = useCallback((e) => {
    e.preventDefault()
    const nextOrder = field === 'referralType'
      && order === 'DESC' ? 'ASC' : 'DESC'
    pushHistory({
      query: { field: 'referralType', order: nextOrder, p: 1 },
      scrollToTop: false,
      url: URL_REFER,
    })
  }, [order, field, p])

  const onSortCreatedAt = useCallback((e) => {
    e.preventDefault()
    const nextOrder = field === 'createdAt'
      && order === 'DESC' ? 'ASC' : 'DESC'
    pushHistory({
      query: { field: 'createdAt', order: nextOrder, p: 1 },
      scrollToTop: false,
      url: URL_REFER,
    })
  }, [order, field, p])

  return (
    <section className="invite-friend-referrals">
      <VerticalNavigation location={location} navType={ACCOUNT} />
      <div className="invite-friend-referrals__content">
        <H1 className="invite-friend-referrals__title">
          {staticText.getIn(['data', 'friendsReferred'])}
        </H1>
        {
          !hasData ?
            <Sherpa type={TYPE_SMALL_WHITE} />
            : renderTop(userReferrals, staticText)
        }
        {
          !hasData ?
            null
            : <div className="invite-friend-referrals__table-wrapper">
              <table className="invite-friend-referrals__table" ref={$table}>
                <thead>
                  <tr>
                    <th className="invite-friend-referrals__table-header">
                      {staticText.getIn(['data', 'name'])}
                    </th>
                    <th className="invite-friend-referrals__table-header">
                      {hasReferrals ? (
                        <Link
                          className="invite-friend-referrals__sort"
                          onClick={onSortReferralType}
                          to={URL_JAVASCRIPT_VOID}
                          scrollToTop={false}
                          role="button"
                        >
                          {staticText.getIn(['data', 'referralType'])}
                          {
                            field === 'referralType'
                              ? <span className="invite-friend-referrals__icon">
                                <Icon
                                  type={order === 'ASC' ? ICON_TYPES.ARROW_UP : ICON_TYPES.ARROW_DOWN}
                                />
                              </span>
                              : null
                          }
                        </Link>
                      ) : (
                        staticText.getIn(['data', 'referralType'])
                      )}
                    </th>
                    <th className="invite-friend-referrals__table-header">
                      {hasReferrals ? (
                        <Link
                          className="invite-friend-referrals__sort"
                          onClick={onSortCreatedAt}
                          to={URL_JAVASCRIPT_VOID}
                          scrollToTop={false}
                          role="button"
                        >
                          {staticText.getIn(['data', 'dateJoined'])}
                          {
                            field === 'createdAt'
                              ? <span className="invite-friend-referrals__icon">
                                <Icon
                                  type={order === 'ASC' ? ICON_TYPES.ARROW_UP : ICON_TYPES.ARROW_DOWN}
                                />
                              </span>
                              : null
                          }
                        </Link>
                      ) : (
                        staticText.getIn(['data', 'dateJoined'])
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map(r => (
                    renderRow(r, staticText, locale)
                  ))}
                </tbody>
              </table>
              {renderNoResults(hasReferrals, isValidPage, staticText)}
              <Pager
                onChangePage={onChangePage}
                total={totalItems}
                pp={pp}
                p={p}
              />
            </div>
        }
      </div>
    </section>
  )
}

InviteFriendReferralsPage.propTypes = {
  userReferrals: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object,
}

export default connectRedux(
  ({ page, staticText, userReferrals }) => ({
    staticText: staticText.getIn(['data', 'inviteFriendReferralsPage'], Map()),
    locale: page.get('locale', ''),
    userReferrals,
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return { pushHistory: actions.navigation.pushHistory }
  },
)(InviteFriendReferralsPage)
