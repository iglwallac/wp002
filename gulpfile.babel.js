import gulp from 'gulp'
import babel from 'gulp-babel'
import revertPath from 'gulp-revert-path'
import imagemin from 'gulp-imagemin'
import plumber from 'gulp-plumber'
import gutil from 'gulp-util'
import sourcemaps from 'gulp-sourcemaps'
import del from 'del'
import through2 from 'through2'
import _map from 'lodash/map'
import _replace from 'lodash/replace'
import { publishSourcemap } from '@newrelic/publish-sourcemap'
import imageminJpegRecompress from 'imagemin-jpeg-recompress'
import {
  postTranslations,
  deleteLocalTranslations,
  getTranslationsBulk,
} from './lib/services/translation/gulp-tasks'

const BUILD_PATH = 'dist'
const LIB_PATH = 'lib'
const BUILD_PATH_SERVER_LIB = `${BUILD_PATH}/server/lib`
const BUILD_PATH_SERVER_ROOT = `${BUILD_PATH}/server`
const BUILD_PATH_BROWSER_ROOT = `${BUILD_PATH}/browser`
const UNIT_TEST_PATH_PATTERN = `${LIB_PATH}/**/*.unit.js`
const VERSION = process.env.VERSION
const PATH_ASSETS = process.env.PATH_ASSETS
const SERVER_ASSET = process.env.SERVER_ASSET
const NR_ADMIN_API_KEY = process.env.NR_ADMIN_API_KEY

function cleanDist () {
  return del([BUILD_PATH])
}

function buildBabelServerLib () {
  return gulp
    .src([
      `!${UNIT_TEST_PATH_PATTERN}`,
      `${LIB_PATH}/**/*.js`,
      `${LIB_PATH}/**/*.jsx`,
    ])
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(revertPath())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(BUILD_PATH_SERVER_LIB))
}

function buildBabelServerRoot () {
  return gulp
    .src([
      'browser.js',
      'server.js',
      'newrelic.js',
    ])
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(revertPath())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(BUILD_PATH_SERVER_ROOT))
}

function images (done) {
  const extensions = ['png', 'svg', 'gif', 'jpg', 'jpeg']
  gulp
    .src(_map(extensions, ext => `${LIB_PATH}/**/*.${ext}`))
    .pipe(plumber())
    .pipe(
      imagemin([
        imagemin.gifsicle(),
        imagemin.optipng(),
        imagemin.svgo(),
        imageminJpegRecompress({
          min: 50,
          max: 70,
          quality: 'high',
        }),
      ]),
    )
    .pipe(plumber.stop())
    .pipe(gulp.dest(LIB_PATH))
    .on('end', done)
    .on('error', done)
}

function i18nGetTranslationsBulk (done) {
  getTranslationsBulk({ log: gutil.log }, done)
}

function i18nPostTranslations (done) {
  postTranslations({ log: gutil.log }, done)
}

/**
 * Publish javascript source maps in NewRelic to allow
 * debugging of minified javascript
 */
function publishSourcemapsToNewRelic () {
  if (!SERVER_ASSET) {
    throw new Error('The environment variable SERVER_ASSET is required')
  }
  if (!VERSION) {
    throw new Error('The environment variable VERSION is required')
  }
  if (!PATH_ASSETS) {
    throw new Error('The environment variable PATH_ASSETS is required')
  }
  if (!NR_ADMIN_API_KEY) {
    throw new Error('The environment variable NR_ADMIN_API_KEY is required')
  }
  return gulp
    .src([`./${BUILD_PATH_BROWSER_ROOT}/**/*.js.map`])
    .pipe(through2.obj(async (file, _, cb) => {
      const filename = _replace(_replace(file.path, file.base, ''), /^\//, '')
      const serverAsset = _replace(SERVER_ASSET, /\/$/, '')
      const assetsPath = _replace(_replace(PATH_ASSETS, /^\//, ''), /\/$/, '')
      // Jenkins usage SERVER_ASSET=https://www.gaia.com/ PATH_ASSETS=assets/ npm run publish-sourcemaps-to-newrelic
      const javascriptUrl = `${serverAsset}/${assetsPath}/${VERSION}/${_replace(filename, /\.map$/, '')}`
      /* eslint-disable no-console */
      console.log(`Publishing source map: ${filename} for url: ${javascriptUrl}`)
      publishSourcemap({
        sourcemapPath: file.path,
        javascriptUrl,
        applicationId: 17067920,
        nrAdminKey: `${NR_ADMIN_API_KEY}`,
      }, (e) => {
        if (e) {
          /* eslint-disable no-console */
          console.error(e)
        }
        // don't fail on error
        cb(null, file)
      })
    }))
}

gulp.task('clean-dist', cleanDist)
gulp.task('build-babel-server-root', buildBabelServerRoot)
gulp.task('build-babel-server-lib', buildBabelServerLib)
gulp.task('default', gulp.series('clean-dist', 'build-babel-server-root', 'build-babel-server-lib'))
gulp.task('images', images)
gulp.task('i18n-postTranslations', i18nPostTranslations)
gulp.task('i18n-getTranslations', i18nGetTranslationsBulk)
gulp.task('i18n-deleteLocalTranslations', deleteLocalTranslations)
gulp.task('publish-sourcemaps-to-newrelic', publishSourcemapsToNewRelic)

export default gulp
