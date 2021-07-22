import React from 'react'
import {
  createUpstreamContext,
  SCREEN_TYPE_SUBCATEGORY,
  CONTEXT_TYPE_SUBCATEGORY_YOGA_CLASSIC_FACET,
  ALL_YOGA_PRACTICES_ID,
} from 'services/upstream-context'
import YogaOption from '../YogaOption/YogaOption'

class YogaFilter extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      activeOptionIndex: 0,
    }
  }

  getClassName = (inputClassName, isCompact) => {
    const classes = ['filter'].concat(inputClassName || [])
    if (isCompact) {
      classes.push('filter--compact')
    }
    return classes.join(' ')
  }

  setActiveOption = (i) => {
    const { closeShelf } = this.props
    this.setState({ activeOptionIndex: i })
    closeShelf()
  }

  render () {
    const {
      props,
      setActiveOption,
    } = this
    const {
      options,
      onChange,
      active,
      param,
      setParam,
      auth,
      page,
      app,
      location,
      defaultOption,
    } = props
    const isActive = active ? 'active' : 'false'

    const upstreamContext = createUpstreamContext({
      screenType: SCREEN_TYPE_SUBCATEGORY,
      screenParam: ALL_YOGA_PRACTICES_ID,
      contextType: CONTEXT_TYPE_SUBCATEGORY_YOGA_CLASSIC_FACET,
    })

    /* eslint-disable jsx-a11y/label-has-for */
    return (
      <div className="yoga-filter__options-container">
        <div className="yoga-filter__options-wrapper">
          <ul className={`yoga-filter__options yoga-filter__options-${isActive}`}>
            { options.map((option, i) => {
              return (
                <YogaOption
                  onChange={onChange}
                  option={option}
                  key={option}
                  param={param}
                  setParam={setParam}
                  i={i}
                  setActiveOption={setActiveOption}
                  upstreamContext={upstreamContext}
                  auth={auth}
                  app={app}
                  page={page}
                  location={location}
                  defaultOption={defaultOption}
                />
              )
            })}
          </ul>
        </div>
      </div>
    )
  }
}

export default YogaFilter
