import PropTypes from 'prop-types'
import React, { PureComponent, Fragment } from 'react'
import _get from 'lodash/get'
import _partial from 'lodash/partial'
import _isEmpty from 'lodash/isEmpty'
import _reduce from 'lodash/reduce'
import _parseInt from 'lodash/parseInt'
import _some from 'lodash/some'
import ImmutablePropTypes from 'react-immutable-proptypes'
import Filter from 'components/Filter'
import SeoNavigationLinks from 'components/SeoNavigationLinks'
import { List, Map } from 'immutable'
import { getBoundActions } from 'actions'
import { connect as connectRedux } from 'react-redux'
import {
  FILTER_SET_DEFAULT,
  FILTER_SET_YOGA,
  FILTER_SET_FITNESS,
  FILTER_SET_RECIPE,
  FILTER_SET_ORIGINAL,
  FILTER_SET_CONSCIOUS,
} from 'services/filter-set'
import {
  DEFAULT_PATH_YOGA,
  DEFAULT_PATH_FITNESS,
  DEFAULT_PATH_RECIPE,
  DEFAULT_PATH_ORIGINAL,
  DEFAULT_PATH_CONSCIOUS,
} from 'services/url/constants'
import { historyRedirect } from 'services/navigation'
import { connect as languageConnect } from 'components/Language/connect'
import { connect as staticTextConnect } from 'components/StaticText/connect'
import { compose } from 'recompose'
import YogaFilter from 'components/YogaFilter'
import YogaLabels from 'components/YogaLabels'

import {
  createUpstreamContext,
  SCREEN_TYPE_SUBCATEGORY,
  CONTEXT_TYPE_SUBCATEGORY_YOGA_CLASSIC_FACET,
  ALL_YOGA_PRACTICES_ID,
  YOGA_FITNESS_ID,
  RECIPES_ID,
} from 'services/upstream-context'

export const CATEGORY_YOGA = 'yoga'
const CATEGORY_FITNESS = 'fitness'
const CATEGORY_RECIPE = 'recipe'
const URL_CHANGE_TYPE_PATH = 'path'
const URL_CHANGE_TYPE_QUERY = 'query'
const BROWSER = process.env.BROWSER


function createOnLanguageChange (actions) {
  return actions.filterSet.resetFilterSetData
}

function changeLocation (filterOption, props, data, urlChangeType) {
  const {
    selectedFilterSet,
    filterSet,
    location,
    history,
    auth,
    user = Map(),
  } = props
  const query = _get(location, 'query', {})
  let path = _get(filterOption, 'path')
  let param = data.get('param')
  const value = _get(filterOption, 'value')
  const filterSetData = filterSet.getIn([selectedFilterSet, 'data'])
  if (value === null) {
    // Find the filter type so we can get options from the filter store.
    // Also keep the query value so we can find the selected filter option.
    // Save these things in the reduction.
    const nextSlugData = _reduce(
      location.query,
      (reduction, queryValue, queryParam) => {
        if (reduction) {
          return reduction
        }
        // From the available filters for this data find the first one
        // where it has a query paramter in the URL.
        const queryFilterSet = filterSetData.find(
          item => item.get('param') === queryParam,
        )
        // If we found a data filter save the filter type and the query value
        // to do work on the fitler store.
        if (queryFilterSet) {
          return {
            type: queryFilterSet.get('type'),
            queryValue,
            queryParam,
          }
        }
        return reduction
      },
      null,
    )
    // We don't yet have the path for the the next slug so we need to get
    // option that is selected based on the query, then use its path.
    if (nextSlugData) {
      const previousData = filterSetData.find(
        item => item.get('type') === nextSlugData.type,
      )
      if (previousData) {
        const selectedOption = previousData
          .getIn(['filter', 'options'], List())
          .find(
            option =>
              option.get('value') === _parseInt(nextSlugData.queryValue),
          )
        // If we found a selected option use its param and path instead
        // of the filter from the onChange event.
        if (selectedOption) {
          param = nextSlugData.queryParam
          path = selectedOption.get('path')
        }
      }
    }
  }
  if (urlChangeType === URL_CHANGE_TYPE_PATH && path) {
    query[param] = undefined // Remove the query parameter if is in use
    if (selectedFilterSet !== FILTER_SET_DEFAULT) {
      query['filter-set'] = selectedFilterSet
    }
    const language = user.getIn(['data', 'language'])
    historyRedirect({ history, url: path, query, auth, language })
    return
  }
  changeLocationQuery(props, data, _get(filterOption, 'value'))
}

