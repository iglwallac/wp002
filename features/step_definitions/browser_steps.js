import fs from 'fs'
import { delay as bluebirdDelay } from 'bluebird'
import seleniumWebdriver, { By } from 'selenium-webdriver'
import { Before, Given, When, Then }  from 'cucumber'
import { get as getConfig } from '../support/config'
import { getDriver } from '../support/world'
import {
  doAuthPost,
  doAuthLoginFormPost,
} from '../support/request'

const { performance } = require('perf_hooks')
const beginnerYogaFilterName = "Beginner-1"

const UI_ELEMENTS = {
  interstitial: By.xpath("//div[@class='interstitial']"),
  activePlanCheckoutButton: By.css(".plan-grid-preselect__button--active"),
  areasOfInterestTile2Yes: By.xpath("//div[@class='get-started-select-tile'][2]//span[contains(@class,'yes-icon')]"),
  beginnerYogaHeader: By.xpath(`//h1[.='${beginnerYogaFilterName}']`),
  beginnerYogaMenuItem: By.xpath(`//li[contains(@class,'yoga-option')]/a[.='${beginnerYogaFilterName}']`),
  billingiFrame: By.css("#z_hppm_iframe"),
  cardholderNameInput: By.name("field_creditCardHolderName"),
  cardNumberInput: By.name("field_creditCardNumber"),
  cartPlansSummary: By.xpath("//strong[contains(@class,'cart-plans-summary__heading')]"),
  checkoutChoosePlanButton: By.css(".plan-grid-v2__plan-btn:first-of-type"),
  checkoutPlanButton: By.css(".plan-grid-v2__button"),
  chooseCountryUnitedStatesOption: By.css("#input-creditCardCountry>option[value=\'USA\']"),
  continueButton: By.css("a.button.button--primary.get-started-footer__buttons--right"),
  continueButtonXpath: By.xpath("//a[.='Continue']"),
  continueToPaymentInfoButton: By.xpath("//button[.='Continue To Payment Info'][not(@disabled)]"),
  creditCardButton: By.css(".cart-choose-payment__container"),
  createYourAccountContinueButton: By.css(".form-button--primary"),
  cvvInput: By.name("field_cardSecurityCode"),
  emailInput: By.name("email"),
  expirationMonthOption: By.css("#input-creditCardExpirationMonth>option[value=\'07\']"),
  expirationYearOption: By.css("#input-creditCardExpirationYear>option[value=\'2024\']"),
  firstNameInput: By.name("firstName"),
  firstVideoInTrendingRowPlayButton: By.xpath("//div[@data-rowlabel][contains(.,'Trending')]//article[1]/div/div/div/div/div/a/div/div/span/span"),
  firstMemberHomeVideoPlayButton: By.css("a.tile-hover-video__play-link"),
  getStartedButton: By.xpath("//a[.='Get Started']"),
  jumbotronIndicator: By.xpath("//article[@class='member-home']//div[contains(@class,'spotlight-banner')]"),
  lastNameInput: By.name("lastName"),
  letsGoButton: By.css(".onboarding__button"),
  loadMoreButton: By.xpath("//div[@class='load-more']/a"),
  loginButton: By.css("#login_webapp_header"),
  loginSubmitButton: By.xpath("//button[.='Log In']"),
  memberHomeNavMenuItem: By.xpath("//a[.='Home']"),
  metaphysicsInput: By.xpath("//p[.='Metaphysics']"),
  passwordInput: By.name("password"),
  paypalButton: By.css(".cart-paypal__button"),
  paypalEmail: By.css(".cart-billing__paypal-email"),
  paypalLogo: By.css(".cart-choose-payment__paypal-logo"),
  onboardingTopicButton: By.xpath("//button[.='Metaphysics']"),
  onboardingNext: By.css(".onboarding-topics__button"),
  postalCodeInput: By.name("field_creditCardPostalCode"),
  proceedWithSandboxPurchaseButton: By.css("#return_url"),
  recommendedRowIndicator: By.xpath("//div[@class='section-recommended-content__wrapper']"),
  seePlansButton: By.css(".cart-choose-plan__continue-button"),
  seventeenthVideoPlayButton: By.xpath("//article[17]//span[contains(@class,'tile-hero__play-icon')]"),
  signUpButton: By.css("#signup_webapp_header"),
  startMembershipButton: By.css(".button.button--primary.zuora-credit-card__submit"),
  startMembershipPaypalButton: By.xpath("//a[.='Start Membership']"),
  startTrialPopUpCloseButton: By.xpath("//div[@class='layer blocks layer-popup'][@style='display: block;']//div[contains(@class,'right')]/i[@class='fa fa-times fa-2x exit-icon']"),
  startWatchingNowButton: By.css(".onboarding__final--button"),
  styleDropDownMenu: By.xpath("//label[.='Style']/following-sibling::div"),
  styleDropDownMenuOpen: By.xpath("//label[.='Style']/following-sibling::div[contains(@class,'open')]//input"),
  submitPaymentButton: By.xpath("//button[.='Submit Payment'][not(@disabled)]"),
  termsOfUseInput: By.name("terms"),
  topVideosForYouPlayButton: By.xpath("//span[@class='icon icon--play-fill icon--white spotlight-banner__play-icon']"),
  usernameInput: By.name("username"),
  userProfileButton: By.css(".wiw__avatar"),
  videoPlayingIndicator: By.css(".vjs-playing"),
  watchSeriesFilmsAndDocsButton: By.xpath("//div[.='Watch Series, Films & Docs']"),
  yogaAllPracticesMenuItem: By.xpath("//a[@data-href='/yoga/practices']"),
  yogaNavMenuItem: By.xpath("//a[@data-href='/yoga']"),
  yogaStyleFilterToggle: By.xpath("//a[.='Level']"),
}

let driver

function getProtocol () {
  return getConfig().protocol
}

