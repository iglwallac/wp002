import React, { Component } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'

function getClassName (className) {
  const classes = ['fallback-navigation-links']
  if (className) {
    classes.push(className)
  }
  return classes
}

function renderLinks (links) {
  return links.map((link, index) => (
    <a
      // eslint-disable-next-line react/no-array-index-key
      key={`${link.get('path')}-${index}`}
      // eslint-disable-next-line no-useless-escape
      href={link.get('path').replace(/([^\/])/, '/$1')}
    >
      {link.get('name')}
    </a>
  ))
}

function getStyle (visible) {
  const style = {}
  if (!visible) {
    style.display = 'none'
  }
  return style
}

class SeoNavigationLinks extends Component {
  constructor (props) {
    super(props)
    this.state = {
      visible: true,
    }
  }

  componentDidMount () {
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState(() => ({ visible: false }))
  }

  render () {
    const props = this.props
    const state = this.state
    return (
      // eslint-disable-next-line jsx-a11y/no-redundant-roles
      <nav
        role="navigation"
        className={getClassName()}
        style={getStyle(state.visible)}
      >
        {renderLinks(props.links)}
      </nav>
    )
  }
}

SeoNavigationLinks.propTypes = {
  links: ImmutablePropTypes.list.isRequired,
}

export default SeoNavigationLinks
