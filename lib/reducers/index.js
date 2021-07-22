import { combineReducers } from 'redux'
import abuseReducer, { initialState as abuseInitialState } from 'services/abuse/reducers'
import alertBarReducer, { initialState as alertBarInitialState } from 'services/alert-bar/reducers'
import appReducer, { initialState as appInitialState } from 'services/app/reducers'
import assetsReducer, { initialState as assetsInitialState } from 'services/assets/reducers'
import authReducer, { initialState as authInitialState } from 'services/auth/reducers'
import backToTopReducer, { initialState as backToTopState } from 'components/BackToTop/reducers'
import checkoutReducer, { initialState as checkoutInitialState } from 'services/checkout/reducers'
import commentsReducer, { initialState as commentsInitialState } from 'services/comments/reducers'
import communityReducer, { initialState as communityInitialState } from 'services/community/reducers'
import continueWatchingReducer, { initialState as continueWatchingInitialState } from 'services/continue-watching/reducers'
import cookieReducer, { initialState as cookieInitialState } from 'services/cookie/reducers'
import detailReducer, { initialState as detailInitialState } from 'services/detail/reducers'
import dialogReducer, { initialState as dialogInitialState } from 'services/dialog/reducers'
import emailSignupReducer, { initialState as emailSignupState } from 'services/email-signup/reducers'
import eventTrackingReducer, { initialState as eventTrackingState } from 'services/event-tracking/reducers'
import externalAppReducer, { initialState as externalAppInitialState } from 'services/external-app/reducers'
import featureTrackingReducer, { initialState as featureTrackingState } from 'services/feature-tracking/reducers'
import filterSetReducer, { initialState as filterSetInitialState } from 'services/filter-set/reducers'
import formSubmissionsReducer, { initialState as formSubmissionsInitialState } from 'services/form-submissions/reducers'
import getstreamReducer, { initialState as getstreamInitialState } from 'services/getstream/reducers'
import giftReducer, { initialState as giftInitialState } from 'services/gift/reducers'
import guidesReducer, { initialState as guidesInitialState } from 'services/guides/reducers'
import guideDaysReducer, { initialState as guideDaysInitialState } from 'services/guide-days/reducers'
import headerReducer, { initialState as headerInitialState } from 'components/Header/reducers'
import hideWatchedReducer, { initialState as hideWatchedInitialState } from 'services/hide-watched/reducers'
import hiddenContentPreferencesReducer, { initialState as hiddenContentPreferencesInitialState } from 'services/hidden-content-preferences/reducers'
import homeReducer, { initialState as homeInitialState } from 'services/home/reducers'
import inboundTrackingReducer, { initialState as inboundTrackingState } from 'services/inbound-tracking/reducers'
import interstitialReducer, { initialState as interstitialState } from 'services/interstitial/reducers'
import jumbotronReducer, { initialState as jumbotronInitialState } from 'services/jumbotron/reducers'
import languagesReducer, { initialState as languagesInitialState } from 'services/languages/reducers'
import liveAccessEventsReducer, { initialState as liveAccessEventsInitialState } from 'services/live-access-events/reducers'
import loginReducer, { initialState as loginInitialState } from 'components/Login/reducers'
import mediaReducer, { initialState as mediaInitialState } from 'services/media/reducers'
import memberHomeReducer, { initialState as memberHomeInitialState } from 'services/member-home/reducers'
import menuReducer, { initialState as menuInitialState } from 'services/menu/reducers'
import messageBoxReducer, { initialState as messageBoxInitialState } from 'components/MessageBox/reducers'
import nodeReducer, { initialState as nodeInitialState } from 'services/node/reducers'
import notificationsReducer, { initialState as notificationsInitialState } from 'services/notifications/reducers'
import onboardingReducer, { initialState as onboardingInitialState } from 'services/onboarding/reducers'
import optimizelyReducer, { initialState as optimizelyInitialState } from 'services/optimizely/reducers'
import pageReducer, { initialState as pageInitialState } from 'services/page/reducers'
import paytrackReducer, { initialState as paytrackInitialState } from 'services/paytrack/reducers'
import placementContentReducer, { initialState as placementContentInitialState } from 'services/placement-content/reducers'
import plansReducer, { initialState as plansInitialState } from 'services/plans/reducers'
import playlistReducer, { initialState as playlistInitialState } from 'services/playlist/reducers'
import pmListReducer, { initialState as pmListInitialState } from 'services/pm-list/reducers'
import pmPlacementReducer, { initialState as pmPlacementInitialState } from 'services/pm-placement/reducers'
import pmScreenReducer, { initialState as pmScreenInitialState } from 'services/pm-screen/reducers'
import pmSectionReducer, { initialState as pmSectionInitialState } from 'services/pm-section/reducers'
import popupMarketingPromoReducer, { initialState as popupMarketingPromoState } from 'components/PopupMarketingPromo/reducers'
import portalReducer, { initialState as portalInitialState } from 'services/portal/reducers'
import profitwellReducer, { initialState as profitwellInitialState } from 'services/profitwell/reducers'
import recentlyAddedReducer, { initialState as recentlyAddedState } from 'services/recently-added/reducers'
import referralReducer, { initialState as referralInitialState } from 'services/referral/reducers'
import remoteLoginCodeReducer, { initialState as remoteLoginCodeInitialState } from 'services/remote-login-code/reducers'
import resetPasswordReducer, { initialState as resetPasswordInitialState } from 'services/reset-password/reducers'
import resolverReducer, { initialState as resolverInitialState } from 'services/resolver/reducers'
import searchReducer, { initialState as searchInitialState } from 'services/search/reducers'
import seriesReducer, { initialState as seriesInitialState } from 'services/series/reducers'
import serverTimeReducer, { initialState as serverTimeInitialState } from 'services/server-time/reducers'
import shareReducer, { initialState as shareState } from 'services/share/reducers'
import shelfReducer, { initialState as shelfInitialState } from 'services/shelf/reducers'
import staticTextReducer, { initialState as staticTextInitialState } from 'services/static-text/reducers'
import subscriptionReducer, { initialState as subscriptionInitialState } from 'services/subscription/reducers'
import termReducer, { initialState as termInitialState } from 'services/term/reducers'
import testarossaReducer, { initialState as testarossaInitialState } from 'services/testarossa/reducers'
import tileRowsReducer, { initialState as tileRowsInitialState } from 'components/TileRows/reducers'
import tilesReducer, { initialState as tilesInitialState } from 'services/tiles/reducers'
import toastyReducer, { initialState as toastyInitialState } from 'services/toasty/reducers'
import toolTipReducer, { initialState as toolTipInitialState } from 'services/tool-tip/reducers'
import tourReducer, { initialState as tourInitialState } from 'services/tour/reducers'
import updatePaymentReducer, { initialState as updatePaymentInitialState } from 'services/update-payment/reducers'
import upstreamContextReducer, { initialState as upstreamContextInitialState } from 'services/upstream-context/reducers'
import userAccountReducer, { initialState as userAccountInitialState } from 'services/user-account/reducers'
import userNodeInfoReducer, { initialState as userNodeInfoInitialState } from 'services/user-node-info/reducers'
import userProfilesReducer, { initialState as userProfilesInitialState } from 'services/user-profiles/reducers'
import userReducer, { initialState as userInitialState } from 'services/user/reducers'
import userScoreReducer, { initialState as userScoreInitialState } from 'services/user-score/reducers'
import userVideoReducer, { initialState as userVideoInitialState } from 'services/user-video/reducers'
import videoPlayerReducer, { initialState as videoPlayerInitialState } from 'components/VideoPlayer/reducers'
import videoReducer, { initialState as videoInitialState } from 'services/video/reducers'
import videosReducer, { initialState as videosInitialState } from 'services/videos/reducers'
import vocabularyTermsReducer, { initialState as vocabularyTermsInitialState } from 'services/vocabulary-terms/reducers'
import zuoraReducer, { initialState as zuoraInitialState } from 'services/zuora/reducers'

