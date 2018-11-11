require 'redmine'

Rails.logger.info 'Redmine themes'

Redmine::Plugin.register :redmine_themes do
  name 'Redmine Themes plugin'
  author 'Massimo Rossello'
  description 'Brings a selection of Redmine themes'
  version '1.0.0'
  url 'https://github.com/maxrossello/redmine_themes.git'
  author_url 'https://github.com/maxrossello'
  requires_redmine :version_or_higher => '3.4.0'

end

Rails.configuration.to_prepare do
    Redmine::Plugin.find(:redmine_azcom_customization).requires_redmine_plugin :redmine_pluggable_themes, :version_or_higher => '1.0.0'
end


