import { Map } from 'immutable'
import PropTypes from 'prop-types'
import compose from 'recompose/compose'
import React, { useEffect, useState } from 'react'
import scriptLoader from 'react-async-script-loader'
import { connect as connectRedux } from 'react-redux'
import Sherpa, { TYPE_LARGE } from 'components/Sherpa'
import { H3, H4 } from 'components/Heading'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { getPrimary } from 'services/languages'
import {
  EN,
  EN_US,
  ES,
  ES_ES,
  DE,
  DE_DE,
  FR,
} from 'services/languages/constants'

const CLASS_NAME_SHERPA = ['trust-pilot__sherpa']

function TrustPilot ({ isScriptLoaded, staticText, isScriptLoadSucceed, typeTwoColumn, language }) {
  // we need to store the language locally to help trigger re-renders
  // when the language is changed
  const [selectedLanguage, setSelectedLanguage] = useState(language)
  const languageChosen = language === selectedLanguage

  // create ref to div el which will represent the TrustPilot
  const ref = React.useRef(null)

  // selectedReview -> Passes as the English Default
  const selectedReview = 'SelectedReview'

  useEffect(() => {
    // If script is loaded, load Trustpilot from our ref
    if (isScriptLoadSucceed && ref.current) {
      global.Trustpilot.loadFromElement(ref.current)
    }
  }, [isScriptLoadSucceed, languageChosen])

  useEffect(() => {
    setSelectedLanguage(language)
  }, [language])

  const trustPilotOneColumn = () => {
    return (
      <React.Fragment>
        <div className="trust-pilot__container trust-pilot__container--one-column">
          <H3 className="trust-pilot__title trust-pilot__title--one">{staticText.getIn(['data', 'trustPilotTitle'])}</H3>
          <div className="trust-pilot__wrapper">
            {renderTrustPilotModule()}
          </div>
        </div>
      </React.Fragment>
    )
  }

  const trustPilotTwoColumn = () => {
    return (
      <React.Fragment>
        <div className="trust-pilot__container trust-pilot__container--two-column">
          <H3 className="trust-pilot__title trust-pilot__title--two-column">{staticText.getIn(['data', 'trustPilotTitleOurMembers'])}</H3>
          <H4 className="trust-pilot__sub-title trust-pilot__sub-title--two-column">{staticText.getIn(['data', 'trustPilotWeAreHumbled'])}</H4>
        </div>
        <div className="trust-pilot__wrapper trust-pilot__wrapper--two-column">
          {renderTrustPilotModule()}
        </div>
      </React.Fragment>
    )
  }

  const langLocale = () => {
    if (language === ES) {
      return ES_ES
    } else if (language === DE) {
      return DE_DE
    }
    return EN_US
  }

  const languageDataTags = () => {
    if (language !== EN) {
      return language
    }
    return selectedReview
  }

  const renderTrustPilotModule = () => {
    return (
      <div
        ref={ref}
        className="trustpilot-widget"
        data-locale={langLocale()}
        data-template-id="54ad5defc6454f065c28af8b"
        data-businessunit-id="5ae1cb58b2e9b800018faa95"
        data-style-height="240px"
        data-style-width="100%"
        data-theme="light"
        data-tags={languageDataTags()}
        data-stars="1,2,3,4,5"
      />
    )
  }

  const renderTrustPilot = () => {
    return (
      typeTwoColumn ? trustPilotTwoColumn() : trustPilotOneColumn()
    )
  }

  // during the transition of selecting a new language render null
  if (language !== selectedLanguage || language === FR) {
    return null
  }

  return (
    <div className={typeTwoColumn ? 'trust-pilot trust-pilot--two-column' : 'trust-pilot trust-pilot--one-column'}>
      {!isScriptLoaded ? (
        <Sherpa className={CLASS_NAME_SHERPA} type={TYPE_LARGE} />
      ) : null }
      {isScriptLoaded && isScriptLoadSucceed ? (
        renderTrustPilot()
      ) : null }
      {isScriptLoaded && !isScriptLoadSucceed ? (
        <p>
          {staticText.getIn(['data', 'trustPilotNotLoading'])}&#8200;
          <a href="https://www.trustpilot.com/review/gaia.com" target="_blank" rel="noopener noreferrer">Trustpilot</a>.
        </p>
      ) : null }
    </div>
  )
}

TrustPilot.propTypes = {
  isScriptLoaded: PropTypes.bool,
  isScriptLoadSucceed: PropTypes.bool,
  staticText: ImmutablePropTypes.map.isRequired,
  typeTwoColumn: PropTypes.bool,
  language: PropTypes.string,
}

export default compose(
  connectRedux(state => ({
    staticText: state.staticText.getIn(['data', 'trustPilot'], Map()),
    language: getPrimary(state.user.getIn(['data', 'language'])),
  }),
  ),
  scriptLoader([
    '//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js',
  ]),
)(TrustPilot)
