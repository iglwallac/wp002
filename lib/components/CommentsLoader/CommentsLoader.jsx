import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { getBoundActions } from 'actions'
import { connect as connectRedux } from 'react-redux'

// Components are loaded by bundle
let Commments = null

class CommentsLoader extends PureComponent {
  constructor (props) {
    super(props)
    this.state = { loaded: false }
  }

  componentDidMount () {
    this.updateBundles(this.props, this.state)
  }

  componentWillReceiveProps (nextProps, nextState) {
    if (process.env.BROWSER) {
      this.updateBundles(nextProps, nextState)
    }
  }

  setLoaded = (loaded) => {
    this.setState(() => ({ loaded }))
  }

  updateBundles = async (props, state) => {
    const { loaded } = state
    const { comments } = props
    if (!loaded && comments.get('visible')) {
      const { default: Component } = await import('components/Comments')
      Commments = Component
      this.setLoaded(true)
    }
  }

  render () {
    const {
      auth,
      comments,
      saveComment,
      setCommentsVisible,
      onClickClose,
    } = this.props
    const { loaded } = this.state
    const key = loaded ? 0 : 1
    // Adding keys to all components to prevent hoisting via Babel plugin, which will result
    // in undefined component in production. Essentially any component with at least one prop
    // will prevent hoisting.
    if (loaded && Commments) {
      return (
        <Commments
          key={`comments-loader-comments-${key}`}
          auth={auth}
          comments={comments}
          saveComment={saveComment}
          setCommentsVisible={setCommentsVisible}
          onClickClose={onClickClose}
        />
      )
    }
    return null
  }
}

CommentsLoader.propTypes = {
  comments: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  saveComment: PropTypes.func.isRequired,
  setCommentsVisible: PropTypes.func.isRequired,
  onClickClose: PropTypes.func,
}

CommentsLoader.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default connectRedux(
  state => ({
    auth: state.auth,
    comments: state.comments,
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      saveComment: actions.comments.saveComment,
      setCommentsVisible: actions.comments.setCommentsVisible,
    }
  },
)(CommentsLoader)
