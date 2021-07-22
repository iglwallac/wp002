import _assign from 'lodash/assign'
import _cloneDeep from 'lodash/cloneDeep'
import { get as getConfig } from 'config'

const { appLang: LANG, appLocale: LOCALE, siteName: SITE_NAME } = getConfig()
const SCHEMA = {
  title: 'Streaming Films, Original Interviews, Yoga &amp; Fitness',
  description: '',
  noFollow: false,
  noIndex: false,
  lang: LANG,
  locale: LOCALE,
  ogTitle: '',
  ogImage: '',
  ogType: '',
  ogUrl: '',
  ogDescription: '',
  ogSiteName: SITE_NAME,
  canonical: null,
  prev: null,
  next: null,
  acceptLanguage: null,
  pathLanguageRegion: null,
}

// eslint-disable-next-line import/prefer-default-export
export function createModel (page) {
  return _assign(_cloneDeep(SCHEMA), page)
}

export function getPageTitle (page) {
  return `${page.get('title')} | Gaia`
}

export const SEO_ALLOWED_INDEX_QUERY_PARAMS = [
  'page',
  'filter-set',
  'duration',
  'level',
  'specialty',
  'style',
  'teacher',
  'speciality',
  'subject', // film-subject
  'type', // film-type and recipe-type
  'diet', // recipe-diet
  'collections',
  'collection',
  'host',
  'topic',
  'feature_guest',
  'sort',
  'fullplayer',
  'season',
]