function getDomainName () {
  let domain

  if (process.env.TEST_URL) {
    domain = process.env.TEST_URL
  } else if (process.env.TEST_ENV === 'qa') {
    domain = getConfig().webAppQAUrl
  } else if (process.env.TEST_ENV === 'prod') {
    domain = getConfig().webAppProdUrl
  } else {
    domain = getConfig().webAppStagingUrl
  }

  return domain
}

function getUrl () {
  return getProtocol() + getDomainName()
}

Before(async (testCase) => {
  let store = {}
  store.testCase = testCase
  driver = await getDriver()
  console.log(`Running scenario: ${store.testCase.pickle.name}...`)
  if (process.env.USE_SAUCE === 'true') {
    await driver.executeScript(`sauce:job-name=${store.testCase.pickle.name}`)
  }
})

Given('I am on the Gaia web app', () => {
  let url = `${getUrl()}`
  // disable experiments
  url = `${url}?testarossa_enabled=false&optimizelyDisabled=true`
  return driver.get(`${url}`)
})

Given('I am on the Gaia yoga page', () => {
  let url = `${getUrl()}`
  // disable experiments
  url = `${url}/yoga?testarossa_enabled=false&optimizelyDisabled=true`
  return driver.get(`${url}`)
})

When('I choose <Sign Up>', async () => {
  const element = await driver.findElement(By.xpath("//a[.='Sign Up']"))
  await element.click()
})

When('I login as username {string} with password {string}', async (username, password) => {

  // if the 99 cent trial window opens, close it
  // const found = await driver.findElements(UI_ELEMENTS.startTrialPopUpCloseButton)
  const found = await driver.findElements(By.xpath("//span[@class='icon icon--close popup-marketing-promo__close-icon icon--action']"))
  if (!!found.length) {
    console.log("99 cent trial popup detected. Closing . . .")
    await driver.sleep(1000)
    await driver.findElement(UI_ELEMENTS.startTrialPopUpCloseButton).click()
    await driver.sleep(1000)
  }

  username = username.replace(new RegExp("\"", "g"), "")
  password = password.replace(new RegExp("\"", "g"), "")
  await driver.sleep(2000)
  await driver.findElement(UI_ELEMENTS.loginButton).click()
  console.log('Waiting for username field to display . . .')
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.usernameInput), getConfig().timeout)
  await driver.findElement(UI_ELEMENTS.usernameInput).sendKeys(username)
  await driver.findElement(UI_ELEMENTS.passwordInput).sendKeys(password)
  await driver.findElement(UI_ELEMENTS.loginSubmitButton).click()
  await siteHasInitialized()
})

When('I login from yoga home as username {string} with password {string}', async (username, password) => {

  // if the 99 cent trial window opens, close it
  // const found = await driver.findElements(UI_ELEMENTS.startTrialPopUpCloseButton)
  const found = await driver.findElements(By.xpath("//span[@class='icon icon--close popup-marketing-promo__close-icon icon--action']"))
  if (!!found.length) {
    console.log("99 cent trial popup detected. Closing . . .")
    await driver.sleep(1000)
    await driver.findElement(By.xpath("//span[@class='icon icon--close popup-marketing-promo__close-icon icon--action']")).click()
    await driver.sleep(1000)
  }

  username = username.replace(new RegExp("\"", "g"), "")
  password = password.replace(new RegExp("\"", "g"), "")
  //// give the page a chance to load (local mostly)
  await driver.sleep(2000)
  // now try to find the elemen with the bound click event...
  await driver.findElement(By.xpath("//a[.='Log In']")).click()
  console.log('Waiting for username field to display . . .')
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.usernameInput), getConfig().timeout)
  await driver.findElement(UI_ELEMENTS.usernameInput).sendKeys(username)
  await driver.findElement(UI_ELEMENTS.passwordInput).sendKeys(password)
  await driver.findElement(UI_ELEMENTS.loginSubmitButton).click()
  await siteHasInitialized()
})

async function siteHasInitialized (attempt = 1) {
  // get the interstitial...
  console.log('Finding interstitial screen element...')
  const interstitial = await getInterstitial()
  // we are not on the webapp yet (still on the marketing layer)
  if (!interstitial) {
    console.log('No interstitial element exists, retry in 2 seconds...')
    await bluebirdDelay(2000)
    return siteHasInitialized(attempt)
  }
  // get the display value
  const isDisplayed = await interstitial.isDisplayed()

  if (!isDisplayed) {
    console.log('Interstitial element has been removed...')
    return true
  }
  // if we've tried more than 5 times, give up...
  if (attempt > 5) {
    console.log('Too many attempts to find interstitial element, exit...')
    throw new Error('Site failed to initialize properly.')
  }
  // wait 2 seconds and try again...
  console.log('Interstitial element is still visible...')
  await bluebirdDelay(2000)
  return siteHasInitialized(attempt + 1)
}

async function getInterstitial () {
  try {
    const interstitial = await driver.findElement(UI_ELEMENTS.interstitial)
    return interstitial
  } catch (e) {
    return null
  }
}

