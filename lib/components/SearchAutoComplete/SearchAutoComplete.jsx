import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Map, List } from 'immutable'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'
import { getBoundActions } from 'actions'
import _isFunction from 'lodash/isFunction'
import _debounce from 'lodash/debounce'
import _trim from 'lodash/trim'
import _replace from 'lodash/replace'
import Autosuggest from 'react-autosuggest'
import AutosuggestHighlightMatch from 'autosuggest-highlight/match'
import AutosuggestHighlightParse from 'autosuggest-highlight/parse'

function escapeRegexCharacters (str) {
  return _replace(str, /[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getDisplayValue (suggestion) {
  if (suggestion) {
    return suggestion
  }
  return null
}

function getMatchingSearch (data, value) {
  if (!data) {
    return []
  }
  let fixedValue = value
  if (!value) {
    fixedValue = ''
  }
  const escapedValue = escapeRegexCharacters(_trim(fixedValue))
  if (escapedValue === '') {
    return []
  }
  return data
  // removing filter to limit results to exact match substring of title
  // const regex = new RegExp(`\\b${escapedValue}`, 'i')
  // return data.filter(title => regex.test(getDisplayValue(title)))
}

const renderInputComponent = inputProps => (
  <div>
    <input {...inputProps} />
    <p className="mobile-placeholder-expander" />
  </div>
)

function renderSuggestion (suggestion, { query }) {
  const matches = AutosuggestHighlightMatch(suggestion, query)
  const parts = AutosuggestHighlightParse(suggestion, matches)

  return (
    <div className="suggestion-content">
      {parts.map((part, i) => {
        // We want to highlight the non matching substr
        const key = `opt-${i}`
        const className = !part.highlight ? 'highlight' : null
        return (<span className={className} key={key}>{part.text}</span>)
      })}
    </div>
  )
}

class SearchAutoComplete extends Component {
  static getDerivedStateFromProps = (props, state) => {
    const { value } = state
    const { search } = props
    const searchData = search.getIn(['autoComplete', 'results'], List()).toJS()

    const derivedState = {
      isLoading: search.getIn(['autoComplete', 'processing'], false),
      suggestions: getMatchingSearch(searchData, value),
    }

    return derivedState
  }

  constructor (props) {
    super(props)
    this.state = {
      value: props.value || '',
      suggestions: [],
      isLoading: false,
    }
  }

  onChange = (event, { newValue }) => {
    const { props } = this
    const { onChange } = props
    if (_isFunction(onChange)) {
      onChange(event)
    }
    this.setState({
      value: newValue || '',
    })
  }

  onSuggestionSelected = (event, { suggestion }) => {
    const {
      onSelect,
    } = this.props

    this.setState({
      value: suggestion || '',
      suggestions: [],
    })
    onSelect(suggestion)
  }

  onSuggestionsFetchRequested = ({ value }) => {
    this.debouncedSuggestions(value)
  }

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    })
  }

  onSuggestKeypress = (e) => {
    const { onSelect } = this.props
    if (e.keyCode === 13) {
      onSelect(e.target.value)
    }
  }

  loadSuggestions = (value) => {
    this.props.getAutoCompleteSearchData(value)
  }

  debouncedSuggestions = _debounce(this.loadSuggestions, 250);

  render () {
    const { label, placeholder } = this.props
    const { value, suggestions } = this.state
    const inputProps = {
      label,
      value,
      onChange: this.onChange,
      onKeyDown: this.onSuggestKeypress,
      placeholder,
    }

    return (
      <Autosuggest
        suggestions={suggestions}
        inputProps={inputProps}
        getSuggestionValue={getDisplayValue}
        renderInputComponent={renderInputComponent}
        renderSuggestion={renderSuggestion}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        onSuggestionSelected={this.onSuggestionSelected}
        focusInputOnSuggestionClick={false}
      />
    )
  }
}

SearchAutoComplete.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  search: ImmutablePropTypes.map,
  selectedValue: ImmutablePropTypes.map,
  onSelect: PropTypes.func.isRequired,
}

export default connect(
  state => ({
    search: state.search || Map(),
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      getAutoCompleteSearchData: actions.search.getAutoCompleteSearchData,
    }
  },
)(SearchAutoComplete)
