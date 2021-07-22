import React, { Component } from 'react'
import { connect as connectStaticText } from 'components/StaticText/connect'
import compose from 'recompose/compose'
import ImmutablePropTypes from 'react-immutable-proptypes'
import PropTypes from 'prop-types'
import Link from 'components/Link'
import { connect as connectPage, PAGE_SEO_TYPE_LOCATION } from 'components/Page/connect'
import { connect as connectRedux } from 'react-redux'
import ChangePlanTiles from 'components/ChangePlanTiles'
import { getBoundActions } from 'actions'
import Sherpa, { TYPE_SMALL_BLUE } from 'components/Sherpa'
import { H1, HEADING_TYPES } from 'components/Heading'
import { TYPE_LOGIN } from 'services/dialog'
import {
  getUserType,
  ACCOUNT_TYPE_ROKU,
} from 'services/user-account'


const displayPlans = (props) => {
  const { paytrack } = props
  const isRokuSubscriber = getUserType(paytrack) === ACCOUNT_TYPE_ROKU
  if (isRokuSubscriber) {
    return false
  }
  return true
}

const renderLoader = (plansLoaded, showPlans) => {
  let showLoader = true
  if (plansLoaded) {
    showLoader = false
  } else if (!showPlans && !plansLoaded) {
    showLoader = false
  }
  if (showLoader) {
    return <Sherpa type={TYPE_SMALL_BLUE} />
  }
  return null
}

const renderTiles = (plansLoaded) => {
  if (plansLoaded) {
    return <ChangePlanTiles />
  }
  return null
}

const renderError = (showPlans, staticText) => {
  if (!showPlans) {
    return (
      <div className="change-plan__no-plan-container">
        <p className="change-plan__body">{staticText.getIn(['data', 'noPlans'])}</p>
        <Link className="button button--secondary change-plan__button" to="/account">{staticText.getIn(['data', 'myAccount'])}</Link><br />
      </div>
    )
  } return null
}


class ChangePlanPage extends Component {
  componentDidMount () {
    const {
      auth,
      setOverlayDialogVisible,
      setDialogOptions,
      setOverlayCloseOnClick,
    } = this.props

    if (!auth.get('jwt')) {
      setOverlayDialogVisible(TYPE_LOGIN)
      setDialogOptions(null, true)
      setOverlayCloseOnClick(false)
    }
  }

  render () {
    const { staticText, plans } = this.props
    const showPlans = displayPlans(this.props)
    const plansLoaded = showPlans && plans.size && !plans.get('processing')

    return (
      <div className="change-plan">
        <H1 as={HEADING_TYPES.H4} className="change-plan__title">{staticText.getIn(['data', 'title'])}</H1>
        {renderLoader(plansLoaded, showPlans)}
        {renderTiles(plansLoaded)}
        {renderError(showPlans, staticText)}
        <br />
        <Link className="change-plan__cancel" to="/account">{staticText.getIn(['data', 'cancel'])}</Link>
      </div>
    )
  }
}

ChangePlanPage.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
  history: PropTypes.object.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  plans: ImmutablePropTypes.map.isRequired,
  userAccount: ImmutablePropTypes.map.isRequired,
  paytrack: ImmutablePropTypes.map.isRequired,
  setOverlayDialogVisible: PropTypes.func.isRequired,
  setDialogOptions: PropTypes.func.isRequired,
  setOverlayCloseOnClick: PropTypes.func.isRequired,
}

export default compose(
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
  connectStaticText({ storeKey: 'changePlanPage' }),
  connectRedux(
    state => ({
      auth: state.auth,
      plans: state.plans,
      user: state.user,
      userAccount: state.userAccount,
      paytrack: state.paytrack,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
        setDialogOptions: actions.dialog.setDialogOptions,
        setOverlayCloseOnClick: actions.dialog.setOverlayCloseOnClick,
      }
    },
  ),
)(ChangePlanPage)