async function signup () {

  // generate randomized username
  const rand = Math.floor(Math.random() * 100000000)
  const rand2 = Math.floor(Math.random() * 100000000)
  const userKey = `__test__${rand}__${rand2}`

  let url = ''
  if (process.env.TEST_URL) {
    url = process.env.TEST_URL
  } else if (process.env.TEST_ENV === 'qa') {
    url = getConfig().protocol + getConfig().webAppQAUrl
  } else {
    url = getConfig().protocol + getConfig().webAppStagingUrl
  }
  // go directly to plan selection page bypassing marketing layer; disable experiments
  url = `${url}/plan-selection?testarossa_enabled=false&optimizelyDisabled=true`
  driver.get(`${url}`)

  console.log('Waiting for <See Plans> button to display . . .')
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.seePlansButton), getConfig().timeout)
  await driver.findElement(UI_ELEMENTS.seePlansButton).click()
  console.log('Waiting for plan <Checkout> button . . .')
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.checkoutChoosePlanButton), getConfig().timeout)
  await driver.findElement(UI_ELEMENTS.checkoutChoosePlanButton).click()
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.checkoutPlanButton), getConfig().timeout)
  await driver.findElement(UI_ELEMENTS.checkoutPlanButton).click()
  console.log('Waiting for "Create your account" continue button to display . . .')
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.continueButtonXpath), getConfig().timeout)
  await driver.findElement(UI_ELEMENTS.continueButtonXpath).click()
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.firstNameInput), getConfig().timeout)
  await driver.findElement(UI_ELEMENTS.firstNameInput).sendKeys("Joe")
  await driver.findElement(UI_ELEMENTS.lastNameInput).sendKeys("Normie")
  console.log(`Creating user email ${userKey}@example.com . . .`)
  await driver.findElement(UI_ELEMENTS.emailInput).sendKeys(`${userKey}@example.com`)
  await driver.findElement(UI_ELEMENTS.passwordInput).sendKeys("Passw0rd")
  await driver.findElement(UI_ELEMENTS.termsOfUseInput).click()
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.createYourAccountContinueButton), getConfig().timeout)
  console.log('Waiting for <Continue> button to enable . . .')
  await driver.findElement(UI_ELEMENTS.createYourAccountContinueButton).click()
}

async function ccBilling (ccType) {
  await driver.sleep(1000)
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.creditCardButton), getConfig().timeout)
  await driver.findElement(UI_ELEMENTS.creditCardButton).click()
  console.log('Waiting for Billing iFrame . . .')
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.billingiFrame), getConfig().timeout)
  await driver.sleep(500)
  const cartBillingForm = await driver.findElement(UI_ELEMENTS.billingiFrame)
  await driver.switchTo().frame(cartBillingForm)
  console.log('Waiting for cardholder name input field . . .')
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.cardholderNameInput), getConfig().timeout)
  console.log('Waiting for payment form to display . . .')
  await driver.sleep(100)
  await driver.findElement(UI_ELEMENTS.cardholderNameInput).sendKeys("Joe Q Normie")
  if( ccType === "VISA" ) {
    await driver.findElement(UI_ELEMENTS.cardNumberInput).sendKeys("4485393670934814")
  } else if( ccType === "AMEX" ) {
    await driver.findElement(UI_ELEMENTS.cardNumberInput).sendKeys("346351477541833")
  } else if( ccType === "CHASE" ) {
    await driver.findElement(UI_ELEMENTS.cardNumberInput).sendKeys("4833133333333320")
  }
  await driver.findElement(UI_ELEMENTS.expirationMonthOption).click()
  await driver.findElement(UI_ELEMENTS.expirationYearOption).click()
  if( ccType === "VISA" ) {
    await driver.findElement(UI_ELEMENTS.cvvInput).sendKeys("123")
  } else if( ccType === "AMEX" ) {
    await driver.findElement(UI_ELEMENTS.cvvInput).sendKeys("1234")
  } else if( ccType === "CHASE" ) {
    await driver.findElement(UI_ELEMENTS.cvvInput).sendKeys("023")
  }
  console.log('Waiting for choose country menu to display button . . .')
  await driver.sleep(500)
  await driver.findElement(UI_ELEMENTS.chooseCountryUnitedStatesOption).click()
  await driver.sleep(500)
  await driver.findElement(UI_ELEMENTS.postalCodeInput).sendKeys("80027")
  console.log('Waiting for <Start Membership> button to enable . . .')
  await driver.switchTo().parentFrame()
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.startMembershipButton), getConfig().timeout)
  await driver.sleep(500)
  await driver.findElement(UI_ELEMENTS.startMembershipButton).click()
}

async function paypalBilling () {
  await driver.sleep(1000)
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.paypalLogo), getConfig().timeout)
  await driver.findElement(UI_ELEMENTS.paypalLogo).click()
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.paypalButton), getConfig().timeout)
  await driver.findElement(UI_ELEMENTS.paypalButton).click()
  await driver.sleep(3000)
  let allHandles = await driver.getAllWindowHandles()
  await driver.switchTo().window(allHandles[allHandles.length - 1])
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.proceedWithSandboxPurchaseButton), getConfig().timeout)
  await driver.sleep(1000)
  await driver.findElement(UI_ELEMENTS.proceedWithSandboxPurchaseButton).click()
  allHandles = await driver.getAllWindowHandles()
  await driver.switchTo().window(allHandles[allHandles.length - 1])
  console.log('Waiting for <Start Membership> button to enable . . .')
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.startMembershipPaypalButton), getConfig().timeout)
  await driver.sleep(500)
  await driver.findElement(UI_ELEMENTS.startMembershipPaypalButton).click()
  await driver.switchTo().defaultContent()
}

async function onBoarding() {
  console.log('Waiting for <Get Started> button to display . . .')
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.getStartedButton), getConfig().timeout)
  await driver.sleep(6000)
  await driver.findElement(UI_ELEMENTS.getStartedButton).click()
  console.log('Waiting for <Lets Go> button to display . . .')
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.letsGoButton), getConfig().timeout)
  await driver.sleep(2000)
  await driver.findElement(UI_ELEMENTS.letsGoButton).click()
  console.log('Waiting for <Onboarding topics> button to display . . .')
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.onboardingTopicButton), getConfig().timeout)
  await driver.findElement(UI_ELEMENTS.onboardingTopicButton).click()
  await driver.sleep(600)
  console.log('Waiting for <Onboarding Next> button to display . . .')
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.onboardingNext), getConfig().timeout)
  await driver.findElement(UI_ELEMENTS.onboardingNext).click()
  console.log('Waiting for <Onboarding Skip> button to display . . .')
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.startWatchingNowButton), getConfig().timeout)
  await driver.sleep(10000)
  await driver.findElement(UI_ELEMENTS.startWatchingNowButton).click()
  console.log('Waiting for the first video\'s play button to display . . .')
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.firstMemberHomeVideoPlayButton), getConfig().timeout)
}

