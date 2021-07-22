import React from 'react'
import get from 'lodash/get'
import toNumber from 'lodash/toNumber'
import isString from 'lodash/isString'
import Icon, { ICON_TYPES } from 'components/Icon.v2'
import { List } from 'immutable'
import PropTypes from 'prop-types'

// please note that the mobileSupport prop will not work correctly if
// the parent of this component has overflow: hidden

// when not using mobileSupport this component will probably have to be
// hidden and/or replaced by another component in smaller breakpoints

export const TABS_TYPES = {
  VERTICAL: 'VERTICAL',
  PRIMARY: 'PRIMARY',
}

export const TABS_JUSTIFY = {
  CENTER: 'CENTER',
  LEFT: 'LEFT',
}

function getTabsClass (props = {}) {
  const { type, justify } = props
  const cls = ['tabs']

  if (type === TABS_TYPES.VERTICAL) {
    cls.push('tabs--vertical')
  }
  if (justify === TABS_JUSTIFY.LEFT) {
    cls.push('tabs--justify-left')
  }
  return cls.join(' ')
}

function renderTabContent (tab = {}, isActive) {
  const activeClass = isActive ? ' active' : ''
  const { props = {} } = tab
  const { children = null } = props
  return (
    <section
      role="tabpanel"
      aria-hidden={isActive}
      className={`tabs__panel${activeClass}`}
    >
      {isActive ? children : null}
    </section>
  )
}

export function Tab (props = {}) {
  const { index, url, label, isActive, onClick } = props
  const activeClass = isActive ? ' active' : ''
  const hasUrl = isString(url)
  const childProps = {
    'aria-selected': isActive,
    className: 'tabs__tab',
    role: 'tab',
    onClick,
  }
  return (
    <li
      data-tab={index}
      className={`tabs__item${activeClass}`}
      role="presentation"
    >
      {hasUrl ? (
        <a {...childProps} href={url}>
          {label}
        </a>
      ) : (
        <button {...childProps}>
          {label}
        </button>
      )}
    </li>
  )
}

export class Tabs extends React.Component {
  //
  constructor (props) {
    super(props)
    const activeTab = get(props, 'activeTab', 0)
    this.state = {
      activeTab,
      width: 0,
      drawerOpen: false,
    }
  }

  componentDidMount () {
    window.addEventListener('resize', this.handleWindowSizeChange)
    this.setState(() => ({ // eslint-disable-line
      width: window.innerWidth,
      drawerOpen: false,
    }))
  }

  componentDidUpdate (prevProps) {
    if (prevProps.activeTab !== this.props.activeTab
      && this.props.activeTab !== this.state.activeTab) {
      this.setState({ activeTab: this.props.activeTab }) // eslint-disable-line
    }
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.handleWindowSizeChange)
  }

  onClick = (e) => {
    const { target } = e
    const tab = target.parentNode
    const index = tab.getAttribute('data-tab')
    const activeTab = toNumber(index) || 0

    if (this.props.onChange) {
      this.props.onChange(index)
    }

    if (target.tagName !== 'A'
      && target.href) {
      e.preventDefault()
    }
    this.setState(() => ({
      activeTab,
    }))
  }

  setDrawerOpen = () => {
    this.setState({
      drawerOpen: !this.state.drawerOpen,
    })
  }

  handleWindowSizeChange = () => {
    const { state } = this
    const drawerOpen = state.drawerOpen && window.innerWidth < 480
    this.setState({
      width: window.innerWidth,
      drawerOpen,
    })
  }

  renderMobileTabs = () => {
    const { state, props } = this
    const { drawerOpen, activeTab } = state
    const { children } = props
    const activeItem = List.isList(children) ? children.get(activeTab) : get(children, activeTab)
    const activeItemLabel = get(activeItem, ['props', 'label'])
    return (
      <div className="tabs__mobile" onClick={this.setDrawerOpen}>
        {drawerOpen ? (
          <React.Fragment>
            <Icon type={ICON_TYPES.CHEVRON_UP} />
            <ul className="tabs__list" role="tablist">
              {this.renderTabs()}
            </ul>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Icon type={ICON_TYPES.CHEVRON_DOWN} />
            <div className="tabs__mobile--no-hover">
              {activeItemLabel}
            </div>
          </React.Fragment>
        )}
      </div>
    )
  }

  renderTabs () {
    const { state, onClick, props } = this
    const { children } = props
    const { activeTab } = state
    return React.Children.map(children, (child, index) => {
      if (child) {
        const { type } = child
        if (type && type === Tab) {
          const isActive = index === activeTab
          return React.cloneElement(child, {
            isActive,
            onClick,
            index,
          }, null)
        }
        return null
      }
      return child
    })
  }

  renderTabContent () {
    const { state, props } = this
    const { children } = props
    const { activeTab } = state
    return React.Children.map(children, (child, index) => {
      if (child) {
        const { type } = child
        if (type && type === Tab) {
          const isActive = index === activeTab
          return renderTabContent(child, isActive)
        }
        return null
      }
      return child
    })
  }

  render () {
    const { props } = this
    const { noMobileSupport } = props
    const { type } = props
    return (
      <div className={getTabsClass(props)}>
        {noMobileSupport || type !== TABS_TYPES.VERTICAL ? null : this.renderMobileTabs()}
        <div className="tabs__screen">
          <ul className="tabs__list" role="tablist">
            {this.renderTabs()}
          </ul>
        </div>
        {this.renderTabContent()}
      </div>
    )
  }
}

Tabs.propTypes = {
  activeTab: PropTypes.number.isRequired,
  noMobileSupport: PropTypes.bool,
  type: PropTypes.oneOf([
    TABS_TYPES.VERTICAL,
    TABS_TYPES.PRIMARY,
  ]),
  justify: PropTypes.oneOf([
    TABS_JUSTIFY.CENTER,
    TABS_JUSTIFY.LEFT,
  ]),
}

Tabs.defaultProps = {
  justify: TABS_JUSTIFY.CENTER,
  type: TABS_TYPES.PRIMARY,
  noMobileSupport: false,
  activeTab: 0,
}
