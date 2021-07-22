import request from 'superagent'
import { glob } from 'multi-glob'
import del from 'del'
import { map as mapPromise, promisify, fromCallback } from 'bluebird'
import _map from 'lodash/map'
import _replace from 'lodash/replace'
import { readFile, writeFile } from 'fs'
import yargs from 'yargs'

const readFilePromisified = promisify(readFile)
const writeFilePromisified = promisify(writeFile)
const LIB_PATH = 'lib'
const TRANSLATION_URL = 'https://api.smartling.com/'
const PRODUCTION_PROJECT_ID = '207d3a095'
const PRODUCTION_USER_ID = 'lqblslhbkwakxjiyhnmjjumdhumkul'
const PRODUCTION_USER_SECRET = '7vuth0j7fokkmltbd6mmevhrq7Bf)is1mnmi18o9kq3qc0tolmr3gih'
const LANGS = ['es-LA', 'de-DE', 'fr-FR']

const argv = yargs
  .array('files')
  .string('glob')
  .boolean('pseudo')
  .alias('f', 'files')
  .alias('g', 'glob')
  .alias('p', 'pseudo')
  .describe('f', 'Specify a file, or array of files')
  .describe('g', 'Specify a glob path')
  .describe('p', 'Retrieve pseudo translations')
  .example('i18n-postTranslations -f Watch -f VideoPlayerUpNext')
  .example('i18n-postTranslations -g "lib/services/**/"')
  .example('i18n-getTranslations  -f Watch -f VideoPlayerUpNext')
  .example('i18n-getTranslations  -g "lib/services/**/"')
  .example('i18n-getTranslations  -p')
  .help('h').argv

/**
 * Get authorization token from Smartling
 * @returns {String} The authorization token to be used with as a Bearer
 */
async function getAuthorizationToken () {
  const res = await request
    .post(`${TRANSLATION_URL}auth-api/v2/authenticate`)
    .send({
      userIdentifier: PRODUCTION_USER_ID,
      userSecret: PRODUCTION_USER_SECRET,
    })
  return res.body.response.data.accessToken
}

/**
 * Get a list of local files for translation
 * @returns {Array} List of file names with relative path
 */
async function getFilelist () {
  const files = argv.files
  const globPath = argv.glob
  if (files) {
    const libPathFiles = _map(
      files,
      file => `${LIB_PATH}/**/${file}/lang_en.json`,
    )
    return fromCallback(cb => glob(libPathFiles, { strict: true }, cb))
  }
  if (globPath) {
    return fromCallback(cb => glob([`${globPath}/lang_en.json`], { strict: true }, cb))
  }
  return fromCallback(cb => glob([`${LIB_PATH}/**/lang_en.json`], { strict: true }, cb))
}

/**
 * Send files to Smartling for translation.
 * @param {Object} options The options
 * @param {Object} options.log A logger implement using the console api
 * @param {Function} done A callback for gulp
 */
export async function postTranslations (options, done) {
  try {
    // eslint-disable-next-line no-console
    const { log = console.log } = options
    const filelist = await getFilelist()
    const auth = await getAuthorizationToken({ log })
    await mapPromise(filelist, async (file) => {
      log(`Sending ${file} for translation`)
      await request
        .post(`${TRANSLATION_URL}files-api/v2/projects/${PRODUCTION_PROJECT_ID}/file`)
        .type('form')
        .set('Authorization', `Bearer ${auth}`)
        .attach('file', file)
        .field('fileUri', file)
        .field('fileType', 'json')
        .field('authorize', 'true')
    }, { concurrency: 10 })
    done(null, true)
  } catch (e) {
    done(e, null)
  }
}

/**
 * Delete local translation files that are not the default language.
 */
export function deleteLocalTranslations () {
  const delPatterns = LANGS.map(lang => `${LIB_PATH}/**/lang_${lang}.json`)
  return del(delPatterns)
}

/**
 * Get all translations from smartling and write them to the correct location in the project
 * @param {Object} options The options
 * @param {Object} options.log A logger implement using the console api
 * @param {Function} done A callback for gulp
 */
export async function getTranslationsBulk (options = {}, done) {
  try {
    // eslint-disable-next-line no-console
    const { log = console.log } = options
    const filelist = await getFilelist()
    const auth = await getAuthorizationToken({ log })
    await mapPromise(filelist, async (file) => {
      await mapPromise(LANGS, async (lang) => {
        log(`Checking ${lang} translation for ${file}`)
        const res = await request
          .get(`${TRANSLATION_URL}files-api/v2/projects/${PRODUCTION_PROJECT_ID}/locales/${lang}/file`)
          .set('Authorization', `Bearer ${auth}`)
          .query({
            fileUri: file,
            retrievalType: argv.pseudo ? 'pseudo' : 'published',
            includeOriginalStrings: true,
          })
        const fileTranslated = _replace(file, /lang_en\.json$/, `lang_${lang}.json`)
        const fileTranslatedBuffer = await readFilePromisified(fileTranslated)
        const textTranslated = fileTranslatedBuffer.toString()
        if (textTranslated !== res.text) {
          log(`Writing ${lang} translation for ${file} to ${fileTranslated}`)
          await writeFilePromisified(fileTranslated, res.text)
        }
      })
    }, { concurrency: 10 })
    done(null, true)
  } catch (e) {
    done(e, null)
  }
}