When('I sign up with VISA', async () => {
  await signup()
  await ccBilling('VISA')
  await onBoarding()
})

When('I sign up with AMEX', async () => {
  await signup()
  await ccBilling('AMEX')
  await onBoarding()
})

When('I sign up with PayPal', async () => {
  await signup()
  await paypalBilling()
  await onBoarding()
})

When('I sign up with CHASE', async () => {
  await signup()
  await ccBilling('CHASE')
  await onBoarding()
})

Then('the jumbotron displays', async () => {
  console.log('Waiting for the jumbotron to display . . .')
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.jumbotronIndicator), getConfig().timeout)
})

When('I scroll down {string} pixels', async (pixels) => {
  console.log(`Scrolling down ${pixels} pixels . . .`)
  await driver.executeScript(`scroll(0, ${pixels})`)
  await driver.sleep(2000)
})

When('I scroll to the bottom of the page', async () => {
  await driver.sleep(10000)
  await driver.findElement(By.xpath('//span[.="Newest First"]')).click()
  await driver.sleep(1000)
  await driver.findElement(By.xpath('//span[.="Newest First"]')).click()
  // await driver.findElement(By.xpath('//span[.="Oldest First"]')).click()
  await driver.sleep(5000)

  console.log(`Scrolling down to the bottom of the page . . .`)
  let last_height = await driver.executeScript("return document.body.scrollHeight")

  let count
  if( process.env.FB_APPROVALS_MODE === 'true') {
    count = 50 // it appears the scroll count is 10 people/page    <---------------------------------- PAGE COUNT
  } else {
    count = 0
  }
  let index = 1
  while (true) {
    index = index + 1
    console.log(`scrolling to page ${index}`)
    await driver.executeScript("window.scrollTo(0, document.body.scrollHeight);")
    await driver.sleep(15000)
    let new_height = await driver.executeScript("return document.body.scrollHeight")
    if (new_height == last_height) {
      break
    }
    if( index > count ) {
      break
    }
    last_height = new_height
  }
  console.log(' . . . scrolling complete.')
  await driver.sleep(5000)
})

async function getUserListItems() {
  await bluebirdDelay(15000)
  let listItems = await driver.findElements(By.xpath('//div[@role="main"]//div[@aria-label="Approve"]'))
  console.log(`list length: ${listItems.length}`)
  return listItems
}

async function scrapeUIUserData(userListItems) {
  let fbUserArray = []
  for (var i = 0; i < userListItems.length; i++) {
    console.log(`${i+1}/${userListItems.length} Collecting codeword, username, and email info.`)
    var userSection = `//div[@role="main"]//div[${i+1}]/div/div`
    var userName = await driver.findElement(By.xpath(`${userSection}//div/div//span`)).getText()
    var approveButton = await driver.findElement(By.xpath(`${userSection}//div[@aria-label="Approve"]`))
    var declineButton = await driver.findElement(By.xpath(`${userSection}//div[@aria-label="Decline"]`))
    var fbUserObject = {}
    fbUserObject[ "userName" ] = userName
    fbUserObject[ "codeWord" ] = ''
    fbUserObject[ "email" ] = ''
    fbUserObject[ "username" ] = ''
    fbUserObject[ "didntRespond" ] = false
    fbUserObject[ "approveButton" ] = approveButton
    fbUserObject[ "declineButton" ] = declineButton
    // console.log(`user name: ${user}`)

    // collect codeword data from the UI
    let codeWordElements = await driver.findElements(By.xpath(`${userSection}//span[.="What is the Code word from your welcome email?"]/following-sibling::div/span`))
    if (codeWordElements[ 0 ]) {
      fbUserObject[ "codeWord" ] = await codeWordElements[ 0 ].getText()
      // console.log(`codeWordElement: ${await codeWordElements[ 0 ].getText()}`)
    }

    // collect username and email data from the UI
    let usernameAndEmailElements = await driver.findElements(By.xpath(`${userSection}//span[.="If you do not have the Code word, can you give us your Gaia app username, Gaia email, or some other piece of information to verify that you are a current Gaia subscriber?"]/following-sibling::div/span`))
    if (usernameAndEmailElements[ 0 ]) {
      fbUserObject[ "email" ] = await usernameAndEmailElements[ 0 ].getText()
    }

    // Did they not answer the questions yet?
    let didntRespond = await driver.findElements(By.xpath(`${userSection}[contains(.,"Hasn't answered membership questions")]`))
    if (didntRespond[ 0 ]) {
      console.log(`${i+1}/${userListItems.length} User ${userName} did not respond to the questions.`)
      fbUserObject[ "didntRespond" ] = true
    }

    fbUserArray.push(fbUserObject)
  }
  return fbUserArray
}

async function stripAndRemoveCharacters(field) {
  if (field.length > 3) {
    var stripArray = ['.', ',', ';', ':', '?', '!', '“']
    if (stripArray.includes(field.charAt(field.length - 1))) {
      field = field.slice(0, -1)
    }
    if(stripArray.includes(field.charAt(0))) {
      field = field.slice(1, field.length)
    }
    field = field.replace('"', '')
    field = field.replace("'", '')
    field = field.replace('“', '')
  }
  return field
}

function alreadyApprovedOrDeclined(fbUser, approvals, denials) {
  for(var a = 0; a < approvals.length; a++) {
    if( approvals[a].userName == fbUser.userName ) {
      return true
    }
  }
  for(var d = 0; d < denials.length; d++) {
    if( denials[d].userName == fbUser.userName ) {
      return true
    }
  }
  return false
}

