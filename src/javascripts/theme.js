$(function () {
  /* global PurpleMine */
  'use strict';

  /* eslint-disable no-new */
  if (window.PurpleMine) {
    new PurpleMine.SidebarToggler();
    new PurpleMine.HistoryTabs();
    new PurpleMine.MenuCollapse();
  }

  /* EEA fixes */
  function moveElementAbove(el_1, el_2) {
    $(el_1).next().filter(el_2).insertBefore(el_1);
  }

  // function moveElementBelow(el_1, el_2) {
  //   $(el_1).prev().filter(el_2).insertAfter(el_1);
  // }

  moveElementAbove('.members.box', '.projects.box');

  // #106078 block search for anonymous
  function blockSearchAnonymous(){
    if (!$('#loggedas').length) {
        $('#quick-search form').hide();
        document.cookie='_redmine_eea=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
    else {
        var d = new Date();
        d.setTime(d.getTime() + 86400000);
        document.cookie='_redmine_eea=1; expires='+d.toUTCString()+';path=/';
    }
  }

  blockSearchAnonymous();

  // Redmine 4.0.3 fixes, see #104603
  function fixHistoryView(){
      var length = $('#issue-changesets').nextUntil('#history').length;
      var i = 0;
      while (i < length) {
        $('#history').prev().insertAfter('#history');
        i++;
      }
  }

  fixHistoryView();

  function editWikiQuickSearch() {
    var pathname = window.location.pathname;
    if  ((pathname.match('/projects/.*/wiki/.*/edit') || pathname.match('/projects/.*/wiki/.*/rename')) && jQuery('#wiki_page_parent_id').length > 0) {
	    $('#wiki_page_parent_id').select2();
	    $('body').addClass('page_that_uses_select2');
    }
  }

  /* #114732 prefill payment id when editing or adding a new time entry */
  var $log_payment = jQuery("#time_entry_custom_field_values_36");
  var $ticket_payment = jQuery("#issue_custom_field_values_71");
  var ticket_payment_value = $ticket_payment.val();
  var $log_payment_parent =  $log_payment.parent();
  $log_payment_parent.before($(
    '<div class="conflict hidden" id="wrong_payment">' +
    '<strong>Different Payment Rerefence ID selected</strong>' +
    '<div class="conflict-details conflict-journal">' +
    'Be aware that you are using a different <em>Payment Reference ID</em> from what was defined in the ticket to use: ' +
    '<em id="wrong_payment_correct_value"></em>' +
    '</div>' +
    '</div>'
  ));
  var $wrong_payment = $("#wrong_payment");
  var prefillPaymentId = function() {
    if (ticket_payment_value) {
      $(".contextual").find('.icon-edit, .icon-comment').on('click', function(){
        $log_payment.prop("value", ticket_payment_value);
        if (!$wrong_payment.hasClass('hidden')) {
          $wrong_payment.addClass('hidden');
        }
      });
    }
  };
  prefillPaymentId();

  var site_url = window.location.origin;
  var current_url = window.location.href;

  var USER_INFO_LOADED = (function() {
    var dfd = $.Deferred();
    jQuery.get(site_url + "/my/api_key").done(function(res) {
      var $res = jQuery(res);
      dfd.resolve({
        id: window.parseInt($(".user").attr('href').match(/\d+/g)[0]),
        api_key: $res.find('pre').text()
      });
    });
    return dfd.promise();
  }());

  var is_on_agile_page = current_url.indexOf('/agile') !== -1;
  if (is_on_agile_page && window.location.search.indexOf('mm') !== -1) {

    USER_INFO_LOADED.then(function(res) {
      var user_id = res.id;
      var issues_by_type = {"Assigned issues": 0};
      jQuery.ajax(site_url + "/issues.json", {
        headers: {
          'X-Redmine-API-Key': res.api_key.toString(),
          'Content-Type': 'application/json'
        },
        data: {
          assigned_to_id: user_id,
          project_id: 'zope' // TODO
        },
        dataType: 'json',
        type: 'GET'
      }).done(function(res) {
         // console.log(res);
         var issues = res.issues;
         issues.forEach(function(issue){
           var issue_status;
           if (issue.assigned_to.id !== user_id) {
             return;
           }
           issue_status = issue.status.name;
           issue_status in issues_by_type ? ++issues_by_type[issue_status] : issues_by_type[issue_status] = 1;
         });
         issues_by_type['Assigned issues'] = Object.values(issues_by_type).reduce(function(accumulator, currentValue) { return  accumulator + currentValue});
          console.log(issues_by_type);
      });
    });
  }


  var prefillPaymentIdOnTimeEntriesPage = function() {
    var is_on_time_entries = current_url.indexOf('time_entries/new') !== -1;
    var issue_number;
    if (is_on_time_entries) {
      USER_INFO_LOADED.then(function(res) {
        issue_number = $("#time_entry_issue_id").val();

        if (!issue_number) {
          return;
        }

        jQuery.ajax(site_url + "/issues/" + issue_number + '.json', {
          headers: {
            'X-Redmine-API-Key': res.api_key.toString(),
            'Content-Type': 'application/json'
          },
          processData: false,
          dataType: 'json',

          type: 'GET'
        }).done(function(res){
          var time_ticket = res.issue.custom_fields.filter(function(el) {
             return el.name.indexOf('Payment') !== -1;
          });

          if (!time_ticket.length) {
            return;
          }
          ticket_payment_value =  time_ticket[0].value;
          var $wrong_payment_correct_value = $wrong_payment_correct_value || $("#wrong_payment_correct_value");
          $wrong_payment_correct_value.text(ticket_payment_value);
          $log_payment.val(ticket_payment_value);
        });
      });
    }
  };
  prefillPaymentIdOnTimeEntriesPage();

  var $wrong_payment_correct_value = $("#wrong_payment_correct_value");
  $wrong_payment_correct_value.text(ticket_payment_value);
  $log_payment.change(function(){
      var value = $(this).val();
      if (ticket_payment_value) {
        if ( value && value !== ticket_payment_value) {
          $wrong_payment.removeClass('hidden');
        }
        else {
          $wrong_payment.toggleClass('hidden');
        }
      }
  });

  editWikiQuickSearch();
});
