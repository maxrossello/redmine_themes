/* global jQuery */
jQuery(function ($) {
  "use strict";

  var theme_utils = window.PurpleMine;
  var site_url = theme_utils.site_url;
  var current_url = theme_utils.current_url;
  var checked_users = {};
  var getUserToken = theme_utils.getUserToken();
  var WIP_MAX_LIMIT = 4;

  // #114858 remove focus of input on page load added by application.js defaultFocus()
  $("#content input[type=text], #content textarea").first().blur();

  // close dialogs when clicking outside dialogs
  $(document).on("click", function (e) {
    var $wip_dialog = $(".wip-alert");
    if ($wip_dialog.length) {
      if (!$(e.target).parents().filter(".wip-alert").length) {
        $wip_dialog.find(".ui-dialog-content").dialog("close");
      }
    }
  });

  var getAssignedUser = function (token, user_obj) {
    var dfd = $.Deferred();
    var api_key = token.api_key;
    var userObj = user_obj || {};
    var $user_info = userObj.$el || $(".assigned-to").find(".user");
    var user_id = $user_info.attr("href");
    var user_name = $user_info.text();
    if (!user_id) {
      return dfd.reject();
    }
    user_id = window.parseInt(user_id.match(/\d+/g)[0]);
    var user_info = checked_users[user_id];
    if (user_info) {
      return dfd.resolve(user_info);
    }
    user_info = {
      user_id: user_id,
      user_name: user_name,
      api_key: api_key
    };

    checked_users[user_id] = user_info;
    return dfd.resolve(user_info);
  };

  var getAssignedUserOverloadStatus = function (user) {
    var user_id = user.user_id;
    user.is_overloaded = false;
    var dfd = $.Deferred();

    var issues_by_type = { "Total ongoing issues": 0 };

    jQuery
      .ajax(site_url + "/issues.json", {
        headers: {
          "X-Redmine-API-Key": user.api_key,
          "Content-Type": "application/json"
        },
        data: {
          assigned_to_id: user_id,
          limit: 500,
          status_id: "2|4|8|9",
          tracker_id: "1|2|4|6"
        },
        dataType: "json",
        type: "GET"
      })
      .done(function (res) {
        var issues = res.issues;
        issues.forEach(function (issue) {
          var issue_status;
          if (issue.assigned_to.id !== user_id) {
            return;
          }
          issue_status = issue.status.name;
          issue_status in issues_by_type
            ? ++issues_by_type[issue_status]
            : (issues_by_type[issue_status] = 1);
        });
        issues_by_type["Total ongoing issues"] = Object.values(
          issues_by_type
        ).reduce(function (accumulator, currentValue) {
          return accumulator + currentValue;
        });
        if (issues_by_type["Total ongoing issues"] > WIP_MAX_LIMIT) {
          user.is_overloaded = true;
          user.issues = issues_by_type;
        }
        return dfd.resolve(user);
      });
    return dfd.promise();
  };

  var addWIPLimitUI = function (user, parent) {
    var $parent = parent || $(".assigned-to .value");
    var $overload_construct = $(
      "<div class='overloaded-user'>" +
        "<div class='overloaded-user-head'><strong>WIP-limit of max " +
        WIP_MAX_LIMIT +
        " is reached</strong></div>" +
        "<div class='overloaded-user-body'></div> " +
        "<div class='overloaded-user-footer'>" +
        "<p>Why we care about WIP-limits? " +
        "<a href='https://taskman.eionet.europa.eu/projects/public-docs/wiki/Taskman_FAQ#Why-do-I-have-a-stop-sign-beside-my-name' " +
        "target='_blank' class='overloaded-user-link'>Get it!</a></p>" +
        "</div>" +
        "</div>"
    );
    Object.entries(user.issues).forEach(function (issue) {
      var issue_category = issue[0];
      var link_to_assigned_issues;
      var text =
        "<p class='overloaded-user-issue-category'>" +
        issue_category +
        ": " +
        issue[1] +
        "</p>";
      if (issue_category.indexOf("Total ongoing issues") !== -1) {
        link_to_assigned_issues =
          "<a target='_blank' class='overloaded-user-link assigned_issues_link' href='" +
          site_url +
          "/issues?" +
          "set_filter=1&sort=status,priority%3Adesc%2Cupdated_on%3Adesc" +
          "&f[]=tracker_id&op[tracker_id]==&v[tracker_id][]=2&v[tracker_id][]=1&v[tracker_id][]=4&v[tracker_id][]=6" +
          "&f[]=status_id&op[status_id]==&v[status_id][]=2&v[status_id][]=4&v[status_id][]=8" +
          "&v[status_id][]=9&f[]=assigned_to_id&op[assigned_to_id]==&v[assigned_to_id][]=" +
          user.user_id +
          "'>";
        link_to_assigned_issues = link_to_assigned_issues + text + "</a>";
      }
      $overload_construct
        .find(".overloaded-user-body")
        .append(link_to_assigned_issues || text);
    });

    $parent.each(function () {
      var $overloaded_user = this;
      var $overload_icon = $(
        "<span class='overloaded-user-warning' />"
      ).appendTo($overloaded_user);
      var $overloaded_user_construct = $overload_construct.clone();
      $overloaded_user_construct.appendTo($overloaded_user).dialog({
        title: user.user_name + " is overloaded",
        width: 300,
        dialogClass: "wip-alert",
        autoOpen: false,
        position: { my: "left top", of: $overload_icon }
      });

      $overload_icon.on("mouseenter", function () {
        $overloaded_user_construct.dialog("open");
      });
    });
  };

  var add_wip_limit_reached_on_issue_page = function () {
    var $issue_assigned_to = $("#issue_assigned_to_id");
    var $issue_assigned_to_parent = $issue_assigned_to.parent();
    $issue_assigned_to.change(function () {
      var selected_option = $(this).find(":selected")[0];
      var value = selected_option.value;
      $(".overloaded-user-warning").remove();
      var $user = $("<a />", {
        href: "/users/" + value,
        text: selected_option.innerText
      });
      var user_obj = { $el: $user };
      getUserToken
        .then(function (token) {
          return getAssignedUser(token, user_obj);
        })
        .then(getAssignedUserOverloadStatus)
        .then(function (user) {
          if (user.is_overloaded) {
            addWIPLimitUI(user, $issue_assigned_to_parent);
          }
        });
    });

    getUserToken
      .then(getAssignedUser)
      .then(getAssignedUserOverloadStatus)
      .then(function (user) {
        if (user.is_overloaded) {
          addWIPLimitUI(user);
          addWIPLimitUI(user, $issue_assigned_to_parent);
        }
      });
  };

  var is_on_issue_page = current_url.indexOf("/issues") !== -1;
  if (is_on_issue_page) {
    add_wip_limit_reached_on_issue_page();
  }

  var is_on_agile_page = current_url.indexOf("/agile") !== -1;
  if (is_on_agile_page) {
    (function () {
      var $current_issue_board = $(".issues-board").filter(":visible");
      var ticket_categories_to_check = ["2", "4", "8", "9"];

      var $issues_columns_to_check = $current_issue_board
        .find(".issue-status-col")
        .filter(function () {
          return ticket_categories_to_check.indexOf(this.dataset.id) !== -1;
        });
      var users_to_check = {};
      $issues_columns_to_check.each(function () {
        var $column = $(this);
        var $column_usernames = $column.find(".assigned-user").find(".active");
        $column_usernames.each(function () {
          var $user = $(this);
          var username = $user.text();
          if (users_to_check[username]) {
            return;
          }
          var user_obj = { $el: $user };
          getUserToken
            .then(function (token) {
              return getAssignedUser(token, user_obj);
            })
            .then(getAssignedUserOverloadStatus)
            .then(function (user) {
              var $users_to_update;
              if (user.is_overloaded) {
                $users_to_update = $issues_columns_to_check
                  .find(".assigned-user")
                  .find(".active")
                  .filter(function () {
                    return this.innerText.indexOf(user.user_name) !== -1;
                  });
                console.log(user);
                addWIPLimitUI(user, $users_to_update);
              }
            });
          users_to_check[username] = true;
        });
      });
    })();
  }
});
