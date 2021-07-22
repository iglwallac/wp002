import { setDefaultTimeout } from 'cucumber'
import webdriver from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome'
import { get as getConfig } from '../support/config'

let driver
const config = getConfig()

if( process.env.TIMEOUT ) {
  setDefaultTimeout(process.env.TIMEOUT)
} else {
  setDefaultTimeout(getConfig().timeout)
}

export async function getDriver () {
  if (!driver) {
    await initDriver()
  }
  return driver
}

export async function quitDriver () {
  if (driver) {
    await driver.quit()
    driver = undefined
  }
}

async function initDriver () {
  if (process.env.USE_SAUCE === 'true') {
    driver = await getDriverRemote()
    return
  }
  driver = await getDriverLocalWithConfig()
}

async function getDriverLocal () {
  return new webdriver.Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options())
    .build()
}

async function getDriverLocalWithConfig () {
  let options = new chrome.Options()
  options.addArguments('disable-infobars')
  options.addArguments('disable-notifications')
  options.addArguments('disable-popup-blocking')
  const driver = new webdriver.Builder()
    .setChromeOptions(options)
    .forBrowser(config.capabilities.browserName)
    .withCapabilities({
      browserName: config.capabilities.browserName,
      platform: config.capabilities.platform,
      version: config.capabilities.version,
      screenResolution: config.capabilities.screenResolution
    })
    .build()

  //driver.manage().window().setRect({width: 1920, height: 980, x: 0, y: 0})

  return driver
}

async function getDriverRemote () {
  const driver = new webdriver.Builder()
    .forBrowser(config.capabilities.browserName)
    .withCapabilities({
      browserName: config.capabilities.browserName,
      platform: config.capabilities.platform,
      version: config.capabilities.version,
      username: config.saucelabs.username,
      accessKey: config.saucelabs.accessKey,
      screenResolution: config.capabilities.screenResolution
    })
    .usingServer(`http://${config.saucelabs.username}:${config.saucelabs.accessKey}@ondemand.saucelabs.com:80/wd/hub`)
    .build()

  return driver
}
