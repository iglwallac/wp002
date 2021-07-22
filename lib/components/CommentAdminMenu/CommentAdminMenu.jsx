import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { Map } from 'immutable'
import _partial from 'lodash/partial'
import _isFunction from 'lodash/isFunction'
import Button from 'components/Button'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'

class CommentAdminMenu extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      visible: false,
    }
  }

  onClickEdit = (e) => {
    const { comment, onClickEdit } = this.props
    this.setVisible(false)
    if (_isFunction(onClickEdit)) {
      onClickEdit(e, comment)
    }
  }

  setVisible = (visible) => {
    this.setState(() => ({ visible }))
  }

  render () {
    const { visible } = this.state
    const { commentAdminMenuStaticText } = this.props
    const menuIconClassName = ['comment-admin-menu__edit-icon']
      .concat(visible ? 'comment-admin-menu__edit-icon--active' : '')
      .join(' ')
    return (
      <div className="comment-admin-menu">
        <span
          onClick={_partial(this.setVisible, !visible)}
          className={menuIconClassName}
        />
        {visible ? (
          <ul className={['comment-admin-menu__menu-list']}>
            <li className="comment-admin-menu__menu-item">
              <Button
                onClick={this.onClickEdit}
                buttonClass={['comment-admin-menu__menu-button']}
                text={commentAdminMenuStaticText.getIn(['data', 'edit'])}
              />
            </li>
          </ul>
        ) : null}
      </div>
    )
  }
}

CommentAdminMenu.propTypes = {
  auth: ImmutablePropTypes.map.isRequired,
  comment: ImmutablePropTypes.map.isRequired,
  onClickEdit: PropTypes.func,
  commentAdminMenuStaticText: ImmutablePropTypes.map.isRequired,
}

CommentAdminMenu.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default connect(state => ({
  commentAdminMenuStaticText: state.staticText.getIn(
    ['data', 'commentAdminMenu'],
    Map(),
  ),
}))(CommentAdminMenu)
