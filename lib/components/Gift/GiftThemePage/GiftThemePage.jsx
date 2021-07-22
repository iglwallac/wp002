
import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect as connectPage, PAGE_SEO_TYPE_LOCATION } from 'components/Page/connect'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { getBoundActions } from 'actions'
import { fromJS, Map } from 'immutable'
import { requestAnimationFrame } from 'services/animate'
import GiftProgressMeter from 'components/Gift/GiftProgressMeter'
import Link from 'components/Link'
import GiftBackLink from 'components/Gift/GiftBackLink'
import Button from 'components/Button'
import { H1, H6 } from 'components/Heading'
import { URL_JAVASCRIPT_VOID } from 'components/Link/constants'
import {
  URL_GIFT_SELECT,
  URL_GIFT_RECIPIENT,
} from 'services/url/constants'
import {
  GIFT_STEP_TWO,
  GIFT_THEME_TYPE_BIRTHDAY,
  GIFT_THEME_TYPE_HOLIDAY,
  GIFT_THEME_TYPE_THANKYOU,
  GIFT_THEME_TYPE_JUST_BECAUSE,
  GIFT_THEME_TYPE_SEEKING_TRUTH,
  GIFT_THEME_TYPE_YOGA,
} from 'services/gift'

function getThemeData (staticText = Map()) {
  const themeData = [
    {
      type: GIFT_THEME_TYPE_BIRTHDAY,
      text: staticText.getIn(['data', 'birthday'], ''),
    },
    {
      type: GIFT_THEME_TYPE_HOLIDAY,
      text: staticText.getIn(['data', 'holiday'], ''),
    },
    {
      type: GIFT_THEME_TYPE_THANKYOU,
      text: staticText.getIn(['data', 'thankYou'], ''),
    },
    {
      type: GIFT_THEME_TYPE_JUST_BECAUSE,
      text: staticText.getIn(['data', 'justBecause'], ''),
    },
    {
      type: GIFT_THEME_TYPE_SEEKING_TRUTH,
      text: staticText.getIn(['data', 'seekingTruth'], ''),
    },
    {
      type: GIFT_THEME_TYPE_YOGA,
      text: staticText.getIn(['data', 'yoga'], ''),
    },
  ]

  return fromJS(themeData)
}

function getThemeItemClassName (className, type, isSelected) {
  const itemClass = [className]

  if (isSelected) {
    itemClass.push(`${className}--selected`)
  }

  switch (type) {
    case GIFT_THEME_TYPE_BIRTHDAY:
      itemClass.push(`${className}--birthday`)
      break
    case GIFT_THEME_TYPE_HOLIDAY:
      itemClass.push(`${className}--holiday`)
      break
    case GIFT_THEME_TYPE_THANKYOU:
      itemClass.push(`${className}--thank-you`)
      break
    case GIFT_THEME_TYPE_JUST_BECAUSE:
      itemClass.push(`${className}--just-because`)
      break
    case GIFT_THEME_TYPE_SEEKING_TRUTH:
      itemClass.push(`${className}--seeking-truth`)
      break
    case GIFT_THEME_TYPE_YOGA:
      itemClass.push(`${className}--yoga`)
      break
    default:
      // do nothing
  }

  return itemClass.join(' ')
}

function renderThemeItems (props) {
  const { staticText, gift, setGiftCheckoutTheme } = props
  const data = getThemeData(staticText)

  return data.map((item) => {
    const type = item.get('type')
    const text = item.get('text')
    const isSelected = gift.getIn(['theme', 'selected']) === type

    const onClickThemeItem = () => {
      setGiftCheckoutTheme(type)
    }

    return (
      <li key={`theme-type-${type}`} className={getThemeItemClassName('gift-theme__theme-item', type, isSelected)}>
        <H6 className={getThemeItemClassName('gift-theme__theme-item-title', type, isSelected)}>{text}</H6>
        <div className="gift-theme__theme-image-wrapper">
          <Link
            className={getThemeItemClassName('gift-theme__theme-item-image', type, isSelected)}
            to={URL_JAVASCRIPT_VOID}
            onClick={onClickThemeItem}
          />
        </div>
      </li>
    )
  })
}

function GiftThemePage (props) {
  const {
    history,
    gift,
    staticText,
    setGiftCheckoutStepComplete,
  } = props

  if (!gift.getIn(['step', 'active'])) {
    return null
  }

  const haveSelection = gift.getIn(['theme', 'selected'], null)

  const onClickContinueButton = () => {
    setGiftCheckoutStepComplete(GIFT_STEP_TWO)
    history.push(URL_GIFT_RECIPIENT)

    if (window.scrollTo) {
      requestAnimationFrame(() => window.scrollTo(0, 0))
    }
  }

  return (
    <div className="gift-theme">
      <GiftProgressMeter />
      <div className="gift-theme__wrapper">
        <H1 className="gift-theme__title">{staticText.getIn(['data', 'chooseTheme'])}</H1>
        <ul className="gift-theme__list">
          {renderThemeItems(props)}
        </ul>
        <Button
          text={staticText.getIn(['data', 'continue'])}
          url={URL_JAVASCRIPT_VOID}
          buttonClass={[haveSelection ? 'button--primary' : 'button--disabled', 'gift-theme__continue']}
          onClick={haveSelection ? onClickContinueButton : null}
          scrollToTop
        />
        <GiftBackLink url={URL_GIFT_SELECT} />
      </div>
    </div>
  )
}

GiftThemePage.propTypes = {
  history: PropTypes.object.isRequired,
  gift: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  setGiftCheckoutStepComplete: PropTypes.func.isRequired,
  setGiftCheckoutTheme: PropTypes.func.isRequired,
}

export default compose(
  connectRedux(
    state => ({
      gift: state.gift,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setGiftCheckoutStepComplete: actions.gift.setGiftCheckoutStepComplete,
        setGiftCheckoutTheme: actions.gift.setGiftCheckoutTheme,
      }
    },
  ),
  connectStaticText({ storeKey: 'giftThemePage' }),
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
)(GiftThemePage)
