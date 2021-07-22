import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { List } from 'immutable'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import HomeJumbotron from 'components/HomeJumbotron'
import HomeAlwaysBanner from 'components/HomeAlwaysBanner'
import HomePlan from 'components/HomePlan'
import HomeDeviceBanner from 'components/HomeDeviceBanner'
import { get as getConfig } from 'config'
import _get from 'lodash/get'

const config = getConfig()

function updateData (props) {
  const { user, home, getHomeData } = props
  const userLanguage = user.getIn(['data', 'language'], List())
  const language = userLanguage.size > 0 ? userLanguage.toJS() : undefined

  if (!home.get('data') && !home.get('processing')) {
    getHomeData({ language })
  }
}

class Home extends PureComponent {
  componentDidMount () {
    updateData(this.props)
  }

  componentWillReceiveProps (nextProps) {
    if (process.env.BROWSER) {
      updateData(nextProps)
    }
  }

  render () {
    const { user, setHomeScrollTo, history, location } = this.props
    const userLanguage = user.getIn(
      ['data', 'language', 0],
      _get(config, ['appLang']),
    )
    return (
      <div className="home">
        <HomeJumbotron
          setHomeScrollTo={setHomeScrollTo}
          userLanguage={userLanguage}
        />
        <HomeAlwaysBanner />
        <HomePlan history={history} location={location} />
        <HomeDeviceBanner />
      </div>
    )
  }
}

Home.propTypes = {
  user: ImmutablePropTypes.map.isRequired,
  home: ImmutablePropTypes.map.isRequired,
  location: PropTypes.object.isRequired,
  getHomeData: PropTypes.func.isRequired,
  setHomeScrollTo: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
}

Home.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default connectRedux(
  state => ({
    home: state.home,
    user: state.user,
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      getHomeData: actions.home.getHomeData,
      setHomeScrollTo: actions.home.setHomeScrollTo,
    }
  },
)(Home)
