import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import React, { PureComponent } from 'react'
import Loadable from 'react-loadable'

const LoadableShelf = Loadable({
  loader: () => import('components/Shelf'),
  loading: () => null,
})
const LoadableShelfV2 = Loadable({
  loader: () => import('components/Shelf.v2'),
  loading: () => null,
})
class ShelfLoader extends PureComponent {
  render () {
    const {
      onRefShelf,
      location,
      onClickClose,
      setTilesScrollableTileIndex,
      setTilesScrollableRowWidth,
      upstreamContext,
      useShelfV2,
      showHideContentButton,
    } = this.props
    return (
      useShelfV2 ?
        <LoadableShelfV2
          ref={onRefShelf}
          location={location}
          onClickClose={onClickClose}
          showHideContentButton={showHideContentButton}
          setTilesScrollableTileIndex={setTilesScrollableTileIndex}
          setTilesScrollableRowWidth={setTilesScrollableRowWidth}
          upstreamContext={upstreamContext}
        />
        :
        <LoadableShelf
          ref={onRefShelf}
          location={location}
          onClickClose={onClickClose}
          showHideContentButton={showHideContentButton}
          setTilesScrollableTileIndex={setTilesScrollableTileIndex}
          setTilesScrollableRowWidth={setTilesScrollableRowWidth}
          upstreamContext={upstreamContext}
        />
    )
  }
}

ShelfLoader.propTypes = {
  onRefShelf: PropTypes.element,
  location: PropTypes.object.isRequired,
  onClickClose: PropTypes.func.isRequired,
  setTilesScrollableTileIndex: PropTypes.func.isRequired,
  setTilesScrollableRowWidth: PropTypes.func.isRequired,
  upstreamContext: ImmutablePropTypes.map,
  useShelfV2: PropTypes.bool,
}

export default ShelfLoader