function changeLocationQuery (props, data, value) {
  const { selectedFilterSet, location, history, auth, user = Map() } = props
  const param = data.get('param')
  const { pathname, query = {} } = location
  query[param] = value === null ? undefined : value
  // If the pager is in use, remove it as soon as the filters are interacted with
  query.page = undefined
  if (selectedFilterSet !== FILTER_SET_DEFAULT) {
    query['filter-set'] = selectedFilterSet
  }
  const language = user.getIn(['data', 'language'])
  historyRedirect({ history, url: pathname, query, auth, language })
}

function onChangeFilter (filterOption, props, data, urlChangeType, setParam) {
  const param = data.get('param')
  const option = _get(filterOption, 'name')
  if (setParam) {
    setParam(param, option)
  }
  const { selectedFilterSet } = props
  if (selectedFilterSet === FILTER_SET_DEFAULT) {
    return changeLocationQuery(props, data, _get(filterOption, 'value', null))
  }
  return changeLocation(filterOption, props, data, urlChangeType)
}

function reduceSeoLinks (reduction, option) {
  if (option.get('path')) {
    const link = Map({
      name: option.get('name'),
      path: option.get('path'),
    })
    return reduction.push(link)
  }
  return reduction
}

function getLocationPath (location) {
  return location.pathname.replace(/^\//, '')
}

function getDefaultPath (filterSet) {
  switch (filterSet) {
    case FILTER_SET_YOGA:
      return DEFAULT_PATH_YOGA
    case FILTER_SET_FITNESS:
      return DEFAULT_PATH_FITNESS
    case FILTER_SET_RECIPE:
      return DEFAULT_PATH_RECIPE
    case FILTER_SET_ORIGINAL:
      return DEFAULT_PATH_ORIGINAL
    case FILTER_SET_CONSCIOUS:
      return DEFAULT_PATH_CONSCIOUS
    default:
      if (BROWSER) {
        return window.location.pathname.slice(1)
      }

      return ''
  }
}

function getPathIsInOptions (options, path) {
  return options.some(option => option.get('path') === path)
}

function getUrlChangeType (location, options, isDefaultPath) {
  const path = getLocationPath(location)
  const pathInOptions = getPathIsInOptions(options, path)
  if (isDefaultPath || pathInOptions) {
    return URL_CHANGE_TYPE_PATH
  }
  return URL_CHANGE_TYPE_QUERY
}

function getFilterDefaultOption (options, location, param, sortType) {
  const path = getLocationPath(location)
  const defaultValue = _get(location, ['query', param]) || sortType
  return options.find((v) => {
    // Query values are strings so we need to compare correctly
    const optionValue = v.get('value') ? v.get('value').toString() : undefined
    return v.get('path') === path || (defaultValue && optionValue === defaultValue)
  })
}

function getClassName (props) {
  const { selectedFilterSet } = props
  return [
    'filter-container',
    `filter-container--${selectedFilterSet}`,
  ].join(
    ' ',
  )
}

function getLabelClassName (props) {
  const { filterSet, selectedFilterSet } = props
  const classes = [
    'filter-container__compact-label',
    `filter-container--${selectedFilterSet}__compact-label`,
  ]
  if (filterSet.get('expanded')) {
    classes.push('filter-container__compact-label--active')
  }
  return classes.join(' ')
}

function getContainerClassName (props) {
  const { filterSet, selectedFilterSet } = props

  return [
    'filter-container__filters',
    `filter-container--${selectedFilterSet}__filters`,
    filterSet.get('expanded')
      ? 'filter-container__filters--expanded'
      : 'filter-container__filters--collapsed',
  ].join(' ')
}

function getClearClassName (props) {
  const { selectedFilterSet } = props
  const classes = ['filter-container__clear-filters']
  if (selectedFilterSet === FILTER_SET_DEFAULT) {
    classes.push('filter-container__clear-filters--default')
  }
  return classes.join(' ')
}

function getToggleClassName (props) {
  const { filterSet, selectedFilterSet } = props
  return [
    'filter-container__toggle-button-container',
    selectedFilterSet === FILTER_SET_DEFAULT
      ? 'filter-container__toggle-button-container--default'
      : 'filter-container__toggle-button-container--yoga',
    filterSet.get('expanded')
      ? 'filter-container__toggle-button--expanded'
      : 'filter-container__toggle-button--collapsed',
  ].join(' ')
}

function clearFilters (props) {
  const {
    selectedFilterSet,
    history,
    setFilterSetExpanded,
    auth,
    user = Map(),
  } = props
  setFilterSetExpanded(false)
  const language = user.getIn(['data', 'language'])
  historyRedirect({
    history,
    url: `${getDefaultPath(selectedFilterSet)}`,
    auth,
    language,
  })
}

function renderClearAll (props) {
  const { selectedFilterSet, filterSet, staticTextFilterContainer } = props
  const data = filterSet.getIn([selectedFilterSet, 'data'])
  let hasFilters

  if (BROWSER) {
    hasFilters = window.location.pathname.slice(1) !== getDefaultPath(selectedFilterSet)
  }

  if (
    !selectedFilterSet ||
    selectedFilterSet === FILTER_SET_DEFAULT ||
    !data ||
    data.size === 0 ||
    !hasFilters
  ) {
    return null
  }
  return (
    <div className={getClearClassName(props)}>
      <span
        className={'filter-container__clear-filters-text'}
        onClick={_partial(clearFilters, props)}
      >
        {staticTextFilterContainer.getIn(['data', 'clearFilters'])}
      </span>
    </div>
  )
}

function renderTotal (props) {
  const {
    selectedFilterSet,
    staticTextFilterContainer,
    tiles,
  } = props
  const total = tiles.getIn(['subcategory', 'data', 'totalCount'], null)
  let hasFilters

  if (BROWSER) {
    hasFilters = window.location.pathname.slice(1) !== getDefaultPath(selectedFilterSet)
  }

  if (!total || !hasFilters) {
    return null
  }

  return (
    <div className="filter-container__total">
      {`${total} ${staticTextFilterContainer.getIn(['data', 'results'])}`}
    </div>
  )
}

function onClickExpand (e, props) {
  e.stopPropagation()
  const { filterSet, setFilterSetExpanded } = props
  const expanded = filterSet.get('expanded')
  if (setFilterSetExpanded) {
    setFilterSetExpanded(!expanded)
  }
}

function updateData (props) {
  const { user = Map(), filterSet, selectedFilterSet, getFilterSetData } = props

  if (
    !filterSet.get(selectedFilterSet) &&
    !filterSet.getIn([selectedFilterSet, 'processing'])
  ) {
    getFilterSetData({ filterSet: selectedFilterSet, user })
  }
}

function updateFilterSet (props) {
  const { filterSet, setFilterSetVisible } = props

  if (!filterSet.get('visible')) {
    setFilterSetVisible(true)
  }
  updateData(props)
}

class FilterContainer extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      activeIndex: null,
      yogaOptionsVisible: true,
    }
  }
  componentDidMount () {
    updateFilterSet(this.props)
  }

  componentWillReceiveProps (nextProps) {
    if (!process.env.BROWSER) {
      return
    }
    updateFilterSet(nextProps)
  }

  setActive = (index) => {
    const { activeIndex } = this.state
    if (index === activeIndex) {
      this.setState({
        activeIndex: null,
        yogaOptionsVisible: true,
      })
    } else {
      this.setState({
        activeIndex: index,
        yogaOptionsVisible: false,
      })
    }
  }

  setParam = (param, option) => {
    this.setState({ [param]: option })
  }

  closeShelf = () => {
    this.setState({
      yogaOptionsVisible: true,
      activeIndex: null,
    })
  }

  mapFilterSetYogaData = (isDefaultPath, data, i) => {
    const {
      props,
      setParam,
      closeShelf,
      state,
    } = this
    const { activeIndex } = state
    const {
      selectedFilterSet,
      filterSet,
      staticTextFilterContainer,
      location,
      auth,
      app,
      page,
    } = props
    const options = data.getIn(['filter', 'options'])
    if (!options) {
      return null
    }
    const type = data.get('type')
    const param = data.get('param')
    const label = staticTextFilterContainer.getIn(
      ['data', 'filterSetLabels', type, 'label'],
      '',
    )
    const allText = staticTextFilterContainer.getIn(
      ['data', 'all'],
      'All',
    )
    const urlChangeType =
      selectedFilterSet === FILTER_SET_DEFAULT
        ? URL_CHANGE_TYPE_QUERY
        : getUrlChangeType(location, options, isDefaultPath)
    const defaultOption = getFilterDefaultOption(options, location, param)
    // No links should be shown on query pages.
    const links = _isEmpty(location.query)
      ? options.reduce(reduceSeoLinks, List())
      : List()

    return (
      <div className="filter-container__yoga-filters--large" key={`${selectedFilterSet}-${type}`}>
        <YogaFilter
          key={label}
          defaultOption={defaultOption}
          onChange={_partial(
            onChangeFilter,
            _partial.placeholder,
            props,
            data,
            urlChangeType,
            setParam,
          )}
          options={options}
          isCompact={!!filterSet.get('expanded')}
          label={label}
          placeholder={
            data.get('allOptionPath') ? allText : options.getIn([0, 'name'])
          }
          param={param}
          setParam={setParam}
          closeShelf={closeShelf}
          auth={auth}
          app={app}
          page={page}
          location={location}
          active={i === activeIndex}
        />
        {links.size === 0 ? null : <SeoNavigationLinks links={links} />}
      </div>
    )
  }

  mapFilterSetData = (isDefaultPath, data, i) => {
    const { props } = this
    const {
      selectedFilterSet,
      filterSet,
      staticTextFilterContainer,
      location,
      tiles,
    } = props
    const sortType = tiles.getIn(['subcategory', 'data', 'sortType'], '')
    const options = data.getIn(['filter', 'options'])
    if (!options) {
      return null
    }
    const type = data.get('type')
    const param = data.get('param')
    const label = staticTextFilterContainer.getIn(
      ['data', 'filterSetLabels', type, 'label'],
      '',
    )
    const allText = staticTextFilterContainer.getIn(
      ['data', 'all'],
      'All',
    )
    const urlChangeType =
      selectedFilterSet === FILTER_SET_DEFAULT
        ? URL_CHANGE_TYPE_QUERY
        : getUrlChangeType(location, options, isDefaultPath)
    const defaultOption = getFilterDefaultOption(options, location, param, sortType)
    // No links should be shown on query pages.
    const links = _isEmpty(location.query)
      ? options.reduce(reduceSeoLinks, List())
      : List()
    return (
      <div
        key={`${selectedFilterSet}-${type}`}
        className={`filter filter--${selectedFilterSet}`}
      >
        {!filterSet.get('visible') ? null : (
          <Filter
            defaultOption={defaultOption}
            onChange={_partial(
              onChangeFilter,
              _partial.placeholder,
              props,
              data,
              urlChangeType,
            )}
            options={options}
            isCompact={!!filterSet.get('expanded')}
            label={label}
            placeholder={
              data.get('allOptionPath') ? allText : options.getIn([0, 'name'])
            }
            i={i}
          />
        )}
        {links.size === 0 ? null : <SeoNavigationLinks links={links} />}
      </div>
    )
  }

  renderFilters = () => {
    const { props,
      state,
      setActive,
      mapFilterSetData,
      mapFilterSetYogaData,
    } = this
    const { activeIndex, yogaOptionsVisible } = state
    const {
      filterSet,
      selectedFilterSet,
      location,
      staticTextFilterContainer,
      auth,
      app,
      page,
    } = props
    const data = filterSet.getIn([selectedFilterSet, 'data'])
    if (!data || data.size === 0) {
      return null
    }
    const filtersAllParams = data.reduce(
      (reduction, item) => reduction.concat(item.get('param')),
      List(),
    )
    // There is a parameter that we know about in the URL query.
    const knownFilterParamInQuery = _some(_get(location, 'query', {}), (v, k) =>
      filtersAllParams.includes(k),
    )
    const path = getLocationPath(location)
    const knownFilterPath = data.some((item) => {
      const options = item.getIn(['filter', 'options'], List())
      return getPathIsInOptions(options, path)
    })
    // There is a path that we know about in the URL.
    const isDefaultPath = !knownFilterParamInQuery && !knownFilterPath
    let params = null
    if (selectedFilterSet === CATEGORY_YOGA) {
      params = ALL_YOGA_PRACTICES_ID
    } else if (selectedFilterSet === CATEGORY_FITNESS) {
      params = YOGA_FITNESS_ID
    } else if (selectedFilterSet === CATEGORY_RECIPE) {
      params = RECIPES_ID
    }

    const upstreamContext = createUpstreamContext({
      screenType: SCREEN_TYPE_SUBCATEGORY,
      screenParam: params,
      contextType: CONTEXT_TYPE_SUBCATEGORY_YOGA_CLASSIC_FACET,
    })

    const filters = () => {
      return data.map((option, i) => {
        return mapFilterSetData(
          isDefaultPath,
          option,
          i,
          upstreamContext,
        )
      })
    }

    const yogaFilters = () => {
      return data.map((option, i) => {
        return mapFilterSetYogaData(
          isDefaultPath,
          option,
          i,
          upstreamContext,
        )
      })
    }

    if (selectedFilterSet === CATEGORY_YOGA
      || selectedFilterSet === CATEGORY_FITNESS
      || selectedFilterSet === CATEGORY_RECIPE) {
      return (
        <div>
          <div className="filter-container__yoga-filters--container filter-container__yoga-filters--large">
            <YogaLabels
              data={data}
              activeIndex={activeIndex}
              setActive={setActive}
              staticTextFilterContainer={staticTextFilterContainer}
              yogaOptionsVisible={yogaOptionsVisible}
              upstreamContext={upstreamContext}
              auth={auth}
              app={app}
              page={page}
              location={location}
              getFilterDefaultOption={getFilterDefaultOption}
              filterSet={selectedFilterSet}
            />
            { yogaOptionsVisible ?
              <div className="filter-container__yoga-labels-divider" /> : null
            }
            { yogaFilters() }
          </div>
          <div className="filter-container__yoga-filters--small">
            { filters() }
          </div>
        </div>
      )
    }
    return filters()
  }

  renderContainer = () => {
    const {
      props,
      renderFilters,
    } = this
    const { staticTextFilterContainer } = props
    const onClickExpandPartial = _partial(
      onClickExpand,
      _partial.placeholder,
      props,
    )
    return (
      <Fragment>
        <div className={getClassName(props, 'yogaFilter')}>
          <div
            className={getLabelClassName(props)}
            onClick={onClickExpandPartial}
          >
            <span className={'filter-container__compact-label-text'}>
              { staticTextFilterContainer.getIn(['data', 'filterAndSort']) }
            </span>
          </div>
          <div
            className={getToggleClassName(props)}
            onClick={onClickExpandPartial}
          />
          <div className={getContainerClassName(props)}>
            <div className="filter-container__controls">
              { renderFilters() }
            </div>
            { renderClearAll(props) }
          </div>
        </div>
        { renderTotal(props) }
      </Fragment>
    )
  }

  render () {
    const { props, renderContainer } = this
    const { selectedFilterSet } = props
    const isYogaFilters =
      selectedFilterSet === CATEGORY_YOGA ||
      selectedFilterSet === CATEGORY_FITNESS ||
      selectedFilterSet === CATEGORY_RECIPE
    const containerClass = isYogaFilters ? 'filter-container__yoga-filters--wrapper' : ''
    return (
      <div className={containerClass}>
        { renderContainer() }
      </div>
    )
  }
}

FilterContainer.propTypes = {
  user: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  selectedFilterSet: PropTypes.string.isRequired,
  filterSet: ImmutablePropTypes.map.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  staticTextFilterContainer: ImmutablePropTypes.map.isRequired,
  getFilterSetData: PropTypes.func.isRequired,
  setFilterSetExpanded: PropTypes.func.isRequired,
  setFilterSetVisible: PropTypes.func.isRequired,
}

FilterContainer.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default compose(
  connectRedux(
    state => ({
      filterSet: state.filterSet,
      user: state.user,
      auth: state.auth,
      app: state.app,
      page: state.page,
      tiles: state.tiles,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        getFilterSetData: actions.filterSet.getFilterSetData,
        setFilterSetExpanded: actions.filterSet.setFilterSetExpanded,
        setFilterSetVisible: actions.filterSet.setFilterSetVisible,
      }
    },
  ),
  staticTextConnect({
    storeKey: 'filterContainer',
    propName: 'staticTextFilterContainer',
  }),
  languageConnect({ createOnLanguageChange }),
)(FilterContainer)
