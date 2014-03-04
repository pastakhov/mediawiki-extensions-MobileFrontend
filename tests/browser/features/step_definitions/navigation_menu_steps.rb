When(/^I click on the main navigation button$/) do
  on(ArticlePage).mainmenu_button_element.click
end

When(/^I click on "(.*?)" in the main navigation menu$/) do |text|
  step 'I click on the main navigation button'
  on(ArticlePage).navigation_element.link_element(text: text).click
end

Then(/^I see a link to "(.*?)" in the main navigation menu$/) do |text|
  on(ArticlePage).navigation_element.link_element(text: text).should be_visible
end

Then(/^I do not see a link to "(.*?)" in the main navigation menu$/) do |text|
  on(ArticlePage).navigation_element.link_element(text: text).should_not be_visible
end
