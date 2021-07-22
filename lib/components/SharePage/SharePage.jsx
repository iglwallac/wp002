import get from 'lodash/get'
import PropTypes from 'prop-types'
import { Map, List } from 'immutable'
import { getBoundActions } from 'actions'
import React, { useMemo, useCallback } from 'react'
import { URL_HOME } from 'services/url/constants'
import {
  FR,
} from 'services/languages/constants'
import { connect as connectRedux } from 'react-redux'
import GaiaLogo, { TYPE_WHITE } from 'components/GaiaLogo'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { parse as parseUrl, format as formatUrl } from 'url'
import Link, { TARGET_BLANK, TARGET_SELF } from 'components/Link'
import { stringify as stringifyQuery } from 'services/query-string'
import { EMAIL_SIGNUP_SHARE } from 'services/email-signup'
import PlanGridV2 from 'components/PlanGrid.v2/PlanGridV2'
import CommentsLoader from 'components/CommentsLoader'
import OptimizelyPage from 'components/OptimizelyPage'
import DiscoverGaia from 'components/DiscoverGaia'
import AboutSeries from 'components/AboutSeries'
import CtaDevices from 'components/CtaDevices'
import CtaJoinDynamic from 'components/CtaJoinDynamic'
import { H4 } from 'components/Heading'
import AdditionalMedia from './AdditionalMedia'
import PlayerCTA from './PlayerCTA'
import Player from './Player'

const MAX_ROW_ITEMS = 6

function cacheVars (auth, location, userReferralId) {
  const isAnonymous = !auth.get('jwt')
  const startAt = Number(get(location, 'query.startAt', 0))
  const isEmbedded = get(location, 'query.embed', '') === 'true'
  const renderAnon = isAnonymous && !isEmbedded
  const renderMem = !isAnonymous && !isEmbedded
  const query = {}

  let url = URL_HOME

  if (isEmbedded) {
    url = get(location, 'pathname')
    if (startAt) {
      query.startAt = startAt
    }
  } else if (userReferralId) {
    query.rfd = userReferralId
  }
  const parsedUrl = parseUrl(url)
  const logoUrl = formatUrl({ ...parsedUrl, search: stringifyQuery(query) })
  const logoTarget = isEmbedded ? TARGET_BLANK : TARGET_SELF

  return {
    isAnonymous,
    isEmbedded,
    renderAnon,
    logoTarget,
    renderMem,
    startAt,
    logoUrl,
  }
}

