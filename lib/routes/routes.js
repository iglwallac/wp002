/* eslint-disable react/jsx-filename-extension, global-require */
import React from 'react'
import _get from 'lodash/get'
import _concat from 'lodash/concat'
import { get as getConfig } from 'config'
import {
  ERROR_TYPE_403,
  ERROR_TYPE_404,
  ERROR_TYPE_500,
  ERROR_TYPE_503,
} from 'components/ErrorPage/types'
import WithAuth from 'components/WithAuth'
import Sherpa, { TYPE_LARGE } from 'components/Sherpa'
import Loadable from 'react-loadable'
import {
  URL_HOME,
  URL_LOGOUT,
  URL_REFER,
  URL_REFER_JOIN,
  URL_ACCOUNT_SETTINGS,
  URL_ACCOUNT_CANCEL_CONFIRM,
  URL_ACCOUNT_CANCEL_OFFER,
  URL_ACCOUNT_PROFILE,
  URL_ACCOUNT_CANCEL,
  URL_EMAIL_SETTINGS,
  URL_FREE_TRIAL,
  URL_FREE_TRIAL_ACCOUNT,
  URL_FREE_TRIAL_CONFIRM,
  URL_GIFT_SELECT,
  URL_GIFT_THEME,
  URL_GIFT_RECIPIENT,
  URL_GIFT_PREVIEW,
  URL_GIFT_PAYMENT,
  URL_CART_ACCESS_DENIED,
  URL_ACCOUNT_CANCEL_FREE_MONTH,
  URL_ACCOUNT_PAUSE,
  URL_ACCOUNT_PAUSE_CONFIRM,
} from 'services/url/constants'
import {
  RESOLVER_TYPE_COMMUNITY_ACTIVITY,
  RESOLVER_TYPE_COMMUNITY,
  RESOLVER_TYPE_NOT_FOUND,
  RESOLVER_TYPE_PORTAL,
  RESOLVER_TYPE_SHARE,
  RESOLVER_TYPE_EVENTS,
  RESOLVER_TYPE_PLAYLIST,
} from 'services/resolver/types'
import { TestarossaSwitch, TestarossaCase, TestarossaDefault } from 'components/Testarossa'

function Loading (props) {
  if (props.pastDelay) {
    return <Sherpa type={TYPE_LARGE} />
  }
  return null
}

