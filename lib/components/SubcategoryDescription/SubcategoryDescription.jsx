import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { truncate } from 'theme/web-app'
import _partial from 'lodash/partial'
import { TYPE_SUBCATEGORY_DESCRIPTION } from 'services/dialog'
import { connect as connectStaticText } from 'components/StaticText/connect'

function onClickShowDescription (props, e) {
  const { setOverlayDialogVisible } = props
  e.preventDefault()
  setOverlayDialogVisible(TYPE_SUBCATEGORY_DESCRIPTION)
}

function getDescriptionClassName (state) {
  return ['subcategory-description__description']
    .concat(
      state.description ? 'subcategory-description__description--hidden' : [],
    )
    .join(' ')
}

class SubcategoryDescription extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      description: null,
    }
  }

  componentDidMount () {
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState(() => ({
      description: truncate(this.props.description, 250),
    }))
  }

  render () {
    const { state, props } = this
    const { description = '', staticText } = props
    if (!description) {
      return null
    }
    return (
      <div className="subcategory-description">
        <p className={getDescriptionClassName(state)}>{description}</p>
        {this.state.description ? (
          <p className="subcategory-description__short-description">
            {this.state.description}
          </p>
        ) : null}
        { description.length >= 250 ?
          <button
            className="subcategory-description__read-more"
            onClick={_partial(onClickShowDescription, props)}
          >
            {staticText.getIn(['data', 'readMore'])}
          </button> :
          null
        }
      </div>
    )
  }
}

SubcategoryDescription.propTypes = {
  description: PropTypes.string,
  setOverlayDialogVisible: PropTypes.func,
  staticText: ImmutablePropTypes.map.isRequired,
}

SubcategoryDescription.defaultProps = {
  description: '',
}

const connectedSubcategoryDescription = connectStaticText({
  storeKey: 'subcategoryDescription',
})(SubcategoryDescription)

export default connectedSubcategoryDescription
