/* eslint-disable react/no-unescaped-entities */
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { compose } from 'recompose'
import { getPrimary } from 'services/languages'
import { DE, ES, FR } from 'services/languages/constants'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect as connectRedux } from 'react-redux'
import {
  connect as connectPage,
  PAGE_SEO_TYPE_LOCATION,
} from 'components/Page/connect'

/**
 * The Policy Page dynamically loads its body component to save on bundle size
 * since it is a larger component.
 */
class PolicyPage extends PureComponent {
  componentDidMount () {
    this.loadBody(this.props, this.state)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props === nextProps) {
      return
    }
    this.loadBody(nextProps, this.state)
  }

  getBodyComponent = async (userLanguage) => {
    switch (userLanguage) {
      case DE: {
        const { default: data } = await import('./subcomponents/DeDe/DeDe')
        return data
      }
      case ES: {
        const { default: data } = await import('./subcomponents/EsLa/EsLa')
        return data
      }
      case FR: {
        const { default: data } = await import('./subcomponents/FrFr/FrFr')
        return data
      }
      default: {
        const { default: data } = await import('./subcomponents/EnUs/EnUs')
        return data
      }
    }
  }

  loadBody = (props) => {
    const { user } = props
    const userLanguage = getPrimary(user.getIn(['data', 'language']))
    this.getBodyComponent(userLanguage).then((component) => {
      this.BodyComponent = component
      // Cause a re-render
      this.setState(() => ({ userLanguage }))
    })
  }

  render () {
    const { props, BodyComponent: Body } = this
    if (!Body) {
      return null
    }
    // Make sure to spread the props onto Body to prevent
    // it from being hoisted to a static component.
    return <Body {...props} />
  }
}

PolicyPage.propTypes = {
  user: ImmutablePropTypes.map.isRequired,
}

PolicyPage.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default compose(
  connectRedux(
    (state) => {
      const { user } = state
      return {
        user,
      }
    },
  ),
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
)(PolicyPage)
