import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { withFormsy as HOC } from 'formsy-react'
import SearchAutoComplete from 'components/SearchAutoComplete'

function getClassName (className = []) {
  return ['search-form__input'].concat(className).join(' ')
}

class SearchFormInput extends React.PureComponent {
  constructor (props) {
    super(props)
    this.submitBtnRef = (element) => {
      this.submitBtn = element
    }
  }

  componentDidMount () {
    const { props } = this
    const { defaultValue, setValue } = props
    setValue(defaultValue || '')
  }

  onAutoChange = (e) => {
    const { props } = this
    const { setValue } = props
    setValue(e.target.value)
  }

  onSelect = (value) => {
    const { props } = this
    const { setValue } = props
    setValue(value)

    setTimeout(() => {
      // Trigger a form submit event for formsy to handle
      if (!this.submitBtn) {
        return
      }
      this.submitBtn.click()
    }, 1)
  }

  render () {
    const { props } = this
    const {
      staticText,
      name,
      placeholderText,
      searchInputClass,
      defaultValue,
    } = props
    const defaultPlaceholderText = staticText.getIn([
      'data',
      'defaultPlaceholder',
    ])
    const hiddenStyle = { display: 'none' }

    return (
      <div>
        <SearchAutoComplete
          label={name}
          className={getClassName(searchInputClass)}
          onChange={this.onAutoChange}
          value={defaultValue || ''}
          placeholder={placeholderText || defaultPlaceholderText}
          onSelect={this.onSelect}
        />
        <button
          type="submit"
          ref={this.submitBtnRef}
          style={hiddenStyle}
        />
      </div>
    )
  }
}

SearchFormInput.propTypes = {
  name: PropTypes.string.isRequired,
  defaultValue: PropTypes.string,
  placeholderText: PropTypes.string,
  staticText: ImmutablePropTypes.map.isRequired,
  searchInputClass: PropTypes.array,
  autofocus: PropTypes.bool,
}

// SearchFormInput.contextTypes = {
//   store: PropTypes.object.isRequired,
// }

const connectedSearchFormInput = connectStaticText({ storeKey: 'searchFormInput' })(
  HOC(SearchFormInput),
)

export default connectedSearchFormInput
