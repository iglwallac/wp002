import { bindActionCreators } from 'redux'
import * as Abuse from 'services/abuse/actions'
import * as AlertBarActions from 'services/alert-bar/actions'
import * as AppActions from 'services/app/actions'
import * as Assets from 'services/assets'
import * as AuthActions from 'services/auth/actions'
import * as BackToTopActions from 'components/BackToTop/actions'
import * as CheckoutActions from 'services/checkout/actions'
import * as CommentActions from 'services/comments/actions'
import * as ContinueWatchingActions from 'services/continue-watching/actions'
import * as CookieActions from 'services/cookie/actions'
import * as DetailActions from 'services/detail/actions'
import * as DialogActions from 'services/dialog/actions'
import * as EmailSignupActions from 'services/email-signup/actions'
import * as EventTrackingActions from 'services/event-tracking/actions'
import * as ExternalAppActions from 'services/external-app/actions'
import * as FeatureTrackingActions from 'services/feature-tracking/actions'
import * as FilterSetActions from 'services/filter-set/actions'
import * as FormSubmissionsActions from 'services/form-submissions/actions'
import * as GetstreamActions from 'services/getstream/actions'
import * as CommunityActions from 'services/community/actions'
import * as GiftActions from 'services/gift/actions'
import * as GuidesActions from 'services/guides/actions'
import * as GuideDaysActions from 'services/guide-days/actions'
import * as HeaderActions from 'components/Header/actions'
import * as HideWatchedActions from 'services/hide-watched/actions'
import * as HiddenContentPreferencesActions from 'services/hidden-content-preferences/actions'
import * as HomeActions from 'services/home/actions'
import * as InboundTrackingActions from 'services/inbound-tracking/actions'
import * as InterstitialActions from 'services/interstitial/actions'
import * as JumbotronActions from 'services/jumbotron/actions'
import * as LanguageActions from 'services/languages/actions'
import * as LiveAccessEventsActions from 'services/live-access-events/actions'
import * as LoginActions from 'components/Login/actions'
import * as MediaActions from 'services/media/actions'
import * as MemberHomeActions from 'services/member-home/actions'
import * as MenuActions from 'services/menu/actions'
import * as MessageBoxActions from 'components/MessageBox/actions'
import * as NavigationActions from 'services/navigation/actions'
import * as NodeActions from 'services/node/actions'
import * as NotificationsActions from 'services/notifications/actions'
import * as OnboardingActions from 'services/onboarding/actions'
import * as OptimizelyActions from 'services/optimizely/actions'
import * as PageActions from 'services/page/actions'
import * as PaytrackActions from 'services/paytrack/actions'
import * as PlacementContentActions from 'services/placement-content/actions'
import * as PlanActions from 'services/plans/actions'
import * as PlaylistActions from 'services/playlist/actions'
import * as PMListActions from 'services/pm-list/actions'
import * as PMPlacementActions from 'services/pm-placement/actions'
import * as PMScreenActions from 'services/pm-screen/actions'
import * as PMSectionActions from 'services/pm-section/actions'
import * as PopupMarketingPromoActions from 'components/PopupMarketingPromo/actions'
import * as PortalActions from 'services/portal/actions'
import * as ProfitwellActions from 'services/profitwell/actions'
import * as RecentlyAddedActions from 'services/recently-added/actions'
import * as ReferralActions from 'services/referral/actions'
import * as RemoteLoginCodeActions from 'services/remote-login-code/actions'
import * as ResetPasswordActions from 'services/reset-password/actions'
import * as ResolverActions from 'services/resolver/actions'
import * as SearchActions from 'services/search/actions'
import * as SeriesActions from 'services/series/actions'
import * as ServerTimeActions from 'services/server-time/actions'
import * as ShareActions from 'services/share/actions'
import * as ShelfActions from 'services/shelf/actions'
import * as StaticTextActions from 'services/static-text/actions'
import * as SubscriptionActions from 'services/subscription/actions'
import * as TermActions from 'services/term/actions'
import * as TestarossaActions from 'services/testarossa/actions'
import * as TileRowsActions from 'components/TileRows/actions'
import * as TilesActions from 'services/tiles/actions'
import * as Toasty from 'services/toasty/actions'
import * as ToolTipActions from 'services/tool-tip/actions'
import * as TourActions from 'services/tour/actions'
import * as UpdatePaymentActions from 'services/update-payment/actions'
import * as UpstreamContextActions from 'services/upstream-context/actions'
import * as UserAccountActions from 'services/user-account/actions'
import * as UserActions from 'services/user/actions'
import * as UserNodeInfoActions from 'services/user-node-info/actions'
import * as UserProfilesActions from 'services/user-profiles/actions'
import * as UserScoreActions from 'services/user-score/actions'
import * as UserVideoActions from 'services/user-video/actions'
import * as VideoActions from 'services/video/actions'
import * as VideoPlayerActions from 'components/VideoPlayer/actions'
import * as VideosActions from 'services/videos/actions'
import * as VocabularyTermsActions from 'services/vocabulary-terms/actions'
import * as ZuoraActions from 'services/zuora/actions'

let boundActions = null

export default getBoundActions