let approvals = []
let denials = []
async function determineApprovals(fbUserArray, codeWords) {
  for( var e = 0; e < fbUserArray.length; e++ ) {

    // check for if they didn't respond to the questions
    if (fbUserArray[ e ].didntRespond == true) {

      // only run once per week (on Sundays)
      var date = new Date()
      var day = date.getDay()
      if( day == 2 ) {
        var denialObject = {}
        denialObject[ "userName" ] = fbUserArray[ e ].userName
        denialObject[ "reason" ] = 'Did not respond'
        denialObject[ "declineButton" ] = fbUserArray[ e ].declineButton
        denialObject[ "username" ] = ''
        denialObject[ "email" ] = ''
        if( !alreadyApprovedOrDeclined(fbUserArray[e], approvals, denials) ) {
          denials.push(denialObject)
        }
      }
    } else {

      // initialize array for email and username check against auth service done below the codeword check
      var formFieldsArray = fbUserArray[ e ].email.split(" ")

      // check for code word 'amethyst' and 'kundalini'
      var codewordFieldsArray = fbUserArray[ e ].codeWord.toLowerCase().split(" ")
      for (var c = 0; c < codewordFieldsArray.length; c++) {
        if( !alreadyApprovedOrDeclined(fbUserArray[e], approvals, denials) ) {
          codewordFieldsArray[ c ] = await stripAndRemoveCharacters(codewordFieldsArray[ c ])
          if (codewordFieldsArray[ c ].length > 6 && !codewordFieldsArray[ c ].includes[ '@' ]) {
            console.log(`${e + 1}/${fbUserArray.length} codeword field: ${codewordFieldsArray[ c ]}`)
            if (codeWords.includes(codewordFieldsArray[ c ].toLowerCase())) {
              var approvalObject = {}
              approvalObject[ "userName" ] = fbUserArray[ e ].userName
              approvalObject[ "reason" ] = 'Code word match'
              approvalObject[ "approvalButton" ] = fbUserArray[ e ].approveButton
              approvalObject[ "codeWord" ] = codewordFieldsArray[ c ]
              approvalObject[ "email" ] = fbUserArray[ e ].email
              approvalObject[ "username" ] = fbUserArray[ e ].username
              approvals.push(approvalObject)
            } else {
              formFieldsArray.push(codewordFieldsArray[c])
            }
          } else { // in case they put the email address in the code word field, do the auth lookup below
            formFieldsArray.push(codewordFieldsArray[ c ])
          }
        }
      }

      // email and username check against auth service
      for (var v = 0; v < formFieldsArray.length; v++) {

        var field = formFieldsArray[ v ].trim().toLowerCase()
        field = await stripAndRemoveCharacters(field)
        var payload = {
          keyword: field,
          page: 0,
          perPage: 20
        }

        if (field.length > 3) {
          await driver.sleep(500)
          let response = await doAuthPost('/v1/user/search', payload)
          console.log(`${e + 1}/${fbUserArray.length} email and username field: ${fbUserArray[ e ].email}`)
          const {users} = response.body
          for (var u = 0; u < users.length; u++) {
            if (!alreadyApprovedOrDeclined(fbUserArray[ e ], approvals, denials)) {
              var authUserEmail = users[ u ].email.toLowerCase()
              var authUserShortName = users[ u ].username.toLowerCase()
              // console.log(`comparing ${authUserEmail} to ${field}`)
              var approvalObject = {}
              approvalObject[ "userName" ] = fbUserArray[ e ].userName
              approvalObject[ "codeWord" ] = fbUserArray[ e ].codeWord
              approvalObject[ "approvalButton" ] = fbUserArray[ e ].approveButton
              approvalObject[ "email" ] = authUserEmail
              approvalObject[ "username" ] = authUserShortName
              if (field.includes('@') && authUserEmail == field) {
                approvalObject[ "reason" ] = 'Email match'
                approvals.push(approvalObject)
                break
              } else if (authUserShortName == field) {
                approvalObject[ "reason" ] = 'Username match'
                approvals.push(approvalObject)
                break
              }
            }
          }
        }
      }
    }
  }
  return [approvals, denials]
}

async function approve(approvals) {
  console.log('------------------------------------')
  console.log(`Approving ${approvals.length} members...`)
  console.log('------------------------------------')
  var alreadyApproved = []
  for( var a = 0; a < approvals.length; a++ ) {

    if( !alreadyApproved.includes(approvals[a].userName) ) {
      console.log(`Approving ${a + 1} of ${approvals.length}: ${approvals[ a ].userName}`)
      console.log(`Reason: ${approvals[ a ].reason}`)
      if (approvals[ a ].reason == 'Code word match') {
        console.log(`CodeWord: ${approvals[ a ].codeWord}`)
      }
      if (approvals[ a ].reason == 'Username match') {
        console.log(`Username: ${approvals[ a ].username}`)
      }
      console.log(`Email: ${approvals[ a ].email}`)
      console.log('------------------------------------')
      if (process.env.FB_APPROVALS_MODE === 'true') {
        await driver.executeScript("arguments[0].click();", approvals[ a ].approvalButton) // <---------- APPROVE BUTTON CLICK
        await driver.sleep(2000)
      }
      alreadyApproved.push(approvals[a].userName)
    }
  }
}

async function decline(denials) {
  console.log(`Declining ${denials.length} members...`)
  console.log('------------------------------------')
  var alreadyDeclined = []
  for( var a = 0; a < denials.length; a++ ) {
    if( !alreadyDeclined.includes(denials[a].userName) ) {
      console.log(`Declining ${a + 1} of ${denials.length}: ${denials[ a ].userName}`)
      console.log(`Reason: ${denials[ a ].reason}`)
      console.log('------------------------------------')
      if (process.env.FB_APPROVALS_MODE === 'true') {
        await driver.executeScript("arguments[0].click();", denials[ a ].declineButton) // <---------- DECLINE BUTTON CLICK
        await driver.sleep(2000)
      }
      alreadyDeclined.push(denials[ a ].userName)
    }
  }
}

