import React from 'react'
import { getBoundActions } from 'actions'
import { connect as connectRedux } from 'react-redux'
import { List, Map, fromJS } from 'immutable'
import parseInt from 'lodash/parseInt'
import { compose } from 'recompose'
import { connect as staticTextConnect } from 'components/StaticText/connect'
import { historyRedirect } from 'services/navigation'
import FormsyForm from 'formsy-react'
import { Select } from 'components/FormInput.v2/FormInput'
import { Button, TYPES, SIZES } from 'components/Button.v2'
import { ICON_TYPES } from 'components/Icon.v2'
import { URL_FILMS_DOCS } from 'services/url/constants'
import { EN, ES } from 'services/languages/constants'
import { getPrimary } from 'services/languages'
import { H3, HEADING_TYPES } from 'components/Heading'

const subjectLangs = [EN, ES]

const sendGAEvent = (filterName, filterValue, pageCategory) => {
  const event = {
    event: 'customEvent',
    eventCategory: 'Filter',
    eventAction: `${filterName}`,
    eventLabel: `${filterValue} | ${pageCategory}`,
  }
  const dataLayer = global.dataLayer
  if (typeof dataLayer.push === 'function') {
    dataLayer.push(event)
  }
}

const FAT = (props) => {
  return (
    <div className="fat">
      {props.children}
    </div>
  )
}

// param type change whole path
// param subject use value
const FILTER_SET = 'filter-set'
const SUBJECT = 'subject'
const TYPE = 'type'
const SORT = 'sort'
class FatFilterContainer extends React.Component {
  constructor (props) {
    super(props)
    const { resolver, filterSet } = props

    // Persist type on url change
    const selectedFilter = resolver.getIn(['data', 'filter'])
    const selectedFilterSetId = resolver.getIn(['data', 'id'])
    const activeFilterSet = filterSet.find(i => i.get('param') === selectedFilter) || Map()
    const options = activeFilterSet.getIn(['filter', 'options'], List())
    const selectedIndex = options.findIndex(option => option.get('value') === selectedFilterSetId)
    const initialState = {
      [selectedFilter]: selectedIndex,
      filtersHidden: true,
    }
    // Persist queries on url change
    const query = resolver.get('query')
    const keys = query.keySeq().toList()
    keys.forEach((key) => {
      filterSet.forEach((filter) => {
        const queryParam = filter.get('param')
        if (queryParam === key) {
          const queryOptions = filter.getIn(['filter', 'options'], List())
          const queryId = isNaN(query.get(key)) ? query.get(key) : parseInt(query.get(key), 0)
          const selectedQueryIndex = queryOptions.findIndex(option => option.get('value') === queryId)
          initialState[queryParam] = selectedQueryIndex
        }
      })
    })
    this.state = initialState
  }

  componentDidMount () {
    this.initialState = this.state
  }

  clearFilters = () => {
    const { filterSet } = this.props

    filterSet.forEach((filter) => {
      const param = filter.get('param')
      const obj = { [param]: 0 }
      this.setState(obj)
    })
    this.props.history.push('/films-docs/all-films')
  }

  handleFilterChange = (index, filterData, options) => {
    const {
      history,
      auth,
      language,
      selectedFilterSet,
      resolver,
    } = this.props

    const option = options.get(index)
    const val = option.get('value')
    const param = filterData.get('param')
    let url = resolver.get('path')
    let query = resolver.get('query')

    if (param === SUBJECT) {
      if (val) {
        query = query
          .set(FILTER_SET, selectedFilterSet)
          .set(SUBJECT, val)
      } else {
        // this handles the all selection
        query = Map()
      }
    }

    if (param === SORT) {
      query = query
        .set(SORT, val)
    }

    if (param === TYPE) {
      url = option.get('path')
    }

    sendGAEvent(param, option.get('name'), resolver.get('path').split('/').pop())
    this.setState({ [param]: parseInt(index) })

    historyRedirect({
      history,
      url,
      query,
      auth,
      language,
    })
  }

