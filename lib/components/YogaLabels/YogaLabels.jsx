import React from 'react'
import { FILTER_SET_RECIPE } from 'services/filter-set'
import YogaLabel from './YogaLabel'


class YogaLabels extends React.Component {
  renderPlaceholders = (option, defaultOption) => {
    const { yogaOptionsVisible } = this.props
    const placeholderLabel = option.getIn(['filter', 'options', 0, 'name'])
    const label = defaultOption ? defaultOption.get('name') : placeholderLabel

    if (!yogaOptionsVisible) {
      return null
    }

    return (
      <li key={`${label}${option.get('param')}`} className="yoga-labels__item">
        {label}
      </li>
    )
  }

  render () {
    const {
      props,
      renderPlaceholders,
    } = this
    const {
      data,
      activeIndex,
      setActive,
      staticTextFilterContainer,
      yogaOptionsVisible,
      auth,
      app,
      page,
      location,
      getFilterDefaultOption,
      filterSet,
    } = props

    const filterClass = FILTER_SET_RECIPE === filterSet ?
      'yoga-labels__recipe-list yoga-labels__list' :
      'yoga-labels__list'

    return (
      <ul className={filterClass}>
        { data.map((option, i) => {
          const optionInfo = option.getIn(['filter', 'options'])
          const param = option.get('param')
          const defaultOption = getFilterDefaultOption(optionInfo, location, param)
          return (
            <div key={param}>
              <YogaLabel
                activeIndex={activeIndex}
                setActive={setActive}
                option={option}
                staticTextFilterContainer={staticTextFilterContainer}
                isActive={i === activeIndex}
                i={i}
                type={option.get('type')}
                key={option}
                yogaOptionsVisible={yogaOptionsVisible}
                auth={auth}
                app={app}
                page={page}
                location={location}
              />
              { renderPlaceholders(option, defaultOption) }
            </div>
          )
        }) }
      </ul>
    )
  }
}

export default YogaLabels
