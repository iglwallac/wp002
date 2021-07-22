import React from 'react'
import Icon from 'components/Icon'

class YogaLabel extends React.Component {
  handleLabelClick = () => {
    const {
      setActive,
      i,
    } = this.props

    setActive(i)
  }

  renderLinkClass = () => {
    const {
      yogaOptionsVisible,
      isActive,
    } = this.props

    if (yogaOptionsVisible) {
      return 'yoga-label__link--default'
    } else if (isActive) {
      return 'yoga-label__link--active'
    } return 'yoga-label__link'
  }

  render () {
    const {
      props,
      handleLabelClick,
      renderLinkClass,
    } = this
    const {
      type,
      staticTextFilterContainer,
      isActive,
    } = props

    const label = staticTextFilterContainer.getIn(
      ['data', 'filterSetLabels', type, 'label'],
      '',
    )

    return (
      <li key={label} className="yoga-label">
        <a className={renderLinkClass()} onClick={handleLabelClick}>
          {label}
        </a>
        <div className="yoga-label__icon-wrapper">
          { !isActive ?
            <Icon
              iconClass={['icon--openplaylist', 'icon--action', 'yoga-label__icon', renderLinkClass()]}
              onClick={handleLabelClick}
            /> :
            <Icon
              iconClass={['icon--closeplaylist', 'icon--action', 'yoga-label__icon', renderLinkClass()]}
              onClick={handleLabelClick}
            />
          }
        </div>
      </li>
    )
  }
}

export default YogaLabel

