import React, { PureComponent } from 'react'
import Icon from 'components/Icon'
import PlanGridPriceFirst from 'components/PlanGridPriceFirst'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { PLAN_SKU_MONTHLY } from 'services/plans'
import compose from 'recompose/compose'
import { connect as connectStaticText } from 'components/StaticText/connect'
import PropTypes from 'prop-types'

class PlanPriceExplained extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      listClass: 'plan-price-explained__list--state-hidden',
      buttonsClass: 'hidden',
    }
  }

  componentDidMount () {
    const { expand } = this.props
    if (expand) {
      this.toggleButtons()
    }
  }

  getClassName = (props) => {
    const { backgroundTexture } = props
    const baseClassName = 'plan-price-explained'
    const baseClass = [baseClassName]
    if (backgroundTexture) {
      baseClass.push(`${baseClassName}--background-texture`)
    }
    return baseClass.join(' ')
  }

  toggleList = () => {
    if (this.state.listClass === 'plan-price-explained__list--state-hidden') {
      this.setState({ listClass: 'plan-price-explained__list--state-show' })
    } else {
      this.setState({ listClass: 'plan-price-explained__list--state-hidden' })
    }
  }

  toggleButtons = () => {
    if (this.state.buttonsClass === 'hidden') {
      this.setState({ buttonsClass: 'show' })
    } else {
      this.setState({ buttonsClass: 'hidden' })
    }
    this.toggleList()
  }

  render () {
    const { listClass, buttonsClass } = this.state
    const { planData, staticText, expand } = this.props
    let monthlyPlan
    const plans = planData.getIn(['data', 'plans'])
    plans.find((plan) => {
      if (plan.get('sku') === PLAN_SKU_MONTHLY) {
        monthlyPlan = plan
      }
      return null
    })

    return (
      <div className={this.getClassName(this.props)}>
        <div className="plan-price-explained__title">{staticText.getIn(['data', 'titleOne'])} <span className="plan-price-explained__title--oblique">{staticText.getIn(['data', 'titleBold'])}</span> {staticText.getIn(['data', 'titleThree'])}{'\u00A0'}
          { monthlyPlan && <PlanGridPriceFirst plan={monthlyPlan} className={['plan-price-explained__title', 'plan-price-explained__title--price']} /> } {staticText.getIn(['data', 'titleFour'])}</div>
        <div className={`plan-price-explained__list ${listClass}`}>
          <div className="plan-price-explained__list-item">
            <div className="plan-price-explained__list-item-image-container">
              <div className="plan-price-explained__list-item-image plan-price-explained__list-item-image--mandala" />
            </div>
            {staticText.getIn(['data', 'providesOne'])}<strong> {staticText.getIn(['data', 'providesTwo'])}</strong> {staticText.getIn(['data', 'providesThree'])}
          </div>
          <div className="plan-price-explained__list-item">
            <div className="plan-price-explained__list-item-image-container">
              <div className="plan-price-explained__list-item-image plan-price-explained__list-item-image--microphone" />
            </div>
            {staticText.getIn(['data', 'bringsOne'])}<strong> {staticText.getIn(['data', 'bringsTwo'])}</strong>.
          </div>
          <div className="plan-price-explained__list-item plan-price-explained__list-item-lock">
            <div className="plan-price-explained__list-item-image-container">
              <div className="plan-price-explained__list-item-image plan-price-explained__list-item-image--lock" />
            </div>
            {staticText.getIn(['data', 'paysOne'])}<strong> { staticText.getIn(['data', 'paysTwo'])}</strong> {staticText.getIn(['data', 'paysThree'])}
          </div>
          <div className="plan-price-explained__list-item">
            <div className="plan-price-explained__list-item-image-container">
              <div className="plan-price-explained__list-item-image plan-price-explained__list-item-image--screens" />
            </div>
            {staticText.getIn(['data', 'makesOne'])}<strong> {staticText.getIn(['data', 'makesTwo'])}</strong> {staticText.getIn(['data', 'makesThree'])}
          </div>
          <div className="plan-price-explained__list-item plan-price-explained__list-item-clapperboard">
            <div className="plan-price-explained__list-item-image-container">
              <div className="plan-price-explained__list-item-image plan-price-explained__list-item-image--clapperboard" />
            </div>
            {staticText.getIn(['data', 'producesOne'])}<strong> {staticText.getIn(['data', 'producesTwo'])} </strong>
            {staticText.getIn(['data', 'producesThree'])}
          </div>
          <div className="plan-price-explained__list-item plan-price-explained__list-item-globe">
            <div className="plan-price-explained__list-item-image-container">
              <div className="plan-price-explained__list-item-image plan-price-explained__list-item-image--globe" />
            </div>
            {staticText.getIn(['data', 'keepsOne'])} <strong>{staticText.getIn(['data', 'keepsTwo'])}</strong> {staticText.getIn(['data', 'keepsThree'])}
          </div>
        </div>
        <div className="plan-price-explained__list-arrow-container">
          { expand ?
            null :
            <span>
              <Icon iconClass={['icon--down', 'icon', 'plan-price-explained__list-down-button', `plan-price-explained__list-down-button--state-${buttonsClass}`]} onClick={this.toggleButtons} />
              <Icon iconClass={['icon--up', 'icon', 'plan-price-explained__list-up-button', `plan-price-explained__list-up-button--state-${buttonsClass}`]} onClick={this.toggleButtons} />
            </span>
          }

        </div>
      </div>
    )
  }
}

PlanPriceExplained.propTypes = {
  planData: ImmutablePropTypes.map.isRequired,
  backgroundTexture: PropTypes.bool,

}

export default compose(
  connectStaticText({ storeKey: 'planPriceExplained' }),
)(PlanPriceExplained)