export function getBoundActions (dispatch) {
  if (!boundActions) {
    boundActions = {
      abuse: bindActionCreators(Abuse, dispatch),
      alertBar: bindActionCreators(AlertBarActions, dispatch),
      app: bindActionCreators(AppActions, dispatch),
      assets: bindActionCreators(Assets, dispatch),
      auth: bindActionCreators(AuthActions, dispatch),
      backToTop: bindActionCreators(BackToTopActions, dispatch),
      checkout: bindActionCreators(CheckoutActions, dispatch),
      comments: bindActionCreators(CommentActions, dispatch),
      continueWatching: bindActionCreators(ContinueWatchingActions, dispatch),
      cookie: bindActionCreators(CookieActions, dispatch),
      detail: bindActionCreators(DetailActions, dispatch),
      dialog: bindActionCreators(DialogActions, dispatch),
      emailSignup: bindActionCreators(EmailSignupActions, dispatch),
      eventTracking: bindActionCreators(EventTrackingActions, dispatch),
      externalApp: bindActionCreators(ExternalAppActions, dispatch),
      featureTracking: bindActionCreators(FeatureTrackingActions, dispatch),
      filterSet: bindActionCreators(FilterSetActions, dispatch),
      formSubmissions: bindActionCreators(FormSubmissionsActions, dispatch),
      getstream: bindActionCreators(GetstreamActions, dispatch),
      community: bindActionCreators(CommunityActions, dispatch),
      gift: bindActionCreators(GiftActions, dispatch),
      guides: bindActionCreators(GuidesActions, dispatch),
      guideDays: bindActionCreators(GuideDaysActions, dispatch),
      header: bindActionCreators(HeaderActions, dispatch),
      hideWatched: bindActionCreators(HideWatchedActions, dispatch),
      hiddenContentPreferences: bindActionCreators(HiddenContentPreferencesActions, dispatch),
      home: bindActionCreators(HomeActions, dispatch),
      inboundTracking: bindActionCreators(InboundTrackingActions, dispatch),
      interstitial: bindActionCreators(InterstitialActions, dispatch),
      jumbotron: bindActionCreators(JumbotronActions, dispatch),
      languages: bindActionCreators(LanguageActions, dispatch),
      liveAccessEvents: bindActionCreators(LiveAccessEventsActions, dispatch),
      login: bindActionCreators(LoginActions, dispatch),
      media: bindActionCreators(MediaActions, dispatch),
      memberHome: bindActionCreators(MemberHomeActions, dispatch),
      menu: bindActionCreators(MenuActions, dispatch),
      messageBox: bindActionCreators(MessageBoxActions, dispatch),
      navigation: bindActionCreators(NavigationActions, dispatch),
      node: bindActionCreators(NodeActions, dispatch),
      notifications: bindActionCreators(NotificationsActions, dispatch),
      onboarding: bindActionCreators(OnboardingActions, dispatch),
      optimizely: bindActionCreators(OptimizelyActions, dispatch),
      page: bindActionCreators(PageActions, dispatch),
      paytrack: bindActionCreators(PaytrackActions, dispatch),
      placementContent: bindActionCreators(PlacementContentActions, dispatch),
      plans: bindActionCreators(PlanActions, dispatch),
      playlist: bindActionCreators(PlaylistActions, dispatch),
      pmList: bindActionCreators(PMListActions, dispatch),
      pmPlacement: bindActionCreators(PMPlacementActions, dispatch),
      pmScreen: bindActionCreators(PMScreenActions, dispatch),
      pmSection: bindActionCreators(PMSectionActions, dispatch),
      popupMarketingPromo: bindActionCreators(PopupMarketingPromoActions, dispatch),
      portal: bindActionCreators(PortalActions, dispatch),
      profitwell: bindActionCreators(ProfitwellActions, dispatch),
      recentlyAdded: bindActionCreators(RecentlyAddedActions, dispatch),
      remoteLoginCode: bindActionCreators(RemoteLoginCodeActions, dispatch),
      resetPassword: bindActionCreators(ResetPasswordActions, dispatch),
      resolver: bindActionCreators(ResolverActions, dispatch),
      search: bindActionCreators(SearchActions, dispatch),
      series: bindActionCreators(SeriesActions, dispatch),
      serverTime: bindActionCreators(ServerTimeActions, dispatch),
      share: bindActionCreators(ShareActions, dispatch),
      shelf: bindActionCreators(ShelfActions, dispatch),
      staticText: bindActionCreators(StaticTextActions, dispatch),
      subscription: bindActionCreators(SubscriptionActions, dispatch),
      term: bindActionCreators(TermActions, dispatch),
      testarossa: bindActionCreators(TestarossaActions, dispatch),
      tileRows: bindActionCreators(TileRowsActions, dispatch),
      tiles: bindActionCreators(TilesActions, dispatch),
      toasty: bindActionCreators(Toasty, dispatch),
      toolTip: bindActionCreators(ToolTipActions, dispatch),
      tour: bindActionCreators(TourActions, dispatch),
      updatePayment: bindActionCreators(UpdatePaymentActions, dispatch),
      upstreamContext: bindActionCreators(UpstreamContextActions, dispatch),
      user: bindActionCreators(UserActions, dispatch),
      userAccount: bindActionCreators(UserAccountActions, dispatch),
      userNodeInfo: bindActionCreators(UserNodeInfoActions, dispatch),
      userProfiles: bindActionCreators(UserProfilesActions, dispatch),
      userReferrals: bindActionCreators(ReferralActions, dispatch),
      userScore: bindActionCreators(UserScoreActions, dispatch),
      userVideo: bindActionCreators(UserVideoActions, dispatch),
      video: bindActionCreators(VideoActions, dispatch),
      videoPlayer: bindActionCreators(VideoPlayerActions, dispatch),
      videos: bindActionCreators(VideosActions, dispatch),
      vocabularyTerms: bindActionCreators(VocabularyTermsActions, dispatch),
      zuora: bindActionCreators(ZuoraActions, dispatch),
    }
  }
  return boundActions
}
