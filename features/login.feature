Feature: Login
  As a new user to Gaia,
  I want to login to gaia.com,
  So that I can learn hidden truths which transform my life!

  @close-browser @web-app
  Scenario: Login, Navigate, Filter, and Play Video
    Given I am on the Gaia yoga page
    When I login from yoga home as username "automation-memberhome" with password "auto"
    When I navigate to member home
    Then the Recommended for you row displays
    When I navigate to All Yoga Practices
    When I filter by Style on Beginner Yoga
    When I click the Load More button
    When I click the 17th video's play button
    Then the video plays