function SharePage ({
  duplicateShareEmailCapture,
  setEventUserInteraction,
  setQualifiedView,
  emailProcessing,
  emailSuccess,
  renderModal,
  staticText,
  location,
  history,
  error,
  tiles,
  share,
  auth,
  lang,
}) {
  const additionalMedia = share.get('additionalMedia', List())
  const userReferralId = share.get('userReferralId')
  const seriesId = share.getIn(['content', 'seriesId'])
  const seriesPath = share.getIn(['content', 'seriesPath'])
  const seriesTitle = share.getIn(['content', 'seriesTitle'])
  const seriesPoster = share.getIn(['content', 'seriesPoster'])
  const seriesTeaser = share.getIn(['content', 'seriesTeaser'])
  const seriesHost = share.getIn(['content', 'seriesHost'], '')
  const seriesTotalEpisodes = share.getIn(['content', 'seriesTotalEpisodes'])
  const seriesTotalSeasons = share.getIn(['content', 'seriesTotalSeasons'])
  const segmentId = share.getIn(['content', 'siteSegment', 'id'], -1)
  const videoId = share.get('contentId')
  const vars = useMemo(() => (
    cacheVars(auth, location, userReferralId)
  ), [auth, location, userReferralId])

  // eslint-disable-next-line no-unused-vars
  const onClickPlan = useCallback(() => {
    setEventUserInteraction({
      label: 'pricing-grid-selection',
      category: 'user engagement',
      action: 'Call to Action',
    })
  }, [])

  return (
    <section className="share">
      <div className="share__container">
        <header className="share__header">
          <Link to={vars.logoUrl} target={vars.logoTarget} directLink={vars.isEmbedded}>
            <GaiaLogo type={TYPE_WHITE} inline />
          </Link>
        </header>
        <div className="share__video">
          <div className="share__section share__section--player">
            <Player
              setQualifiedView={setQualifiedView}
              isAnonymous={vars.isAnonymous}
              isEmbedded={vars.isEmbedded}
              staticText={staticText}
              startAt={vars.startAt}
              videoId={videoId}
              share={share}
              error={error}
              lang={lang}
            />
          </div>
          {!vars.isEmbedded && !error ? (
            <div className="share__section share__section--player-cta">
              <PlayerCTA
                duplicateShareEmailCapture={duplicateShareEmailCapture}
                emailProcessing={emailProcessing}
                isAnonymous={vars.isAnonymous}
                emailSuccess={emailSuccess}
                renderModal={renderModal}
                staticText={staticText}
                share={share}
              />
            </div>
          ) : null}
        </div>
      </div>
      {!vars.isEmbedded ? (
        <div className="share__additional-media">
          <CommentsLoader />
          <AdditionalMedia
            labelKey={'related'}
            isAnonymous={vars.isAnonymous}
            staticText={staticText}
            limit={MAX_ROW_ITEMS}
            location={location}
            tiles={tiles}
          />
          {vars.isAnonymous ?
            <AdditionalMedia
              labelKey={'exploreMore'}
              additionalMedia={additionalMedia}
              isAnonymous={vars.isAnonymous}
              staticText={staticText}
              limit={MAX_ROW_ITEMS}
              location={location}
            />
            : null}
        </div>
      ) : null}
      {
        !vars.isEmbedded && seriesId ? (
          <AboutSeries
            totalEpisodes={seriesTotalEpisodes}
            totalSeasons={seriesTotalSeasons}
            referralId={userReferralId}
            coverartUrl={seriesPoster}
            teaser={seriesTeaser}
            title={seriesTitle}
            host={seriesHost}
            path={seriesPath}
            openNewTab
          />
        ) : null
      }
      {vars.renderAnon ? (
        <div className="share-marketing-cta">
          <CtaJoinDynamic siteSegment={segmentId} />
        </div>
      ) : null}
      {vars.renderMem && lang !== FR ? (
        <CtaDevices />
      ) : null}
      {vars.renderAnon ? (
        <React.Fragment>
          { lang !== FR ? (
            <CtaDevices />
          ) : null }
          <DiscoverGaia
            siteSegment={share.getIn(['data', 'content', 'siteSegment'])}
            formName={EMAIL_SIGNUP_SHARE}
          />
          <div className="share__section--plan-grid">
            <H4 className="share__section--plan-header">
              {staticText.get('sharePagePricingPlanTitle')}
            </H4>
            <PlanGridV2 onClickPlan={onClickPlan} history={history} />
          </div>
        </React.Fragment>
      ) : null}
      <OptimizelyPage pageName="web_app__share_page" />
    </section>
  )
}

SharePage.propTypes = {
  auth: ImmutablePropTypes.map.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object,
}

export default connectRedux(({
  staticText,
  tiles,
  share,
  user,
  auth,
}) => ({

  staticText: staticText.getIn(['data', 'sharePage', 'data'], Map()),
  tiles: tiles.getIn(['share', 'data', 'titles'], List()),
  lang: user.getIn(['data', 'language', 0], 'en'),
  emailProcessing: share.get('emailProcessing'),
  emailSuccess: !!share.get('duplicate'),
  share: share.get('data', Map()),
  error: share.get('error'),
  auth,
}), (dispatch) => {
  const actions = getBoundActions(dispatch)
  return {
    setEventUserInteraction: actions.eventTracking.setEventUserInteraction,
    duplicateShareEmailCapture: actions.share.duplicateShareEmailCapture,
    setQualifiedView: actions.share.setShareQualifiedView,
    renderModal: actions.dialog.renderModal,
  }
})(SharePage)