async function getFormattedDate() {
  var date = new Date()
  var hour = date.getHours()
  var ampm = "am";
  if( hour > 12 ) {
    hour -= 12;
    ampm = "pm";
  }
  var year = date.getFullYear();
  return parseInt(date.getMonth() + 1) + '.' + date.getDate() + '.' + year.toString().substr(-2) + '-' + hour + '.' + (date.getMinutes()<10?'0':'') + date.getMinutes() + ampm
}

const RESULTS_DIR = '/Users/pfoss/Documents/Inner\ Circle/work/'
async function writeApprovalResultsFile(dateString) {
  let fileString = ''
  for( var a = 0; a < approvals.length; a++ ) {
    fileString = fileString + `${approvals[a].userName},${approvals[a].username},${approvals[a].email}\n`
  }
  if( approvals.length > 0 ) {
    if (process.env.FB_APPROVALS_MODE === 'true') {
      fs.writeFileSync(`${RESULTS_DIR}approvals-${dateString}.csv`, fileString, {mode: 0o755})
    } else {
      fs.writeFileSync(`${RESULTS_DIR}TEST-approvals-${dateString}.csv`, fileString, {mode: 0o755})
    }
  }
}

async function writeDeclineResultsFile(dateString) {
  let fileString = ''
  for( var a = 0; a < denials.length; a++ ) {
    fileString = fileString + `${denials[a].userName},${denials[a].username},${denials[a].email}\n`
  }
  if( denials.length > 0 ) {
    if (process.env.FB_APPROVALS_MODE === 'true') {
      fs.writeFileSync(`${RESULTS_DIR}declines-${dateString}.csv`, fileString, {mode: 0o755})
    } else {
      fs.writeFileSync(`${RESULTS_DIR}TEST-declines-${dateString}.csv`, fileString, {mode: 0o755})
    }
  }
}

When('I approve the appropriate requests', async () => {
  var codeWords = [ 'amathyst',
    'amathist',
    'amathest',
    'amathyest',
    'amatista',
    'amerhyst',
    'amerthyst',
    'amesthy',
    'amesthyst',
    'amethist',
    'amethiste',
    'amethest',
    'amethys',
    'amethyse',
    'amethyst',
    'amethyest',
    'amethyste',
    'ameythist',
    'ameythyst',
    'amythst',
    'amythest',
    'amythist',
    'amythst',
    'amythyst',
    'kundalini' ]

  let userListItems = await getUserListItems()

  let fbUserArray = await scrapeUIUserData(userListItems)

  let [approvals, denials] = await determineApprovals(fbUserArray, codeWords)

  await approve(approvals)

  await decline(denials)

  const DATE = await getFormattedDate()
  await writeApprovalResultsFile(DATE)

  await writeDeclineResultsFile(DATE)

  console.log(`Total Users Scanned on ${DATE}: ${fbUserArray.length}`)
  console.log(`  --Approved: ${approvals.length}`)
  console.log(`  --Declined: ${denials.length}`)
  console.log('------------------------------------')
})

Given('I get an auth token', async () => {
  const payload = `username=pfoss&password=auzGzn27_angel`
  const endpoint = '/v1/login'
  console.log(`username/password: pfoss`)
  return doAuthLoginFormPost(endpoint, payload)
})

When('I play the Top video for you', async () => {
  await driver.findElement(UI_ELEMENTS.topVideosForYouPlayButton).click()
})

When('I play the first video in the Trending row', async () => {
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.firstVideoInTrendingRowPlayButton), getConfig().timeout)
  console.log('Waiting for the first video in the Trending row play button to display . . .')
  await driver.findElement(UI_ELEMENTS.firstVideoInTrendingRowPlayButton).click()
})

When('I navigate to member home', async () => {
  console.log('Clicking the Home nav menu item . . .')
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.memberHomeNavMenuItem), getConfig().timeout)
  await driver.sleep(1000)
  await driver.findElement(UI_ELEMENTS.memberHomeNavMenuItem).click()
  driver.sleep(500)
})

When('I navigate to All Yoga Practices', async () => {
  console.log('Clicking the Yoga nav menu item . . .')
  await driver.findElement(UI_ELEMENTS.yogaNavMenuItem).click()
  driver.sleep(500)
  console.log('Clicking the All Yoga Practices nav menu item . . .')
  await driver.findElement(UI_ELEMENTS.yogaAllPracticesMenuItem).click()
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.styleDropDownMenu), getConfig().timeout)
})

When('I filter by Style on Beginner Yoga', async () => {
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.styleDropDownMenu), getConfig().timeout)
  await driver.sleep(1000)
  console.log('Filter by Style . . .')
  await driver.findElement(UI_ELEMENTS.yogaStyleFilterToggle).click()
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.yogaStyleFilterToggle), getConfig().timeout)
  await driver.sleep(1000)
  console.log('Choose Beginner Yoga . . .')
  await driver.findElement(UI_ELEMENTS.beginnerYogaMenuItem).click()
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.beginnerYogaHeader), getConfig().timeout)
})

When('I click the Load More button', async () => {
  console.log('Clicking the Load More button . . .')
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.loadMoreButton), getConfig().timeout)
  await driver.findElement(UI_ELEMENTS.loadMoreButton).click()
})

Then('the Recommended for you row displays', async () => {
  console.log('Waiting for the Recommended row to display . . .')
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.recommendedRowIndicator), getConfig().timeout)
})

