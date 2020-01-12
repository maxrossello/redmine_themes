# Redmine plugin for Redmine Themes
# Copyright (C) 2018-2020  Massimo Rossello
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

require 'redmine'

Rails.logger.info 'Redmine themes'

Redmine::Plugin.register :redmine_themes do
  name 'Redmine Themes plugin'
  author 'Massimo Rossello'
  description 'Brings a selection of Redmine themes'
  version '4.0.0'
  url 'https://github.com/maxrossello/redmine_themes.git'
  author_url 'https://github.com/maxrossello'
  requires_redmine :version_or_higher => '4.0.0'

end

Rails.configuration.to_prepare do
    Redmine::Plugin.find(:redmine_themes).requires_redmine_plugin :redmine_pluggable_themes, :version_or_higher => '4.0.0'
end


