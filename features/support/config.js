const SAUCE_LABS_USERNAME = 'gaiamtesting'
const SAUCE_LABS_ACCESSKEY = '09660d563'
const CONFIG = {
  timeout: 180000,
  protocol: 'https://',
  webAppStagingUrl: 'www-stg-4b2c19.gaia.com',
  webAppQAUrl: 'webapp-design-4b2c19.gaia.com',
  webAppProdUrl: 'www.gaia.com',
  visitor: {
    username: 'peon',
    password: 'peon'
  },
  saucelabs: {
    username: SAUCE_LABS_USERNAME,
    accessKey: SAUCE_LABS_ACCESSKEY,
    urls: {
      local: `http://${SAUCE_LABS_USERNAME}:${SAUCE_LABS_ACCESSKEY}@localhost:4445/wd/hub`,
      saucelabs: `http://${SAUCE_LABS_USERNAME}:${SAUCE_LABS_ACCESSKEY}@ondemand.saucelabs.com:80/wd/hub`
    }
  },
  capabilities: {

    // Browser configuration
    browserName: 'chrome', // 'chrome', 'safari', 'firefox', 'MicrosoftEdge', 'internet explorer'
    platform: 'macOS 10.15', // 'macOS 10.14', 'windows 10'
    version: '90.0', // '78.0', '13.0.3', '70.0.1', '18.18362'
    screenResolution: '1920x1440', // '800x600', '1024x768', '1280x960'

    // browserName: 'safari', // 'chrome', 'safari', 'firefox', 'MicrosoftEdge', 'internet explorer'
    // platform: 'macOS 10.14', // 'macOS 10.14', 'windows 10'
    // version: '13.1.1', // '78.0', '13.0.5', '70.0.1', '18.18362'
    // screenResolution: '1920x1440', // '800x600', '1024x768', '1280x960'

    // live javascript console logging in Sauce
    extendedDebugging: true,

    // disableNotifications: true,
    // disableInfoBars: true,
    // disablePopupBlocking: true,

    // Alerts
    autoAcceptAlerts: true,

    // Avoiding the Selenium Proxy
    // By default, Sauce routes traffic from some WebDriver browsers (Internet Explorer and Safari) through the Selenium HTTP proxy server so that HTTPS connections with self-signed certificates work everywhere. The Selenium proxy server can cause problems for some users. If that's the case for you, you can configure Sauce to avoid using the proxy server and have browsers communicate directly with your servers.
    avoidProxy: true,

    // Maximum Test Duration
    //: a safety measure to prevent tests from running indefinitely, Sauce limits the duration of tests to 30 minutes by default. You can adjust this limit on per-job basis and the maximum value is 10800 seconds.
    // WARNING: A test should never be more than 30 minutes and ideally should be less than five minutes long. The 3 hour maximum exists mainly to ease the transition of new users migrating long running tests to Sauce Labs.
    maxDuration: 600, // in seconds, default is 1800 (30 min)

    // Command Timeout
    //: a safety measure to prevent Selenium crashes from making your tests run indefinitely, Sauce limits how long Selenium can take to run a command in our browsers. This is set to 300 seconds by default. The value of this setting is given in seconds. The maximum command timeout value allowed is 600 seconds.
    commandTimeout: 180, // in seconds, 300 is default

    // Idle Test Timeout
    //: a safety measure to prevent tests from running too long after something has gone wrong, Sauce limits how long a browser can wait for a test to send a new command. This is set to 90 seconds by default and limited to a maximum value of 1000 seconds. You can adjust this limit on a per-job basis. The value of this setting is given in seconds.
    idleTimeout: 60, // in seconds, 90 is default

    // Disable video recording
    // By default, Sauce records a video of every test you run. This is generally handy for debugging failing tests,: well: having a visual confirmation that certain feature works (or still works!) However, there is an added wait time for screen recording during a test run.
    recordVideo: false,

    // Disable video upload for passing tests
    //: an alternative to disabling video recording, the videoUploadOnPass setting will let you discard videos for passing tests identified using the passed setting. This disables video post-processing and uploading that may otherwise consume some extra time after your test is complete.
    videoUploadOnPass: false,

    // Disable step-by-step screenshots
    // Sauce captures step-by-step screenshots of every test you run. Most users find it very useful to get a quick overview of what happened without having to watch the complete video. However, this feature may add some extra time to your tests. You can avoid this by optionally turning off this feature.
    recordScreenshots: false,

    // Disable log recording
    // By default, Sauce creates a log of all the actions that you execute to create a report for the test run that lets you troubleshoot test failures more easily.
    recordLogs: false,

    // Enable HTML source capture
    // In the same way Sauce captures step-by-step screenshots, we can capture the HTML source at each step of a test. This feature is disabled by default, but you can turn it on any time and find the HTML source captures on your job result page.
    captureHtml: true,

    // Enable WebDriver's automatic screen shots
    // Selenium WebDriver captures automatic screenshots for every server side failure, for example if an element is not found. Sauce disables this by default to reduce network traffic during tests, resulting in a considerable performance improvement in most tests. You can enable this feature, but keep in mind that it may be detrimental to the performance of your jobs.
    webdriverRemoteQuietExceptions: false
  }
}

export function get () {
  return CONFIG
}