// alphabetical order matters new redux devtools
// please list new reducers in order
export const reducers = {
  abuse: abuseReducer,
  alertBar: alertBarReducer,
  app: appReducer,
  assets: assetsReducer,
  auth: authReducer,
  backToTop: backToTopReducer,
  checkout: checkoutReducer,
  comments: commentsReducer,
  community: communityReducer,
  continueWatching: continueWatchingReducer,
  cookie: cookieReducer,
  detail: detailReducer,
  dialog: dialogReducer,
  emailSignup: emailSignupReducer,
  eventTracking: eventTrackingReducer,
  externalApp: externalAppReducer,
  featureTracking: featureTrackingReducer,
  filterSet: filterSetReducer,
  formSubmissions: formSubmissionsReducer,
  getstream: getstreamReducer,
  gift: giftReducer,
  guides: guidesReducer,
  guideDays: guideDaysReducer,
  header: headerReducer,
  hideWatched: hideWatchedReducer,
  home: homeReducer,
  hiddenContentPreferences: hiddenContentPreferencesReducer,
  inboundTracking: inboundTrackingReducer,
  interstitial: interstitialReducer,
  jumbotron: jumbotronReducer,
  languages: languagesReducer,
  liveAccessEvents: liveAccessEventsReducer,
  login: loginReducer,
  media: mediaReducer,
  memberHome: memberHomeReducer,
  menu: menuReducer,
  messageBox: messageBoxReducer,
  node: nodeReducer,
  notifications: notificationsReducer,
  onboarding: onboardingReducer,
  optimizely: optimizelyReducer,
  page: pageReducer,
  paytrack: paytrackReducer,
  placementContent: placementContentReducer,
  plans: plansReducer,
  playlist: playlistReducer,
  pmList: pmListReducer,
  pmPlacement: pmPlacementReducer,
  pmScreen: pmScreenReducer,
  pmSection: pmSectionReducer,
  popupMarketingPromo: popupMarketingPromoReducer,
  portal: portalReducer,
  profitwell: profitwellReducer,
  recentlyAdded: recentlyAddedReducer,
  remoteLoginCode: remoteLoginCodeReducer,
  resetPassword: resetPasswordReducer,
  resolver: resolverReducer,
  search: searchReducer,
  series: seriesReducer,
  serverTime: serverTimeReducer,
  share: shareReducer,
  shelf: shelfReducer,
  staticText: staticTextReducer,
  subscription: subscriptionReducer,
  term: termReducer,
  testarossa: testarossaReducer,
  tileRows: tileRowsReducer,
  tiles: tilesReducer,
  toasty: toastyReducer,
  toolTip: toolTipReducer,
  tour: tourReducer,
  updatePayment: updatePaymentReducer,
  upstreamContext: upstreamContextReducer,
  user: userReducer,
  userAccount: userAccountReducer,
  userNodeInfo: userNodeInfoReducer,
  userProfiles: userProfilesReducer,
  userReferrals: referralReducer,
  userScore: userScoreReducer,
  userVideo: userVideoReducer,
  video: videoReducer,
  videoPlayer: videoPlayerReducer,
  videos: videosReducer,
  vocabularyTerms: vocabularyTermsReducer,
  zuora: zuoraReducer,
}