const LoadableYogaHome = Loadable({
  loader: () => import('components/YogaHome'),
  loading: Loading,
})
const LoadableIndexPage = Loadable({
  loader: () => import('components/IndexPage'),
  loading: Loading,
})
const LoadableNotificationsCenterAll = Loadable({
  loader: () => import('components/NotificationsCenterAll'),
  loading: Loading,
})
const LoadableVideoPage = Loadable({
  loader: () => import('components/VideoPage'),
  loading: Loading,
})
const LoadableDetailPage = Loadable({
  loader: () => import('components/DetailPage'),
  loading: Loading,
})
const LoadableDetailPageV2 = Loadable({
  loader: () => import('components/DetailPageV2/DetailPageV2'),
  loading: Loading,
})
const LoadableSharePage = Loadable({
  loader: () => import('components/SharePage'),
  loading: Loading,
})
const LoadableOnboardingPage = Loadable({
  loader: () => import('components/Onboarding/OnboardingStart'),
  loading: Loading,
})
const LoadableResetPage = Loadable({
  loader: () => import('components/ResetPage'),
  loading: Loading,
})
const LoadableEventDetailsPage = Loadable({
  loader: () => import('components/EventDetailsPage'),
  loading: Loading,
})
const LoadableEventsPage = Loadable({
  loader: () => import('components/EventsPage'),
  loading: Loading,
})
const LoadableCommunityMainFeedPage = Loadable({
  loader: () => import('components/Community/MainFeedPage'),
  loading: Loading,
})
const LoadableGetstreamMainFeedPage = Loadable({
  loader: () => import('components/CommunityFeedPage'),
  loading: Loading,
})
const LoadableActivityDetailPage = Loadable({
  loader: () => import('components/Getstream/ActivityDetailPage'),
  loading: Loading,
})
const LoadableCommunityActivityDetailPage = Loadable({
  loader: () => import('components/Community/ActivityDetailPage'),
  loading: Loading,
})
const LoadableLivePage = Loadable({
  loader: () => import('components/LivePage'),
  loading: Loading,
})
const LoadableLiveAccessPage = Loadable({
  loader: () => import('components/LiveAccessPage'),
  loading: Loading,
})
const LoadableLiveChannelPage = Loadable({
  loader: () => import('components/LiveChannelPage'),
  loading: Loading,
})
const LoadableAccountPausePage = Loadable({
  loader: () => import('components/AccountPause/AccountPausePage'),
  loading: Loading,
})
const LoadableAccountPauseConfirmPage = Loadable({
  loader: () => import('components/AccountPause/AccountPauseConfirmPage'),
  loading: Loading,
})
const LoadableAccountCancelPage = Loadable({
  loader: () => import('components/AccountCancelV2/AccountCancelPage'),
  loading: Loading,
})
const LoadableCancelConfirmPage = Loadable({
  loader: () => import('components/AccountCancelV2/AccountCancelConfirmPage'),
  loading: Loading,
})
const LoadableCancelOfferPage = Loadable({
  loader: () => import('components/AccountCancelV2/AccountCancelOfferPage'),
  loading: Loading,
})
const LoadableFreeMonthPage = Loadable({
  loader: () => import('components/AccountCancelFreeMonthPage'),
  loading: Loading,
})
const LoadableChangePlan = Loadable({
  loader: () => import('components/ChangePlanPage'),
  loading: Loading,
})
const LoadableMyAccountChangePlanPage = Loadable({
  loader: () => import('components/MyAccount/MyAccountChangePlanPage'),
  loading: Loading,
})
const LoadableTopics = Loadable({
  loader: () => import('components/TopicsPageV2'),
  loading: Loading,
})
const LoadableSearch = Loadable({
  loader: () => import('components/SearchPage'),
  loading: Loading,
})
const LoadablePlaylist = Loadable({
  loader: () => import('components/PlaylistPage'),
  loading: Loading,
})
const LoadableMultiplePlaylists = Loadable({
  loader: () => import('components/MultiplePlaylists/MultiplePlaylistsPage'),
  loading: Loading,
})
const LoadableActivate = Loadable({
  loader: () => import('components/ActivateRemoteLoginCodePage'),
  loading: Loading,
})
const LoadableGo = Loadable({
  loader: () => import('components/GoPage'),
  loading: Loading,
})
const LoadableCartAccessDeniedPage = Loadable({
  loader: () => import('components/CartAccessDeniedPage'),
  loading: Loading,
})
const LoadableCartPlansPage = Loadable({
  loader: () => import('components/CartPlansPage'),
  loading: Loading,
})
const LoadableCartChoosePlan = Loadable({
  loader: () => import('components/CartChoosePlanPage'),
  loading: Loading,
})
const LoadableCartAccountCreate = Loadable({
  loader: () => import('components/CartAccountCreatePage'),
  loading: Loading,
})
const LoadableAccountCreation = Loadable({
  loader: () => import('components/CartAccountContinuePage'),
  loading: Loading,
})
const LoadableCartPaymentPage = Loadable({
  loader: () => import('components/CartPaymentPage'),
  loading: Loading,
})
const LoadableCartChoosePayment = Loadable({
  loader: () => import('components/CartChoosePaymentPage'),
  loading: Loading,
})
const LoadableCartReceipt = Loadable({
  loader: () => import('components/CartReceiptPage'),
  loading: Loading,
})
const LoadableInviteFriendPage = Loadable({
  loader: () => import('components/InviteFriend/InviteFriendPage/InviteFriendPage'),
  loading: Loading,
})
const LoadableInviteFriendReferralsPage = Loadable({
  loader: () => import('components/InviteFriend/InviteFriendReferralsPage/InviteFriendReferralsPage'),
  loading: Loading,
})
const LoadableMyAccountProfilePage = Loadable({
  loader: () => import('components/MyAccount/MyAccountProfilePage'),
  loading: Loading,
})
const LoadableManageProfiles = Loadable({
  loader: () => import('components/ManageProfilesPage'),
  loading: Loading,
})
const LoadabbleMyAccountPage = Loadable({
  loader: () => import('components/MyAccount/MyAccountPage'),
  loading: Loading,
})
const LoadableMyAccountSettings = Loadable({
  loader: () => import('components/MyAccount/MyAccountSettings'),
  loading: Loading,
})
const LoadableContentPersonalizationEdit = Loadable({
  loader: () => import('components/ContentPersonalization/ContentPersonalizationEdit'),
  loading: Loading,
})
const LoadableRecentlyAdded = Loadable({
  loader: () => import('components/RecentlyAddedPage'),
  loading: Loading,
})
const LoadableWatchHistory = Loadable({
  loader: () => import('components/WatchHistory'),
  loading: Loading,
})
const LoadableLogoutPage = Loadable({
  loader: () => import('components/LogoutPage'),
  loading: Loading,
})
const LoadableKitchenSink = Loadable({
  loader: () => import('components/KitchenSink'),
  loading: Loading,
})
const LoadableYogaTeachersPage = Loadable({
  loader: () => import('components/YogaTeachersPage'),
  loading: Loading,
})
const LoadableMemberCommunication = Loadable({
  loader: () => import('components/MemberCommunicationPage'),
  loading: Loading,
})
const LoadableMemberPortal = Loadable({
  loader: () => import('components/Portal'),
  loading: Loading,
})
const LoadableSubcategoryPage = Loadable({
  loader: () => import('components/SubcategoryPage'),
  loading: Loading,
})
const LoadablePolicyPage = Loadable({
  loader: () => import('components/PolicyPage'),
  loading: Loading,
})
const LoadableErrorPage = Loadable({
  loader: () => import('components/ErrorPage'),
  loading: Loading,
})
const LoadableNotificationsCenterManage = Loadable({
  loader: () => import('components/NotificationsCenterManage'),
  loading: Loading,
})
const LoadableEmailPreferencesPage = Loadable({
  loader: () => import('components/EmailPreferencesPage'),
  loading: Loading,
})
const LoadableFreeTrialPage = Loadable({
  loader: () => import('components/FreeTrial/FreeTrialPage'),
  loading: Loading,
})
const LoadableFreeTrialAccountPage = Loadable({
  loader: () => import('components/FreeTrial/FreeTrialAccountPage'),
  loading: Loading,
})
const LoadableFreeTrialConfirmPage = Loadable({
  loader: () => import('components/FreeTrial/FreeTrialConfirmPage'),
  loading: Loading,
})
const LoadableGiftThemePage = Loadable({
  loader: () => import('components/Gift/GiftThemePage'),
  loading: Loading,
})
const LoadableGiftGivePage = Loadable({
  loader: () => import('components/Gift/GiftGivePage'),
  loading: Loading,
})
const LoadableGiftPreviewPage = Loadable({
  loader: () => import('components/Gift/GiftPreviewPage'),
  loading: Loading,
})
const LoadableGiftPaymentPage = Loadable({
  loader: () => import('components/Gift/GiftPaymentPage'),
  loading: Loading,
})
const LoadableGiftSelectPage = Loadable({
  loader: () => import('components/Gift/GiftPlanSelectPage'),
  loading: Loading,
})
const LoadableGuidePage = Loadable({
  loader: () => import('components/GuidedPrograms/Guide'),
  loading: Loading,
})
const LoadableOnboarding14 = Loadable({
  loader: () => import('components/ContentPersonalization/Onboarding'),
  loading: Loading,
})


