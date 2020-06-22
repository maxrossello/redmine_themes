/* global window */
var PurpleMine = PurpleMine || {};
PurpleMine.site_url = window.location.origin;
PurpleMine.current_url = window.location.href;
PurpleMine.session_storage = window.sessionStorage;
PurpleMine.local_storage = window.localStorage;

PurpleMine.getUserToken = function() {
  var session_storage = PurpleMine.session_storage;
  var site_url = PurpleMine.site_url;
  var dfd = $.Deferred();
  var $logged_in = $("#loggedas");
  if (!$logged_in.length) {
    return dfd.reject();
  }
  var user_id = window.parseInt($logged_in.find('.user').attr('href').match(/\d+/g)[0]);
  var user_api_key = session_storage && session_storage.getItem('t_logged_user_api_key_' + user_id);
  if (user_api_key) {
    return dfd.resolve({api_key: user_api_key});
  }
  jQuery.get(site_url + "/my/api_key").done(function(res) {
    var $res = jQuery(res);
    var api_key = $res.find('pre').text();
    session_storage && session_storage.setItem('t_logged_user_api_key_' + user_id, api_key);
    return dfd.resolve({
      api_key: api_key
    });
  });
  return dfd.promise();
};