When('I play the first video button found', async () => {
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.firstMemberHomeVideoPlayButton), getConfig().timeout)
  console.log('Waiting for the first video play button to display . . .')
  await driver.sleep(500)
  // var ele = driver.findElement(UI_ELEMENTS.firstMemberHomeVideoPlayButton)
  // await driver.actions().move({duration:3000,origin:ele,x:0,y:0}).perform()
  await driver.findElement(UI_ELEMENTS.firstMemberHomeVideoPlayButton).click()
})

When('I click the 17th video\'s play button', async () => {
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.seventeenthVideoPlayButton), getConfig().timeout)
  console.log('Clicking the 17th video\'s play button . . .')
  await driver.findElement(UI_ELEMENTS.seventeenthVideoPlayButton).click()
})

Then('I see {string}', function (text) {
  return driver.wait(seleniumWebdriver.until.elementLocated({ xpath: `//*[contains(text(),'${text}')]` }), getConfig().timeout)
})

Then('the video plays', async () => {
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.videoPlayingIndicator), getConfig().timeout)
  console.log('Video playback confirmed!')
  await driver.sleep(1000)
  if (process.env.USE_SAUCE === 'true') {
    await driver.executeScript(`sauce:job-result=passed`)
  }
})

Then('memberhome displays', async () => {
  console.log('Waiting for the "Recommended for You" row to display . . .')
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.recommendedRowIndicator), getConfig().timeout)
  if (process.env.USE_SAUCE === 'true') {
    await driver.executeScript(`sauce:job-result=passed`)
  }
})


let netflixAnonHomeT0
Given('I am on the Netflix home page', async () => {
  let url = 'http://www.netflix.com'
  netflixAnonHomeT0 = await performance.now()
  return driver.get(`${url}`)
})

When('I login to Netflix as {string} with password {string}', async (username, password) => {
  await driver.manage().window().setRect({width: 1920, height: 1080, x:0, y:0})

  let netflixAnonHomeT1 = performance.now()
  console.log("Anonymous home page: " + (netflixAnonHomeT1 - netflixAnonHomeT0)/1000 + " seconds.")

  await driver.sleep(5000)
  // let allWindowHandles = await driver.getAllWindowHandles()
  // let handle
  // for(handle in allWindowHandles)
  // {
  //   console.log("Window handle - > " + handle)
  // }
  await driver.wait(seleniumWebdriver.until.elementLocated(By.xpath("//a[@href='/login']")), getConfig().timeout)
  await driver.findElement(By.xpath("//a[@href='/login']")).click()
  await driver.findElement(By.css("input#id_userLoginId")).sendKeys(username)
  await driver.findElement(By.css("input#id_password")).sendKeys(password)
  const netflixHomePageT0 = performance.now()
  await driver.findElement(By.xpath("//button[@data-uia='login-submit-button']")).click()

  // first paint
  await driver.wait(seleniumWebdriver.until.elementLocated(By.xpath("//a[@href='/YourAccount']")), getConfig().timeout)
  const netflixHomePageFirstPaintT1 = performance.now()
  console.log("Home page first paint: " + (netflixHomePageFirstPaintT1 - netflixHomePageT0)/1000 + " seconds.")

  // page interactive
  await driver.wait(seleniumWebdriver.until.elementLocated(By.xpath("//a[.='Movies']")), getConfig().timeout)
  const netflixHomePageInteractiveT1 = performance.now()
  console.log("Home page interactive: " + (netflixHomePageInteractiveT1 - netflixHomePageT0)/1000 + " seconds.")

  // page complete
  await driver.wait(seleniumWebdriver.until.elementLocated(By.xpath("//div[@id='row-8']")), getConfig().timeout)
  const netflixHomePageT1 = performance.now()
  console.log("Home page complete: " + (netflixHomePageT1 - netflixHomePageT0)/1000 + " seconds.")

  await driver.sleep(1000)
})

Then('the authenticated Netflix home page loads', async () => {
  await driver.sleep(500)
})

Given('I am on the FB Inner Circle page', async () => {
  return driver.get('https://www.facebook.com/groups/1084054661779042/requests/')
})

Given('I login to FB', async () => {
  await driver.findElement(By.xpath("//input[@id='email']")).sendKeys('powers.foss@gmail.com')
  await driver.findElement(By.xpath("//input[@id='pass']")).sendKeys('auzFFFFFzn27')
  await driver.findElement(By.xpath("//button[@id='loginbutton']")).click()
  // await driver.sleep(1000)
  // let continueButton = await driver.findElements(By.xpath("//button[.='Continue']"))
  // if( continueButton != [] ) {
  //   await continueButton[0].click()
  //   await driver.sleep(1000)
  // }
})

let gaiaAnonHomeT0
Given('I am on the Gaia home page', async () => {
  let url = `${getUrl()}`
  gaiaAnonHomeT0 = await performance.now()
  return driver.get(`${url}`)
})

When('I login to Gaia as {string} with password {string}', async (username, password) => {
  let gaiaAnonHomeT1 = performance.now()
  console.log("Anonymous home page: " + (gaiaAnonHomeT1 - gaiaAnonHomeT0)/1000 + " seconds.")
  await driver.manage().window().setRect({ width: 1920, height: 1080, x:0, y:0 })
  await driver.sleep(1000)

  await driver.findElement(UI_ELEMENTS.loginButton).click()
  await driver.wait(seleniumWebdriver.until.elementLocated(UI_ELEMENTS.usernameInput), getConfig().timeout)
  await driver.findElement(UI_ELEMENTS.usernameInput).sendKeys(username)
  await driver.findElement(UI_ELEMENTS.passwordInput).sendKeys(password)
  const gaiaHomePageT0 = performance.now()
  await driver.findElement(UI_ELEMENTS.loginSubmitButton).click()

  // first paint
  await driver.wait(seleniumWebdriver.until.elementLocated(By.xpath("//a[.='Home']")), getConfig().timeout)
  const gaiaHomePageFirstPaintT1 = performance.now()
  console.log("Home page first paint: " + (gaiaHomePageFirstPaintT1 - gaiaHomePageT0)/1000 + " seconds.")

  // page interactive
  const gaiaHomePageInteractiveT1 = performance.now()
  console.log("Home page interactive: " + (gaiaHomePageInteractiveT1 - gaiaHomePageT0)/1000 + " seconds.")

  // page complete
  await driver.wait(seleniumWebdriver.until.elementLocated(By.xpath("//h2[.='Explore by topic']")), getConfig().timeout)
  const gaiaHomePageT1 = performance.now()
  console.log("Home page complete: " + (gaiaHomePageT1 - gaiaHomePageT0)/1000 + " seconds.")

  await driver.sleep(1000)
})