function renderVideoRouteComponent (props) {
  const query = _get(props.location, 'query', {})
  if (query.fullplayer) {
    return <LoadableVideoPage location={props.location} history={props.history} />
  } else if (getConfig().features.detailPageV2) {
    return (
      <LoadableDetailPageV2 history={props.history} location={props.location} />
    )
  }
  return <LoadableDetailPage location={props.location} history={props.history} />
}

const firstRoutes = [
  {
    path: '/share/:token',
    resolverType: RESOLVER_TYPE_SHARE,
    component: (props) => {
      return <LoadableSharePage location={props.location} history={props.history} />
    },
  },
  {
    path: '/portal/:uid',
    resolverType: RESOLVER_TYPE_PORTAL,
    component: (props) => {
      return <LoadableMemberPortal location={props.location} history={props.history} />
    },
  },
  {
    path: '/get-started',
    component: (props) => {
      return (
        <TestarossaSwitch>
          <TestarossaCase campaign="ME-3453" variation={1} unwrap>
            <LoadableOnboarding14 location={props.location} history={props.history} />
          </TestarossaCase>
          <TestarossaDefault unwrap>
            <LoadableOnboardingPage location={props.location} history={props.history} />
          </TestarossaDefault>
        </TestarossaSwitch>
      )
    },
  },
  {
    path: '/password-reset',
    component: (props) => {
      return <LoadableResetPage location={props.location} history={props.history} />
    },
  },
  {
    path: '/show/:id', // @todo: how to handle multiple paths that use same component?
    component: renderVideoRouteComponent,
  },
  {
    path: '/tv/:id',
    component: renderVideoRouteComponent,
  },
  {
    path: '/series/:id',
    component: renderVideoRouteComponent,
  },
  {
    path: '/video/:id',
    component: renderVideoRouteComponent,
  },
  {
    path: '/events/:id',
    resolverType: RESOLVER_TYPE_EVENTS,
    component: (props) => {
      return <LoadableEventDetailsPage location={props.location} history={props.history} />
    },
  },
  {
    path: '/events',
    component: (props) => {
      return <LoadableEventsPage history={props.history} location={props.location} />
    },
  },
  {
    path: '/community',
    resolverType: RESOLVER_TYPE_COMMUNITY,
    component: (props) => {
      if (getConfig().features.community.v2) {
        return (
          <LoadableCommunityMainFeedPage history={props.history} location={props.location} />
        )
      }
      return <LoadableGetstreamMainFeedPage history={props.history} location={props.location} />
    },
  },
  {
    path: '/community/activity/:activityId',
    resolverType: RESOLVER_TYPE_COMMUNITY_ACTIVITY,
    component: (props) => {
      const activityId = props.resolver.getIn(
        ['data', 'params', 'activityId'])

      if (getConfig().features.community.v2) {
        return (
          <LoadableCommunityActivityDetailPage
            history={props.history}
            location={props.location}
            activityId={activityId}
          />
        )
      }
      return (
        <LoadableActivityDetailPage
          location={props.location}
          history={props.history}
          activityId={activityId}
        />
      )
    },
  },
  {
    path: '/live',
    component: (props) => {
      return <LoadableLivePage history={props.history} location={props.location} />
    },
  },
  {
    path: '/live-access',
    component: (props) => {
      return <LoadableLiveAccessPage history={props.history} location={props.location} />
    },
  },
  {
    path: '/gaia-now',
    component: (props) => {
      return <LoadableLiveChannelPage history={props.history} location={props.location} />
    },
  },
  {
    path: URL_ACCOUNT_PAUSE,
    component: (props) => {
      return <LoadableAccountPausePage history={props.history} location={props.location} />
    },
  },
  {
    path: URL_ACCOUNT_PAUSE_CONFIRM,
    component: (props) => {
      return <LoadableAccountPauseConfirmPage history={props.history} location={props.location} />
    },
  },
  {
    path: URL_ACCOUNT_CANCEL_CONFIRM,
    component: (props) => {
      if (!getConfig().features.userAccount.cancelV2) {
        return (
          <LoadableErrorPage
            history={props.history}
            location={props.location}
            code={ERROR_TYPE_404}
          />
        )
      }
      return <LoadableCancelConfirmPage history={props.history} location={props.location} />
    },
  },
  {
    path: URL_ACCOUNT_CANCEL_OFFER,
    component: (props) => {
      if (!getConfig().features.userAccount.cancelV2) {
        return (
          <LoadableErrorPage
            history={props.history}
            location={props.location}
            code={ERROR_TYPE_404}
          />
        )
      }
      return <LoadableCancelOfferPage history={props.history} location={props.location} />
    },
  },
  {
    path: URL_ACCOUNT_CANCEL_FREE_MONTH,
    component: (props) => {
      return <LoadableFreeMonthPage history={props.history} location={props.location} />
    },
  },
  {
    path: '/account/change-plan',
    component: (props) => {
      if (getConfig().features.userAccount.changePlanV2) {
        return (
          <LoadableMyAccountChangePlanPage history={props.history} location={props.location} />
        )
      }
      return <LoadableChangePlan history={props.history} location={props.location} />
    },
  },
  {
    path: URL_EMAIL_SETTINGS,
    component: (props) => {
      return <LoadableEmailPreferencesPage history={props.history} location={props.location} />
    },
  },
  {
    path: URL_FREE_TRIAL_ACCOUNT,
    component: (props) => {
      return <LoadableFreeTrialAccountPage history={props.history} location={props.location} />
    },
  },
  {
    path: URL_FREE_TRIAL_CONFIRM,
    component: (props) => {
      return <LoadableFreeTrialConfirmPage history={props.history} location={props.location} />
    },
  },
  {
    path: URL_FREE_TRIAL,
    component: (props) => {
      return <LoadableFreeTrialPage history={props.history} location={props.location} />
    },
  },
  {
    path: '/topics',
    component: (props) => {
      return <LoadableTopics history={props.history} location={props.location} />
    },
  },
  {
    path: '/search',
    component: (props) => {
      return <LoadableSearch history={props.history} location={props.location} />
    },
  },
  {
    path: '/playlist',
    component: (props) => {
      return <LoadablePlaylist history={props.history} location={props.location} />
    },
  },
  {
    path: '/playlist/:playlistType',
    resolverType: RESOLVER_TYPE_PLAYLIST,
    component: (props) => {
      if (!getConfig().features.multiplePlaylists) {
        return (
          <LoadableErrorPage
            history={props.history}
            location={props.location}
            code={ERROR_TYPE_404}
          />
        )
      }
      return <LoadableMultiplePlaylists history={props.history} location={props.location} />
    },
  },
  {
    path: '/activate',
    component: (props) => {
      return <LoadableActivate history={props.history} location={props.location} />
    },
  },
  {
    path: '/go',
    component: (props) => {
      return <LoadableGo history={props.history} location={props.location} />
    },
  },
  {
    path: URL_CART_ACCESS_DENIED,
    component: (props) => {
      return <LoadableCartAccessDeniedPage history={props.history} location={props.location} />
    },
  },
  {
    path: '/plan-selection/plans',
    component: (props) => {
      return <LoadableCartPlansPage history={props.history} location={props.location} />
    },
  },
  {
    path: '/plan-selection',
    component: (props) => {
      return <LoadableCartChoosePlan history={props.history} location={props.location} />
    },
  },
  {
    path: '/cart/account-creation/create',
    component: (props) => {
      return <LoadableCartAccountCreate history={props.history} location={props.location} />
    },
  },
  {
    path: '/cart/account-creation',
    component: (props) => {
      return <LoadableAccountCreation history={props.history} location={props.location} />
    },
  },
  {
    path: '/cart/billing/payment',
    component: (props) => {
      return <LoadableCartPaymentPage history={props.history} location={props.location} />
    },
  },
  {
    path: '/cart/billing',
    component: (props) => {
      return <LoadableCartChoosePayment history={props.history} location={props.location} />
    },
  },
  {
    path: '/cart/confirmation',
    component: (props) => {
      return <LoadableCartReceipt history={props.history} location={props.location} />
    },
  },
  {
    path: '/manage-profiles',
    component: (props) => {
      return <LoadableManageProfiles history={props.history} location={props.location} />
    },
  },
  {
    path: '/account',
    component: (props) => {
      return <LoadabbleMyAccountPage history={props.history} location={props.location} />
    },
  },
  {
    path: URL_ACCOUNT_SETTINGS,
    component: (props) => {
      return <LoadableMyAccountSettings history={props.history} location={props.location} />
    },
  },
  {
    path: '/account/settings/interests',
    component: (props) => {
      return <LoadableContentPersonalizationEdit history={props.history} />
    },
  },
  {
    path: URL_ACCOUNT_CANCEL,
    component: (props) => {
      if (!getConfig().features.userAccount.cancelV2) {
        return (
          <LoadableErrorPage
            history={props.history}
            location={props.location}
            code={ERROR_TYPE_404}
          />
        )
      }

      return <LoadableAccountCancelPage history={props.history} location={props.location} />
    },
  },
  {
    path: URL_ACCOUNT_PROFILE,
    component: (props) => {
      return <LoadableMyAccountProfilePage history={props.history} location={props.location} />
    },
  },
  {
    path: URL_REFER_JOIN,
    component: (props) => {
      return (
        <LoadableInviteFriendPage location={props.location} history={props.history} />
      )
    },
  },
  {
    path: URL_REFER,
    component: (props) => {
      return (
        <LoadableInviteFriendReferralsPage history={props.history} location={props.location} />
      )
    },
  },
  {
    path: '/terms-privacy',
    component: (props) => {
      return <LoadablePolicyPage history={props.history} location={props.location} />
    },
  },
  {
    path: '/recently-added',
    component: (props) => {
      return <LoadableRecentlyAdded history={props.history} location={props.location} />
    },
  },
  {
    path: '/guide/:id',
    component: (props) => {
      return <LoadableGuidePage location={props.location} history={props.history} />
    },
  },
  {
    path: '/watch-history',
    component: (props) => {
      return <LoadableWatchHistory history={props.history} location={props.location} />
    },
  },
  {
    path: URL_LOGOUT,
    component: (props) => {
      return <LoadableLogoutPage history={props.history} location={props.location} />
    },
  },
  {
    path: '/dev/kitchen-sink',
    component: (props) => {
      if (!getConfig().features.development.kitchenSink) {
        return (
          <LoadableErrorPage
            history={props.history}
            location={props.location}
            code={ERROR_TYPE_404}
          />
        )
      }
      return <LoadableKitchenSink history={props.history} location={props.location} />
    },
  },
  {
    path: '/yoga/teachers',
    component: (props) => {
      return <LoadableYogaTeachersPage history={props.history} location={props.location} />
    },
  },
  {
    path: '/gaia-updates',
    component: (props) => {
      return <LoadableMemberCommunication history={props.history} location={props.location} />
    },
  },
  {
    path: URL_GIFT_THEME,
    component: (props) => {
      if (!getConfig().features.gift.checkout) {
        return (
          <LoadableErrorPage
            history={props.history}
            location={props.location}
            code={ERROR_TYPE_404}
          />
        )
      }

      return <LoadableGiftThemePage history={props.history} location={props.location} />
    },
  },
  {
    path: URL_GIFT_SELECT,
    component: (props) => {
      if (!getConfig().features.gift.checkout) {
        return (
          <LoadableErrorPage
            history={props.history}
            location={props.location}
            code={ERROR_TYPE_404}
          />
        )
      }

      return <LoadableGiftSelectPage history={props.history} location={props.location} />
    },
  },
  {
    path: URL_GIFT_RECIPIENT,
    component: (props) => {
      if (!getConfig().features.gift.checkout) {
        return (
          <LoadableErrorPage
            history={props.history}
            location={props.location}
            code={ERROR_TYPE_404}
          />
        )
      }

      return <LoadableGiftGivePage history={props.history} location={props.location} />
    },
  },
  {
    path: URL_GIFT_PREVIEW,
    component: (props) => {
      if (!getConfig().features.gift.checkout) {
        return (
          <LoadableErrorPage
            history={props.history}
            location={props.location}
            code={ERROR_TYPE_404}
          />
        )
      }

      return <LoadableGiftPreviewPage history={props.history} location={props.location} />
    },
  },
  {
    path: URL_GIFT_PAYMENT,
    component: (props) => {
      if (!getConfig().features.gift.checkout) {
        return (
          <LoadableErrorPage
            history={props.history}
            location={props.location}
            code={ERROR_TYPE_404}
          />
        )
      }

      return <LoadableGiftPaymentPage history={props.history} location={props.location} />
    },
  },
]

