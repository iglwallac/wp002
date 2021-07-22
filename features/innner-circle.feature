Feature: Inner Circle
  As a new user to Gaia,
  I want to login to gaia.com,
  So that I can learn hidden truths which transform my life!

  @close-browser @wip @inner-circle
  Scenario: Inner Circle Approval
    Given I am on the FB Inner Circle page
    Given I get an auth token
    Given I login to FB
    When I scroll to the bottom of the page
    When I approve the appropriate requests

  Scenario: Inner Circle Approval File Write
    Given I am on the FB Inner Circle page
    Given I get an auth token
    Given I login to FB
    When I scroll to the bottom of the page
    When I approve the appropriate requests
#    When I write to a csv file