  renderFilters = () => {
    const { props, renderSelect } = this
    const { filterSet, staticTextFilterContainer, language } = props
    const primaryLang = getPrimary(language)

    return (
      filterSet.map((filter, i) => {
        let label = ''
        let clearFilters
        if (i === 0) label = staticTextFilterContainer.getIn(['data', 'filter'])
        if (i + 1 === filterSet.size) {
          label = staticTextFilterContainer.getIn(['data', 'filterSetLabels', 'sort_by', 'label'])
        }
        if (i + 2 === filterSet.size) clearFilters = true

        if (filter.get('param') === SUBJECT && !subjectLangs.includes(primaryLang)) {
          return null
        }
        return (
          <div className="ffc__select-wrapper" key={filter.get('type')}>
            {clearFilters ?
              <Button
                className="ffc__filter-label ffc__clear-filters"
                type={TYPES.GHOST}
                onClick={this.clearFilters}
              >
                {staticTextFilterContainer.getIn(['data', 'clearFilters'])}
              </Button>
              :
              <div className="ffc__filter-label">{label}</div>
            }
            {renderSelect(filter)}
          </div>
        )
      })
    )
  }

  renderSelect = (filterData) => {
    const { handleFilterChange, state, props } = this
    const { staticTextFilterContainer } = props
    const options = filterData.getIn(['filter', 'options'], List())
    const param = filterData.get('param')
    const selectedIndex = Math.max(0, state[param]) || 0
    // update if there are more than two filters
    const label = param === 'type' ?
      staticTextFilterContainer.getIn(['data', 'filterSetLabels', 'film_type', 'label']) :
      staticTextFilterContainer.getIn(['data', 'filterSetLabels', 'film_subject', 'label'])

    return (
      <Select
        key={filterData.get('type')}
        name={filterData.get('type')}
        onChange={e => handleFilterChange(e, filterData, options)}
        label={label}
        value={parseInt(selectedIndex, 0)}
        className="ffc__select"
      >
        {options.map((option, i) => {
          const value = option.get('value')
          return (
            <option
              key={value}
              value={i}
              className="ffc__option"
            >
              {option.get('name')}
            </option>
          )
        })}
      </Select>
    )
  }

  render () {
    const { state, props } = this
    const { staticTextFilterContainer, resolver } = props
    const { filtersHidden } = state

    if (!resolver.get('path').includes(URL_FILMS_DOCS)) return null

    return (
      <FAT>
        <div className="ffc">
          <Button
            className={`ffc__mobile-button ${filtersHidden ? '' : 'ffc__hidden-mobile'}`}
            type={TYPES.SECONDARY}
            onClick={() => this.setState({ filtersHidden: !filtersHidden })}
          >
            {staticTextFilterContainer.getIn(['data', 'filter&Sort'])}
          </Button>
          <FormsyForm
            className={`ffc__form ${filtersHidden ? 'ffc__hidden-mobile' : ''}`}
          >
            <div className="ffc__mobile-close-button-wrapper">
              <Button
                className="ffc__mobile--close-button"
                icon={ICON_TYPES.CLOSE}
                onClick={() => this.setState({ filtersHidden: !filtersHidden })}
                size={SIZES.DEFAULT}
                type={TYPES.ICON}
              />
            </div>
            <H3 as={HEADING_TYPES.H4} className="ffc__mobile-header">{staticTextFilterContainer.getIn(['data', 'filter&Sort'])}</H3>
            {this.renderFilters()}
          </FormsyForm>
        </div>
      </FAT>
    )
  }
}

export default compose(
  connectRedux(
    (state, props) => {
      const { selectedFilterSet } = props
      const filterSet = state.filterSet.getIn([selectedFilterSet, 'data'], List())
      const language = state.user.getIn(['data', 'language'])
      return {
        filterSet: fromJS(filterSet),
        user: state.user,
        auth: state.auth,
        app: state.app,
        page: state.page,
        tiles: state.tiles,
        resolver: state.resolver,
        language,
      }
    },
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
)(FatFilterContainer)
