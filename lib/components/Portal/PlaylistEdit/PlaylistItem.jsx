import ImmutablePropTypes from 'react-immutable-proptypes'
import { Button, TYPES } from 'components/Button.v2'
import { DRAGGABLE_TYPE } from 'services/portal'
import { ICON_TYPES } from 'components/Icon.v2'
import { useDrag, useDrop } from 'react-dnd'
import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import _get from 'lodash/get'

function getClassName (isDragging, isOver) {
  const base = 'portal-playlist-v2-edit__playlist-item-wrapper'
  const cls = [base]
  if (isDragging) {
    cls.push(`${base}--dragging`)
  }
  if (isOver) {
    cls.push(`${base}--is-over`)
  }
  return cls.join(' ')
}

const PlaylistItem = ({
  onRemoveItem,
  playlistItem,
  onReorder,
  index,
  text,
  id,
}) => {
  const isFree = index === 0
  const [{ isDragging }, drag] = useDrag({
    item: {
      type: DRAGGABLE_TYPE.PLAYLIST_ITEM,
      id,
    },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [{ isOver }, drop] = useDrop({
    accept: DRAGGABLE_TYPE.PLAYLIST_ITEM,
    drop (item) {
      onReorder(_get(item, 'id'), playlistItem.get('playlistPosition'))
    },
    collect: monitor => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  })

  return (
    <div
      ref={drop}
      className={getClassName(isDragging, isOver)}
    >
      <div className="portal-playlist-v2-edit__playlist-item">
        <img
          ref={drag}
          className="portal-playlist-v2-edit__playlist-item-img"
          alt={playlistItem.get('title')}
          src={playlistItem.get('imageWithText')}
        />
        <Button
          className="portal-playlist-v2__playlist-item-action-btn"
          onClick={() => onRemoveItem(id)}
          type={TYPES.ICON_PRIMARY}
          icon={ICON_TYPES.CLOSE}
          shadow
        />
        {isFree ? (
          <Fragment>
            <div className="portal-playlist-v2-edit__playlist-item-free-border" />
            <div className="portal-playlist-v2-edit__playlist-item-free">
              {text}
            </div>
          </Fragment>
        ) : null}
      </div>
    </div>
  )
}

PlaylistItem.propTypes = {
  playlistItem: ImmutablePropTypes.map.isRequired,
  onRemoveItem: PropTypes.func.isRequired,
  onReorder: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  text: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
}

export default PlaylistItem
