Feature: New User Signup
  As a new user to Gaia,
  I want to sign up for gaia.com,
  So that I can learn hidden truths which transform my life!

  @close-browser @web-app @signup
  Scenario: Signup VISA
    When I sign up with VISA
    When I play the first video button found
    Then the video plays

  @close-browser @web-app @signup @paypal
  Scenario: Signup PayPal
    When I sign up with PayPal
    Then memberhome displays

  @close-browser @web-app @signup
  Scenario: Signup AMEX
    When I sign up with AMEX
    Then memberhome displays

  @close-browser @signup
  Scenario: Signup CHASE
    When I sign up with CHASE
    Then memberhome displays
