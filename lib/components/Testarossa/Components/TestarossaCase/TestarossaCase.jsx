import React from 'react'
import get from 'lodash/get'
import PropTypes from 'prop-types'
import assign from 'lodash/assign'
import toLower from 'lodash/toLower'
import isFunction from 'lodash/isFunction'
import { getCampaign, getSubject, getVariation } from 'services/testarossa'

const TestarossaCase = React.memo((props) => {
  const { children, unwrap, campaign: id } = props
  const campaign = getCampaign({ id })
  const subject = assign({}, getSubject({ campaign }))
  const variation = getVariation({ campaign })
  const component = isFunction(children)
    ? children(campaign, variation, subject) : children

  return unwrap
    ? (component)
    : (
      <section
        className={`testarossa-campaign ${toLower(id)}`}
        data-variation={get(variation, 'friendlyId')}
      >{component}
      </section>
    )
})

TestarossaCase.propTypes = {
  unwrap: PropTypes.bool,
  condition: PropTypes.func,
  campaign: PropTypes.string.isRequired,
  variation: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.array,
  ]),
}

export default TestarossaCase
