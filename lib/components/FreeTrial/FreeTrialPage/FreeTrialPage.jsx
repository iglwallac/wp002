import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { List } from 'immutable'
import compose from 'recompose/compose'
import { connect as connectRedux } from 'react-redux'
import { connect as connectPage, PAGE_SEO_TYPE_LOCATION } from 'components/Page/connect'
import { connect as connectStaticText } from 'components/StaticText/connect'
// import GaiaLogo, { TYPE_TEAL } from 'components/GaiaLogo'
import Sherpa, { TYPE_LARGE } from 'components/Sherpa'
import Button from 'components/Button'
import { renderText as renderPlanPrice } from 'components/PlanGridPriceFirst'
import {
  URL_FREE_TRIAL_ACCOUNT,
  URL_GO_PAGE,
} from 'services/url/constants'
import { PLAN_SKU_NINETY_NINE_CENT_TWO_WEEKS, PLAN_SKU_FREE_TRIAL } from 'services/plans'
import { H1, HEADING_TYPES } from 'components/Heading'

class FreeTrialPage extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      isActive: false,
      plansLoaded: false,
    }
  }

  componentDidMount () {
    /* eslint-disable react/no-did-mount-set-state */
    const { plans } = this.props

    // Redirect after free weekend
    window.location = 'https://www.gaia.com/lp/free-weekend'

    const plansList = plans.getIn(['data', 'plans'], List())
    const freeTrial = plansList.find((plan) => {
      return plan.get('sku') === PLAN_SKU_FREE_TRIAL
    })

    // if (auth.get('jwt')) {
    //   history.push('/')
    // }

    if (plans.getIn(['data', 'plans'], List()).size > 0) {
      if (freeTrial) {
        this.setState(() => ({ isActive: true }))
      }

      this.setState(() => ({ plansLoaded: true }))
    }
    /* eslint-enable react/no-did-mount-set-state */
  }

  componentDidUpdate (prevProps) {
    /* eslint-disable react/no-did-update-set-state */
    const { plans } = prevProps
    const previousPlans = plans.getIn(['data', 'plans'], List())
    const currentPlans = this.props.plans.getIn(['data', 'plans'], List())

    if (previousPlans !== currentPlans && currentPlans.size > 0) {
      const freeTrial = currentPlans.find((plan) => {
        return plan.get('sku') === PLAN_SKU_FREE_TRIAL
      })

      if (freeTrial) {
        this.setState(() => ({ isActive: true }))
      }

      this.setState(() => ({ plansLoaded: true }))
    }
    /* eslint-enable react/no-did-update-set-state */
  }

  renderProcessing = () => {
    return (
      <div className="free-trial__sherpa">
        <Sherpa type={TYPE_LARGE} />
      </div>
    )
  }

  renderFreeTrialAuthenticatedMessaging = () => {
    const { staticText } = this.props

    return (
      <div className="free-trial__content">
        <H1 as={HEADING_TYPES.H4} className="free-trial__title">
          {staticText.getIn(['data', 'title3'])}
        </H1>
        <p className="free-trial__info">{staticText.getIn(['data', 'loggedInMessage'])}</p>
        <p className="free-trial__info">{staticText.getIn(['data', 'logoutMessage'])}</p>
        <Button
          url={'/'}
          text={staticText.getIn(['data', 'loggedInButton'])}
          scrollToTop
          buttonClass={['button--primary', 'free-trial__continue-button']}
        />
      </div>
    )
  }

  renderFreeTrial = () => {
    const { staticText } = this.props

    return (
      <div className="free-trial__content">
        <div className="free-trial__warning-message">
          {'Due to overwhelming demand, a few users are experiencing technical difficulties signing up. We are working on a solution and apologize for any inconvenience. If you experience a technical difficulty, please try again later.'}
        </div>
        <H1 as={HEADING_TYPES.H4} className="free-trial__title">
          {staticText.getIn(['data', 'title1'])}
          <br />
          {staticText.getIn(['data', 'title2'])}
        </H1>
        <p className="free-trial__info">{staticText.getIn(['data', 'body1'])}</p>
        <p className="free-trial__info">{staticText.getIn(['data', 'body2'])}</p>
        <p className="free-trial__info">{staticText.getIn(['data', 'body3'])}</p>
        <Button
          url={URL_FREE_TRIAL_ACCOUNT}
          text={staticText.getIn(['data', 'continueButton'])}
          scrollToTop
          buttonClass={['button--primary', 'free-trial__continue-button']}
        />
      </div>
    )
  }

  renderExpiredMessage = () => {
    const { staticText, plans } = this.props
    const { plansLoaded } = this.state
    const twoWeekTrial = plansLoaded ? plans.getIn(['data', 'plans'], List()).find((plan) => {
      return plan.get('sku') === PLAN_SKU_NINETY_NINE_CENT_TWO_WEEKS
    }) : null
    const twoWeekTrialInitialCost = twoWeekTrial ? renderPlanPrice(twoWeekTrial) : ''

    return (
      <div className="free-trial__content">
        <H1 as={HEADING_TYPES.H4} className="free-trial__title">
          {staticText.getIn(['data', 'title3'])}
        </H1>
        <p className="free-trial__info">{staticText.getIn(['data', 'body4'])}</p>
        <p className="free-trial__info">{staticText.getIn(['data', 'body1'])}</p>
        <p className="free-trial__info">{staticText.getIn(['data', 'body2'])}</p>
        <Button
          url={URL_GO_PAGE}
          query={{ sku: PLAN_SKU_NINETY_NINE_CENT_TWO_WEEKS }}
          text={`${twoWeekTrialInitialCost} ${staticText.getIn(['data', 'upsellButton'])}`}
          scrollToTop
          buttonClass={['button--primary', 'free-trial__continue-button']}
        />
      </div>
    )
  }

  render () {
    // const { plansLoaded } = this.state
    // const { auth } = this.props
    // const authToken = auth.get('jwt')

    // return null after free weekend

    return null

    // return (
    //   <div className="free-trial">
    //     <div className="free-trial__gradient" />
    //     <div className="free-trial__stripe" />
    //     <div className="free-trial__wrapper">
    //       <GaiaLogo isHref type={TYPE_TEAL} />
    //       {
    //         !plansLoaded ?
    //           this.renderProcessing()
    //           : null
    //       }
    //       {
    //         plansLoaded && !authToken ?
    //           this.renderFreeTrial()
    //           : null
    //       }
    //       {
    //         plansLoaded && authToken ?
    //           this.renderFreeTrialAuthenticatedMessaging()
    //           : null
    //       }
    //     </div>
    //   </div>
    // )
  }
}

FreeTrialPage.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  plans: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
}

export default compose(
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
  connectStaticText({ storeKey: 'freeTrialPage' }),
  connectRedux(
    state => ({
      auth: state.auth,
      plans: state.plans,
    }),
  ),
)(FreeTrialPage)
