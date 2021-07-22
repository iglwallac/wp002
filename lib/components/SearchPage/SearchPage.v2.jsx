import get from 'lodash/get'
import { Map } from 'immutable'
import { compose } from 'recompose'
import React from 'react'
import { getBoundActions } from 'actions'
import { connect as connectRedux } from 'react-redux'
import { connect as connectPage, PAGE_SEO_TYPE_LOCATION } from 'components/Page/connect'
// import { STORE_KEY_SEARCH } from 'services/store-keys'
// import { TYPE_SEARCH } from 'services/tiles'
import CommentsLoader from 'components/CommentsLoader'
import SearchForm from 'components/SearchForm'

const CLASSNAME_SEARCH = ['search__search-form']
const CLASSNAME_ICON = ['search__search-icon']

function SearchPage (props) {
  const { history, location } = props
  const sort = get(location, ['query', 'sort'], '')
  const q = get(location, ['query', 'q'], '')

  // useEffect(() => {
  //   getTilesPageData({
  //     storeKey: STORE_KEY_SEARCH,
  //     enablePageBehaviors: true,
  //     ignoreEmptyId: true,
  //     queryParamAsId: 'q',
  //     type: TYPE_SEARCH,
  //   })
  // })

  return (
    <section className="search">
      <CommentsLoader />
      <SearchForm
        className={CLASSNAME_SEARCH}
        iconClass={CLASSNAME_ICON}
        defaultSearchSort={sort}
        defaultSearchTerm={q}
        location={location}
        history={history}
        hasButton
        autofocus
      />
    </section>
  )
}

export default compose(
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
  connectRedux(state => ({
    staticText: state.staticText.getIn(['data', 'searchPage'], Map()),
  }), (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      getTilesPageData: actions.tiles.getTilesPageData,
    }
  }),
)(SearchPage)
