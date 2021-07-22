import get from 'lodash/get'
import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { Button as ButtonV2, TYPES } from 'components/Button.v2'
import { connect as connectRedux } from 'react-redux'
import { Map, List } from 'immutable'
import { getBoundActions } from 'actions'
import Sherpa, { TYPE_LARGE } from 'components/Sherpa'
import TileSubscription from 'components/TileSubscription'

const clsSherpa = ['modal-view-all__sherpa']

class ModalViewAll extends React.PureComponent {
  //
  componentDidUpdate = () => {
    const { props } = this
    const { update } = props
    update()
  }

  handleLink = () => {
    const { props } = this
    const { dismissModal, clearViewAll } = props
    if (clearViewAll) {
      clearViewAll()
    }
    dismissModal()
  }

  render () {
    const { props } = this
    const { touchable, staticText, totalItems, loadMore, data } = props
    const items = data.get('items', List())
    const pp = data.get('pp', 0)
    if (items.size < 1) {
      return <Sherpa className={clsSherpa} type={TYPE_LARGE} />
    }
    return (
      <div className="modal-view-all">
        <ul className="modal-view-all__list">
          {items.map((item) => {
            const key = item.get('uuid') || item.get('id')
            return (
              <TileSubscription
                subscriberCount={item.get('subscribers')}
                title={item.get('title')}
                desc={item.get('tagline')}
                hero={item.get('image')}
                onClick={this.handleLink}
                hoverable={!touchable}
                tags={item.get('tags')}
                url={item.get('url')}
                key={key}
                asListItem
              />
            )
          })}
        </ul>
        {totalItems > pp && items.size < totalItems
          ? <div className="modal-view-all__load-more">
            <ButtonV2
              type={TYPES.PRIMARY}
              onClick={loadMore}
            >
              {staticText.getIn(['data', 'rowLoadMore'])}
            </ButtonV2>
          </div>
          : null}
      </div>
    )
  }
}

ModalViewAll.defaultProps = {
  renderItem: () => {},
  loadMore: () => {},
  staticText: Map(),
  touchable: false,
  viewAll: false,
  totalItems: 0,
}

ModalViewAll.propTypes = {
  storeKey: PropTypes.string.isRequired,
  staticText: ImmutablePropTypes.map,
  totalItems: PropTypes.number,
  renderItem: PropTypes.func,
  touchable: PropTypes.bool,
  loadMore: PropTypes.func,
  viewAll: PropTypes.bool,
}

export default connectRedux(
  (state, props) => {
    const { storeKey = '' } = props
    const path = storeKey.split('.')
    const sectionKey = path.shift()
    const section = get(state, sectionKey, Map())
    return {
      touchable: state.app.getIn(['viewport', 'touchable'], false),
      data: section.getIn(path, Map()),
    }
  },
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      dismissModal: actions.dialog.dismissModal,
    }
  },
)(ModalViewAll)
