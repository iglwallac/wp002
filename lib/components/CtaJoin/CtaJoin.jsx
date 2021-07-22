import React from 'react'
import { H1, H2, HEADING_TYPES } from 'components/Heading'
import { Button, TYPES } from 'components/Button.v2'
import { URL_PLAN_SELECTION } from 'services/url/constants'
import { connect } from 'react-redux'

const CtaJoin = (props) => {
  const { staticText, auth } = props
  const isAnonymous = !auth.get('jwt')
  if (!isAnonymous) return null
  return (
    <div className="cta-join__section-join">
      <div className="cta-join__center">
        <H1 as={HEADING_TYPES.H2} className="cta-join__header" inverted>{staticText.getIn(['data', 'joinTitle'])}</H1>
        <p className="cta-join__join">{staticText.getIn(['data', 'joinText'])}</p>
        <H2 as={HEADING_TYPES.H3} className="cta-join__sub-header" inverted>{staticText.getIn(['data', 'joinSubTitle'])}</H2>
        <Button
          className="cta-join__button-join"
          type={TYPES.SECONDARY}
          url={URL_PLAN_SELECTION}
          inverted
        >{staticText.getIn(['data', 'joinGaia'])}
        </Button>
      </div>
    </div>
  )
}

export default connect(
  state => ({
    auth: state.auth,
    staticText: state.staticText.getIn(['data', 'ctaJoin']),
  }),

)(CtaJoin)