const shareViewRoutes = [
  {
    path: '/notifications/manage',
    component: props => (
      <WithAuth>
        <LoadableNotificationsCenterManage
          history={props.history}
          location={props.location}
        />
      </WithAuth>
    ),
  },
  {
    path: '/notifications',
    component: props => (
      <WithAuth>
        <LoadableNotificationsCenterAll
          history={props.history}
          location={props.location}
        />
      </WithAuth>
    ),
  },
]

const lastRoutes = [
  {
    path: '/error/403',
    // This is an error so we want the app to render
    // the error page, but not resolve the path.
    resolverType: RESOLVER_TYPE_NOT_FOUND,
    component: props => (
      <LoadableErrorPage
        history={props.history}
        location={props.location}
        code={ERROR_TYPE_403}
      />
    ),
  },
  {
    path: '/error/404',
    // This is an error so we want the app to render
    // the error page, but not resolve the path.
    resolverType: RESOLVER_TYPE_NOT_FOUND,
    component: props => (
      <LoadableErrorPage
        history={props.history}
        location={props.location}
        code={ERROR_TYPE_404}
      />
    ),
  },
  {
    path: '/error/500',
    // This is an error so we want the app to render
    // the error page, but not resolve the path.
    resolverType: RESOLVER_TYPE_NOT_FOUND,
    component: props => (
      <LoadableErrorPage
        history={props.history}
        location={props.location}
        code={ERROR_TYPE_500}
      />
    ),
  },
  {
    path: '/error/503',
    // This is an error so we want the app to render
    // the error page, but not resolve the path.
    resolverType: RESOLVER_TYPE_NOT_FOUND,
    component: props => (
      <LoadableErrorPage
        history={props.history}
        location={props.location}
        code={ERROR_TYPE_503}
      />
    ),
  },
  {
    path: '/:category/:subCategory',
    component: (props) => {
      const { location } = props
      const isYogaPractices = (_get(location, 'pathname') === '/yoga/practices')
      const isYogaMeditation = (_get(location, 'pathname') === '/style/yoga-meditation')
      let selectedFilterSet = _get(location, ['query', 'filter-set'])
      if (isYogaMeditation) {
        selectedFilterSet = 'yoga'
      }
      const isYogaFiltered = (selectedFilterSet === 'yoga')
      const isYoga = isYogaPractices || isYogaFiltered

      return (
        <LoadableSubcategoryPage
          history={props.history}
          location={props.location}
          defaultSort={isYoga ? 'recent' : null}
        />
      )
    },
  },
  {
    path: '/yoga',
    component: (props) => {
      return (
        <LoadableYogaHome
          history={props.history}
          location={props.location}
        />
      )
    },
  },
  {
    path: URL_HOME,
    component: (props) => {
      return <LoadableIndexPage history={props.history} location={props.location} />
    },
  },
  {
    path: '*',
    // This is a catch all error so we want the app to render
    // the error page, which is current the 404 page.
    component: props => (
      <LoadableErrorPage
        history={props.history}
        location={props.location}
        code={ERROR_TYPE_404}
      />
    ),
  },
]

const middleRoutes = getConfig().features.shareView ? shareViewRoutes : []
export default _concat(firstRoutes, middleRoutes, lastRoutes)
