Feature: Login
  As a new user to Gaia,
  I want to login to gaia.com,
  So that I can learn hidden truths which transform my life!

  @close-browser @wip
  Scenario: Gaia Benchmark
    Given I am on the Gaia home page
    When I login to Gaia as "gaiaBench" with password "T3sting"
    Then the authenticated Gaia home page loads

  @close-browser @wip
  Scenario: Netflix Benchmark
    Given I am on the Netflix home page
    When I login to Netflix as "appexperience@gaia.com" with password "Transformation@!"
    Then the authenticated Netflix home page loads

  @close-browser @wip
  Scenario: Hulu Benchmark
    Given I am on the Hulu home page
    When I login to Hulu as "appexperience@gaia.com" with password "Fl0w3r321"
    Then the authenticated Hulu home page loads

  @close-browser @wip
  Scenario: Amazon Benchmark
    Given I am on the Amazon home page
    When I login to Amazon as "appexperience@gaia.com" with password "Fl0w3r321"
    Then the authenticated Amazon home page loads

  @close-browser @wip
  Scenario: YouTube Benchmark
    Given I am on the YouTube home page
    When I login to YouTube as "appexperience@gaia.com" with password "Fl0w3r321"
    Then the authenticated YouTube home page loads
