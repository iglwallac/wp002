import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { STORE_KEY_SUBCATEGORY } from 'services/store-keys'
import { connect as connectRedux } from 'react-redux'
import { H4 } from 'components/Heading'

function SubcategoryDescriptionFull (props) {
  const { jumbotron } = props
  const title = jumbotron.getIn([STORE_KEY_SUBCATEGORY, 'data', 'title'], '')
  const description = jumbotron.getIn(
    [STORE_KEY_SUBCATEGORY, 'data', 'description'],
    '',
  )
  if (!description) {
    return null
  }
  return (
    <div className="subcategory-description-full">
      <H4 className="subcategory-description-full__title">{title}</H4>
      <p className="subcategory-description-full__description">{description}</p>
    </div>
  )
}

SubcategoryDescriptionFull.propTypes = {
  jumbotron: ImmutablePropTypes.map.isRequired,
}

export default connectRedux(state => ({
  jumbotron: state.jumbotron.filter(
    (val, key) => key === STORE_KEY_SUBCATEGORY,
  ),
}))(SubcategoryDescriptionFull)
