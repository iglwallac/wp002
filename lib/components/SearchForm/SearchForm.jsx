import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { compose } from 'recompose'
import { connect as connectRedux } from 'react-redux'
import { connect as connectRouter } from 'components/Router/connect'
import ToolTipArrow, { DIRECTION_UP } from 'components/ToolTipArrow'
import { Map } from 'immutable'
import FormsyForm from 'formsy-react'
import _get from 'lodash/get'
import _isArray from 'lodash/isArray'
import _isFunction from 'lodash/isFunction'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { historyRedirect } from 'services/navigation'
import SearchFormInput from 'components/SearchFormInput'
import Icon from 'components/Icon'

function getClassName (className, hidden) {
  const classes = ['search-form__form']
  if (hidden) {
    classes.push('search-form--visible')
  }

  if (_isArray(className)) {
    classes.push(...className)
  } else {
    classes.push(className)
  }

  return classes.join(' ')
}

function getButtonClassName (className) {
  const classes = ['icon--search', 'search-form-button__icon']
  if (className) classes.push(className)
  return classes
}

function getFilterClassName (className, active) {
  const classes = [className]
  if (active) {
    classes.push(`${className}--active`)
  }

  return classes.join(' ')
}

class SearchForm extends React.PureComponent {
  constructor (props) {
    super(props)

    const { staticText } = props
    this.state = {
      currentQuery: this.props.defaultSearchTerm,
      activeSort: this.props.defaultSearchSort,
      FILTERS: [
        {
          label: staticText.getIn(['data', 'relevance', 'label']),
          value: '', // passing nothing defaults the search to relevent
        },
        {
          label: staticText.getIn(['data', 'recent', 'label']),
          value: 'recent',
        },
        {
          label: staticText.getIn(['data', 'popular', 'label']),
          value: 'popular',
        },
        {
          label: staticText.getIn(['data', 'alpha', 'label']),
          value: 'alpha',
        },
      ],
    }
  }

  handleSearchQuery = (model = {}, resetForm) => {
    const { props, state } = this
    const { history, onSubmit, resetOnSubmit, auth, user = Map(), noSearchRedirect } = props
    const { activeSort } = state
    const { q } = model

    if (resetOnSubmit) {
      resetForm()
      document.activeElement.blur()
    }
    if (_isFunction(onSubmit)) {
      onSubmit(model)
      document.activeElement.blur()
    }
    if (noSearchRedirect) {
      return null
    }
    const language = user.getIn(['data', 'language'])
    // Only redirect if there is a query
    if (q) {
      this.setState({
        currentQuery: q,
      })
      const query = { q }
      if (activeSort && activeSort !== '') {
        query.sort = activeSort
      }
      historyRedirect({ history, url: '/search', query, auth, language })
    }
    return null
  }

  handleSortClick = (evt) => {
    const { props, state } = this
    const {
      userLanguage,
      history,
      auth,
    } = props

    const { activeSort } = state
    const value = evt.currentTarget.getAttribute('data-value')

    if (value === activeSort) return

    this.setState(() => ({
      activeSort: value,
    }))
    const currentQuery = _get(this.state, 'currentQuery')
    if (currentQuery && currentQuery !== '') {
      const query = { q: currentQuery }
      if (value && value !== '') {
        query.sort = value
      }
      historyRedirect({ language: userLanguage, url: '/search', history, query, auth })
    }
  }

  renderFilters = () => {
    const { state, props, handleSortClick } = this
    const { activeSort, FILTERS } = state
    const { isNav, hideFilters } = props

    if (isNav || hideFilters) return null

    return (
      <div className="search-form__filters-container">
        <ul className="search-form__filters-list">
          {
            FILTERS.map((item) => {
              const isActive = item.value === activeSort
              return (
                <li
                  key={`search-filter-${item.label}`}
                  className={getFilterClassName('search-form__filters-list-item', isActive)}
                >
                  <a
                    className={getFilterClassName('search-form__filter-button', isActive)}
                    data-value={item.value}
                    onClick={handleSortClick}
                  >
                    {item.label}
                  </a>
                </li>
              )
            })
          }
        </ul>
        <hr />
      </div>
    )
  }

  render () {
    const {
      props,
      handleSearchQuery,
      renderFilters,
    } = this

    const {
      className,
      defaultSearchTerm,
      searchInputClass,
      placeholderText,
      autofocus,
      hasButton,
      iconClass,
      children,
    } = props

    return (
      <div className="search-form">
        <FormsyForm
          className={getClassName(className)}
          onValidSubmit={handleSearchQuery}
        >
          <div className="search-form__input-wrapper">
            <SearchFormInput
              defaultValue={defaultSearchTerm}
              name="q"
              searchInputClass={searchInputClass}
              placeholderText={placeholderText}
              autofocus={autofocus}
            />
            {hasButton ? (
              <button type="submit" className="search-form-button">
                <Icon iconClass={getButtonClassName(iconClass)} />
              </button>
            ) : null}
          </div>
          {children}
        </FormsyForm>
        <ToolTipArrow
          direction={DIRECTION_UP}
          activeArrow="search-arrow"
        />
        { renderFilters() }
      </div>
    )
  }
}

SearchForm.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  defaultSearchTerm: PropTypes.string,
  defaultSearchSort: PropTypes.string,
  history: PropTypes.object.isRequired,
  placeholderText: PropTypes.string,
  searchInputClass: PropTypes.array,
  resetOnSubmit: PropTypes.bool,
  className: PropTypes.array,
  onSubmit: PropTypes.func,
  hasButton: PropTypes.bool,
  hideFilters: PropTypes.bool,
  iconClass: PropTypes.array,
  location: PropTypes.object,
  autofocus: PropTypes.bool,
  isNav: PropTypes.bool,
  noSearchRedirect: PropTypes.bool,
}

export default compose(
  connectRouter(),
  connectStaticText({ storeKey: 'search' }),
  connectRedux(state => ({
    userLanguage: state.user.getIn(['data', 'language']),
    auth: state.auth,
  })),
)(SearchForm)
