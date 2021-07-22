import unset from 'lodash/unset'
import get from 'lodash/get'
import set from 'lodash/set'

export const TYPE_MULTIPLE_PROFILES_RM_USER = 'MultipleProfilesRemoveUser'
export const TYPE_LIVE_ACCESS_EMAIL_CAPTURE = 'LiveAccessEmailCapture'
export const TYPE_SECTION_FULL_DESCRIPTION = 'SectionFullDescription'
export const TYPE_SUBCATEGORY_DESCRIPTION = 'SubcategoryDescription'
export const TYPE_UPDATE_PAYMENT_SUCCESS = 'UpdatePaymentSucess'
export const TYPE_FORGOT_PASSWORD = 'GlobalForgotPasswordModal'
export const TYPE_FREE_TRIAL_EXPIRED = 'modalFreeTrialExpired'
export const TYPE_UPDATE_PROFILE_IMAGE = 'UpdateProfileImage'
export const TYPE_INSTRUCTOR_BIO_VIDEO = 'InstructorBioVideo'
export const TYPE_SERIES_DESCRIPTION = 'SeriesDescription'
export const TYPE_PLAYLIST_SELECT = 'ModalPlaylistSelect'
export const TYPE_PORTAL_SHARE = 'ModalPortalShare'
export const DIALOG_CLOSE_BUTTON_COLOR_WHITE = 'white'
export const TYPE_DAYTONA_WA_10 = 'ConfigurableVideo'
export const TYPE_CART_CHANGE_PLAN = 'ModalCartChangePlan'
export const TYPE_MY_ACCOUNT_CHANGE_PLAN_CONFIRM = 'ModalMyAccountChangePlanConfirm'
export const TYPE_CHANGE_PASSWORD = 'ChangePassword'
export const TYPE_GIFT_FLOW_LOGIN = 'GiftFlowLogin'
export const TYPE_HIDE_CONTENT = 'ModalHideContent'
export const TYPE_PAUSE_RESUME = 'ModalPauseResume'
export const TYPE_PAUSE_ERROR = 'ModalPauseError'
export const TYPE_PORTAL_FLAG = 'modalPortalFlag'
export const TYPE_PORTAL_EXIT = 'modalPortalExit'
export const TYPE_SHARE_V2_SHARE = 'ShareV2Share'
export const TYPE_CONFIRM_PLAN = 'ConfirmPlan'
export const TYPE_ROW_VIEW_ALL = 'RowViewAll'
export const TYPE_LOGIN = 'GlobalLoginModal'
export const TYPE_CONFIRM = 'ModalConfirm'
export const TYPE_SHARE = 'Share'
export const TYPE_USER_PLAYLIST_ADD = 'PlaylistsAdd'
export const TYPE_USER_PLAYLIST_DELETE = 'PlaylistsDelete'
export const TYPE_USER_PLAYLIST_RENAME = 'PlaylistsRename'


let cache = {}

export function setProps (name, props) {
  set(cache, name, props)
}

export function clearProps (name) {
  if (name) unset(cache, 'name')
  else cache = {}
}

export function getProps (name) {
  return get(cache, name, {})
}
