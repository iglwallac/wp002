import React, { useCallback } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import compose from 'recompose/compose'
import { connect as connectRedux } from 'react-redux'
import ButtonSignUp, { BUTTON_SIGN_UP_TYPE_BUTTON } from 'components/ButtonSignUp'
import { H3, HEADING_TYPES } from 'components/Heading'
import _split from 'lodash/split'
import _map from 'lodash/map'
import PropTypes from 'prop-types'

const BUTTON_CLASS = ['button--primary', 'cta-join-dynamic__button']
const SITE_SEGMENT_SEEKING_TRUTH = 120016

function formatMessage (titleString) {
  const titleWords = _split(titleString, ' ')
  return _map(titleWords, titleItem => (
    <span
      key={titleItem}
      className="cta-join-dynamic__title-item"
    >{titleItem}
    </span>
  ))
}

function getClassName (siteSegment) {
  const base = 'cta-join-dynamic__background'
  const cls = [base]
  if (siteSegment !== SITE_SEGMENT_SEEKING_TRUTH) {
    cls.push(`${base}--body-mind-spirit`)
  } else {
    cls.push(`${base}--seeking-truth`)
  }
  return cls.join(' ')
}

function CtaJoinDynamic ({
  staticText,
  siteSegment,
}) {
  const onClickCta = useCallback(() => {
    if (global.dataLayer) {
      global.dataLayer.push({
        eventCategory: 'user engagement',
        eventLabel: 'mind-body-spirit',
        eventAction: 'Call to Action',
        event: 'customEvent',
      })
    }
  }, [])

  return (
    <div className={getClassName(siteSegment)}>
      <div className="cta-join-dynamic__overlay" />
      <div className="cta-join-dynamic__section-wrapper">
        <div className="cta-join-dynamic__section">
          {siteSegment !== SITE_SEGMENT_SEEKING_TRUTH
            ? formatMessage(staticText.getIn(['data', 'titleBodyMindSpirit']))
            : formatMessage(staticText.getIn(['data', 'titleSeekingTruth']))}
        </div>
        <div className="cta-join-dynamic__section-text">
          <H3 as={HEADING_TYPES.H5} inverted className="cta-join-dynamic__sub-header" >
            {staticText.getIn(['data', 'subTitle'])}
          </H3>
          <p className="cta-join-dynamic__body-text">
            {siteSegment !== SITE_SEGMENT_SEEKING_TRUTH
              ? staticText.getIn(['data', 'textBodyMindSpirit'])
              : staticText.getIn(['data', 'textSeekingTruth'])}
          </p>
          <ButtonSignUp
            text={staticText.getIn(['data', 'joinGaia'])}
            type={BUTTON_SIGN_UP_TYPE_BUTTON}
            buttonClass={BUTTON_CLASS}
            onClick={onClickCta}
            scrollToTop
          />
        </div>
      </div>
    </div>
  )
}

CtaJoinDynamic.defaultProps = {
  siteSegment: -1,
}

CtaJoinDynamic.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
  siteSegment: PropTypes.number,
}

export default compose(
  connectRedux(
    ({ staticText }) => ({
      staticText: staticText.getIn(
        ['data', 'ctaJoinDynamic']),
    }),
  ),
)(CtaJoinDynamic)
