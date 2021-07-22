import PropTypes from 'prop-types'
import React from 'react'
import { compose } from 'recompose'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { formatSeriesHost, formatSeriesEpisodeTotals } from 'theme/web-app'
import Link from 'components/Link'
import Icon from 'components/Icon'
import { TARGET_BLANK } from 'components/Link/constants'
import { H5, HEADING_TYPES } from 'components/Heading'
import { get as getConfig } from 'config'
import { parse as parseUrl, format as formatUrl } from 'url'
import { stringify as stringifyQuery } from 'services/query-string'

function AboutSeries (props) {
  const {
    staticText,
    title,
    path,
    teaser,
    coverartUrl,
    host,
    totalEpisodes,
    totalSeasons,
    openNewTab,
    referralId,
  } = props
  const { origin } = getConfig()
  const titleSeparator = staticText.getIn(['data', 'with'])
  const seasonText = staticText.getIn(['data', 'season'])
  const seasonsText = staticText.getIn(['data', 'seasons'])
  const episodeText = staticText.getIn(['data', 'episode'])
  const episodesText = staticText.getIn(['data', 'episodes'])
  const absolutePath = `${origin}/${path}`
  let seriesPath = openNewTab ? absolutePath : path
  const target = openNewTab ? TARGET_BLANK : null
  /* eslint-disable no-unneeded-ternary  */
  const scrollToTop = openNewTab ? false : true

  if (openNewTab && referralId) {
    const parsedUrl = parseUrl(seriesPath)
    const query = { rfd: referralId }
    seriesPath = formatUrl({
      ...parsedUrl,
      search: stringifyQuery(query),
    })
  }

  return (
    <section className="about-series">
      <div className="about-series__wrapper">
        <div className="about-series__title">
          {staticText.getIn(['data', 'aboutSeries'])}
        </div>
        <div className="about-series__left">
          <Link
            directLink={openNewTab}
            to={seriesPath}
            className="about-series__coverart-link"
            target={target}
            scrollToTop={scrollToTop}
          >
            <img
              className="about-series__coverart"
              src={coverartUrl}
              alt={formatSeriesHost(title, host, titleSeparator)}
            />
          </Link>
        </div>
        <div className="about-series__right">
          <H5 as={HEADING_TYPES.H4}>
            <Link
              directLink={openNewTab}
              to={seriesPath}
              className="about-series__series-title-link"
              target={target}
              scrollToTop={scrollToTop}
            >
              {formatSeriesHost(title, host, titleSeparator)}
            </Link>
          </H5>
          <div className="about-series__metadata">
            <span className="about-series__meta-item">
              {formatSeriesEpisodeTotals(totalSeasons, seasonText, seasonsText)}
            </span>
            <span className="about-series__meta-item">
              {formatSeriesEpisodeTotals(totalEpisodes, episodeText, episodesText)}
            </span>
          </div>
          <p className="about-series__teaser">{teaser}</p>
          <div className="about-series__series-link-wrapper">
            <Link
              directLink={openNewTab}
              to={seriesPath}
              className="about-series__series-link"
              target={target}
              scrollToTop={scrollToTop}
            >
              {staticText.getIn(['data', 'viewSeries'])}
              <Icon iconClass={['icon--right', 'about-series__icon-right']} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
  /* eslint-enable no-unneeded-ternary  */
}

AboutSeries.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
  title: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  teaser: PropTypes.string.isRequired,
  coverartUrl: PropTypes.string.isRequired,
  host: PropTypes.string,
  totalSeasons: PropTypes.string.isRequired,
  totalEpisodes: PropTypes.string.isRequired,
  openNewTab: PropTypes.bool,
  referralId: PropTypes.string,
}

AboutSeries.defaultProps = {
  openNewTab: false,
}

export default compose(
  connectStaticText({ storeKey: 'aboutSeries' }),
)(AboutSeries)