Then('the authenticated Gaia home page loads', async () => {
  await driver.sleep(500)
})

let huluAnonHomeT0
Given('I am on the Hulu home page', async () => {
  let url = 'http://www.hulu.com'
  huluAnonHomeT0 = await performance.now()
  return driver.get(`${url}`)
})

When('I login to Hulu as {string} with password {string}', async (username, password) => {
  await driver.manage().window().setRect({width: 1920, height: 1080, x:0, y:0})

  let huluAnonHomeT1 = performance.now()
  console.log("Anonymous home page: " + (huluAnonHomeT1 - huluAnonHomeT0)/1000 + " seconds.")

  await driver.sleep(2000)
  await driver.findElement(By.xpath("//button[.='Log In']")).click()
  await driver.wait(seleniumWebdriver.until.elementLocated(By.xpath("//input[@name='email']")), getConfig().timeout)
  await driver.findElement(By.xpath("//input[@name='email']")).sendKeys(username)
  await driver.findElement(By.xpath("//input[@name='password']")).sendKeys(password)
  const huluHomePageT0 = performance.now()
  await driver.findElement(By.xpath("//div[contains(@class,'hulu-login')]/button[contains(@class,'login-button')]")).click()

  // pick a profile
  await driver.sleep(2000)
  await driver.wait(seleniumWebdriver.until.elementLocated(By.css(".cu-profilenameicon-letter")), getConfig().timeout)
  await driver.findElement(By.css(".cu-profilenameicon-letter")).click()

  // first paint
  await driver.wait(seleniumWebdriver.until.elementLocated(By.css(".Nav__link")), getConfig().timeout)
  const huluHomePageFirstPaintT1 = performance.now()
  console.log("Home page first paint: " + (huluHomePageFirstPaintT1 - huluHomePageT0)/1000 + " seconds.")

  // page interactive
  await driver.wait(seleniumWebdriver.until.elementLocated(By.xpath("//div[.='Start Watching']")), getConfig().timeout)
  const huluHomePageInteractiveT1 = performance.now()
  console.log("Home page interactive: " + (huluHomePageInteractiveT1 - huluHomePageT0)/1000 + " seconds.")

  // page complete
  await driver.wait(seleniumWebdriver.until.elementLocated(By.xpath("//div[@class='Hub__collection'][8]")), getConfig().timeout)
  const huluHomePageT1 = performance.now()
  console.log("Home page complete: " + (huluHomePageT1 - huluHomePageT0)/1000 + " seconds.")

  await driver.sleep(1000)
})

Then('the authenticated Hulu home page loads', async () => {
  await driver.sleep(500)
})

let amazonAnonHomeT0
Given('I am on the Amazon home page', async () => {
  let url = 'https://www.amazon.com/ap/signin?_encoding=UTF8&ignoreAuthState=1&openid.assoc_handle=usflex&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.mode=checkid_setup&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.ns.pape=http%3A%2F%2Fspecs.openid.net%2Fextensions%2Fpape%2F1.0&openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.com%2F%3Fref_%3Dnav_signin&switch_account='
  amazonAnonHomeT0 = await performance.now()
  return driver.get(`${url}`)
})

When('I login to Amazon as {string} with password {string}', async (username, password) => {
  let amazonAnonHomeT1 = performance.now()
  console.log("Anonymous home page: " + (amazonAnonHomeT1 - amazonAnonHomeT0)/1000 + " seconds.")

  await driver.findElement(By.xpath("//input[@name='email']")).sendKeys(username)
  await driver.findElement(By.xpath("//input[@name='password']")).sendKeys(password)
  await driver.findElement(By.css("#signInSubmit")).click()
  await driver.sleep(5000)

  // load Amazon Prime Video home
  const amazonHomePageT0 = performance.now()
  await driver.get('https://www.amazon.com/b/ref=lp_2858778011_nav_em_T1_0_4_5_1__aiv?rh=i%3Ainstant-video%2Cn%3A2858778011&ie=UTF8&node=2858778011')

  // first paint
  await driver.wait(seleniumWebdriver.until.elementLocated(By.css(".nav-cart-icon.nav-sprite")), getConfig().timeout)
  const amazonHomePageFirstPaintT1 = performance.now()
  console.log("Home page first paint: " + (amazonHomePageFirstPaintT1 - amazonHomePageT0)/1000 + " seconds.")

  // page interactive
  await driver.wait(seleniumWebdriver.until.elementLocated(By.xpath("//h2[.='Watch next']")), getConfig().timeout)
  const amazonHomePageInteractiveT1 = performance.now()
  console.log("Home page interactive: " + (amazonHomePageInteractiveT1 - amazonHomePageT0)/1000 + " seconds.")

  // page complete
  await driver.wait(seleniumWebdriver.until.elementLocated(By.xpath("//h2[.='Live and upcoming events']")), getConfig().timeout)
  const amazonHomePageT1 = performance.now()
  console.log("Home page complete: " + (amazonHomePageT1 - amazonHomePageT0)/1000 + " seconds.")

  await driver.sleep(1000)
})

Then('the authenticated Amazon home page loads', async () => {
  await driver.sleep(500)
})
