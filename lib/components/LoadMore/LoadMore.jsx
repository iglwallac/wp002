import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { connect as connectRedux } from 'react-redux'
import Button from 'components/Button'

class LoadMore extends PureComponent {
  componentDidMount () {
    const { infiniteScroll } = this.props
    if (infiniteScroll) {
      window.addEventListener('scroll', this.onScroll)
    }
  }

  componentWillUnmount () {
    const { infiniteScroll } = this.props
    if (infiniteScroll) {
      window.removeEventListener('scroll', this.onScroll)
    }
  }

  onScroll = (e) => {
    const { processing, totalCount, currentCount, onClickLoadMore } = this.props
    const domNode = e.target
    if (
      this._component &&
      window.pageYOffset > domNode.getBoundingClientRect().bottom - 350 &&
      !processing &&
      currentCount < totalCount
    ) {
      e.stopPropagation()
      onClickLoadMore()
    }
  }

  onRef = (component) => {
    this._component = component
  }

  onClickButton = (e) => {
    const { onClickLoadMore } = this.props
    e.stopPropagation()
    e.preventDefault()
    onClickLoadMore()
  }

  render () {
    const props = this.props
    const {
      text,
      defaultText,
      buttonClassName,
      currentCount,
      totalCount,
      processing,
    } = props
    const loadMoreText = text || defaultText
    if (currentCount === 0 || processing || currentCount === totalCount) {
      return null
    }
    return (
      <div ref={this.onRef} className="load-more">
        <Button
          onClick={this.onClickButton}
          text={loadMoreText}
          rel="nofollow"
          buttonClass={buttonClassName}
        />
      </div>
    )
  }
}

LoadMore.propTypes = {
  text: PropTypes.string,
  defaultText: PropTypes.string.isRequired,
  onClickLoadMore: PropTypes.func.isRequired,
  buttonClassName: PropTypes.array.isRequired,
  totalCount: PropTypes.number.isRequired,
  currentCount: PropTypes.number.isRequired,
  processing: PropTypes.bool,
  infiniteScroll: PropTypes.bool,
}

LoadMore.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default connectRedux(state => ({
  defaultText: state.staticText.getIn([
    'data',
    'loadMore',
    'data',
    'defaultText',
  ]),
}))(LoadMore)
