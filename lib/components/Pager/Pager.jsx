import PropTypes from 'prop-types'
import React from 'react'
import compose from 'recompose/compose'
import pure from 'recompose/pure'
import _assign from 'lodash/assign'
import _get from 'lodash/get'
import _range from 'lodash/range'
import _reduce from 'lodash/reduce'
import _floor from 'lodash/floor'
import _parseInt from 'lodash/parseInt'
import Link from 'components/Link'
import Icon from 'components/Icon'

const PAGE_COUNT = 5

function getPadCount () {
  return _floor(PAGE_COUNT / 2)
}

function getMinPage (currentPage) {
  const count = getPadCount()
  const minPage = currentPage - count
  if (minPage < 1) {
    return 1
  }
  return minPage
}

function getMaxPage (currentPage, total) {
  const count = getPadCount()
  const maxPage = currentPage + count
  if (maxPage > total) {
    return total
  }
  return maxPage
}

function padMaxPage (currentPage, minPage, maxPage, total) {
  let paddedMaxPage = maxPage
  const count = getPadCount()
  // Count is close to the start and can't get smaller so lets make it up using this count
  const prevCount = currentPage - minPage
  if (prevCount !== count) {
    paddedMaxPage = maxPage + (count - prevCount)
  }
  // Can't have more then the total
  if (paddedMaxPage > total) {
    return total
  }
  return paddedMaxPage
}

function padMinPage (currentPage, minPage, maxPage) {
  let paddedMinPage = minPage
  const count = getPadCount()
  // Count is close to the end and can't get bigger so lets make it up using this count
  const nextCount = maxPage - currentPage
  if (nextCount !== count) {
    paddedMinPage = minPage - (count - nextCount)
  }
  // Can't have less then 1
  if (paddedMinPage < 1) {
    return 1
  }
  return paddedMinPage
}

function renderPages (location, total, currentPage, query) {
  const minPage = getMinPage(currentPage)
  const maxPage = getMaxPage(currentPage, total)
  const paddedMinPage = padMinPage(currentPage, minPage, maxPage)
  const paddedMaxPage = padMaxPage(currentPage, minPage, maxPage, total)
  let components = []
  // Don't render first on the first page
  if (currentPage > 1) {
    const prevPage = currentPage - 1
    components.push(
      <Link
        key={`pager-prev-${currentPage}`}
        to={location.pathname}
        query={
          prevPage === 1 ? undefined : _assign({}, query, { page: prevPage })
        }
        className={['pager__link', 'pager__prev']}
      >
        <Icon iconClass={['icon--pagination-left', 'pager__link-icon']} />
      </Link>,
    )
  }
  components = _reduce(
    _range(paddedMinPage, paddedMaxPage + 1),
    (reduction, page) => {
      // There is no page param for page 1.
      const queryPage = page === 1 ? {} : { page }
      const _query = _assign({}, query, queryPage)
      if (page <= total) {
        const className = [
          'pager__link',
          'pager__link-page',
          `pager__link-page-${page}`,
        ]
        if (page === currentPage) {
          className.push('pager__link--active')
        }
        const textClassName = ['pager__link-text']
        if (page === currentPage) {
          textClassName.push('pager__link-text--active')
        }
        const component = (
          <Link
            key={`pager-page-${page}`}
            to={location.pathname}
            query={page === 1 ? undefined : _query}
            className={className}
          >
            <span className={textClassName.join(' ')}>{page}</span>
          </Link>
        )
        reduction.push(component)
      }
      return reduction
    },
    components,
  )
  if (currentPage !== total) {
    components.push(
      <Link
        key={`pager-next-${currentPage}`}
        to={location.pathname}
        query={_assign({}, query, { page: currentPage + 1 })}
        className={['pager__link', 'pager__next']}
      >
        <Icon iconClass={['icon--pagination-right', 'pager__link-icon']} />
      </Link>,
    )
  }
  return components
}

function Pager ({ location, total }) {
  const query = _assign({}, _get(location, 'query', {}))
  const currentPage = _parseInt(query.page || 1)
  return (
    <nav className="pager">
      {currentPage === 1 ? null : (
        <Link
          to={location.pathname}
          className={['pager__link', 'pager__first']}
        >
          <Icon iconClass={['icon--pagination-first', 'pager__link-icon']} />
        </Link>
      )}
      {renderPages(location, total, currentPage, query)}
      {currentPage === total ? null : (
        <Link
          to={location.pathname}
          query={_assign({}, query, { page: total })}
          className={['pager__link', 'pager__last']}
        >
          <Icon iconClass={['icon--pagination-last', 'pager__link-icon']} />
        </Link>
      )}
    </nav>
  )
}

Pager.propTypes = {
  total: PropTypes.number.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
}

export default compose(pure)(Pager)