// alphabetical order matters with redux devtools
// please list new reducers in order
export const initialState = {
  abuse: abuseInitialState,
  alertBar: alertBarInitialState,
  app: appInitialState,
  assets: assetsInitialState,
  auth: authInitialState,
  backToTop: backToTopState,
  checkout: checkoutInitialState,
  comments: commentsInitialState,
  community: communityInitialState,
  continueWatching: continueWatchingInitialState,
  cookie: cookieInitialState,
  detail: detailInitialState,
  dialog: dialogInitialState,
  emailSignup: emailSignupState,
  eventTracking: eventTrackingState,
  externalApp: externalAppInitialState,
  featureTracking: featureTrackingState,
  filterSet: filterSetInitialState,
  formSubmissions: formSubmissionsInitialState,
  getstream: getstreamInitialState,
  gift: giftInitialState,
  guides: guidesInitialState,
  guideDays: guideDaysInitialState,
  header: headerInitialState,
  hideWatched: hideWatchedInitialState,
  hiddenContentPreferences: hiddenContentPreferencesInitialState,
  home: homeInitialState,
  inboundTracking: inboundTrackingState,
  interstitial: interstitialState,
  jumbotron: jumbotronInitialState,
  languages: languagesInitialState,
  liveAccessEvents: liveAccessEventsInitialState,
  login: loginInitialState,
  media: mediaInitialState,
  memberHome: memberHomeInitialState,
  menu: menuInitialState,
  messageBox: messageBoxInitialState,
  node: nodeInitialState,
  notifications: notificationsInitialState,
  onboarding: onboardingInitialState,
  optimizely: optimizelyInitialState,
  page: pageInitialState,
  paytrack: paytrackInitialState,
  placementContent: placementContentInitialState,
  plans: plansInitialState,
  playlist: playlistInitialState,
  pmList: pmListInitialState,
  pmPlacement: pmPlacementInitialState,
  pmScreen: pmScreenInitialState,
  pmSection: pmSectionInitialState,
  popupMarketingPromo: popupMarketingPromoState,
  portal: portalInitialState,
  profitwell: profitwellInitialState,
  recentlyAdded: recentlyAddedState,
  remoteLoginCode: remoteLoginCodeInitialState,
  resetPassword: resetPasswordInitialState,
  resolver: resolverInitialState,
  search: searchInitialState,
  series: seriesInitialState,
  serverTime: serverTimeInitialState,
  share: shareState,
  shelf: shelfInitialState,
  staticText: staticTextInitialState,
  subscription: subscriptionInitialState,
  term: termInitialState,
  testarossa: testarossaInitialState,
  tileRows: tileRowsInitialState,
  tiles: tilesInitialState,
  toasty: toastyInitialState,
  toolTip: toolTipInitialState,
  tour: tourInitialState,
  updatePayment: updatePaymentInitialState,
  upstreamContext: upstreamContextInitialState,
  user: userInitialState,
  userAccount: userAccountInitialState,
  userNodeInfo: userNodeInfoInitialState,
  userProfiles: userProfilesInitialState,
  userReferrals: referralInitialState,
  userScore: userScoreInitialState,
  userVideo: userVideoInitialState,
  video: videoInitialState,
  videoPlayer: videoPlayerInitialState,
  videos: videosInitialState,
  vocabularyTerms: vocabularyTermsInitialState,
  zuora: zuoraInitialState,
}

export default combineReducers(reducers)
