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
  function prefillPaymentId() {
    var ticket_payment_id = jQuery("#issue_custom_field_values_71").val();
    var $log_payment_id = jQuery("#time_entry_custom_field_values_36");

    if (ticket_payment_id) {
      $(".contextual").find('.icon-edit, .icon-comment').on('click', function(){
        $log_payment_id.prop("value", ticket_payment_id);
      });
    }
  }
  prefillPaymentId();

  function prefillPaymentIdOnTimeEntriesPage() {
    var is_on_time_entries = window.location.href.indexOf('time_entries/new') !== -1;
    var api_key, site_url, issue_number;
    if (is_on_time_entries) {
      site_url = window.location.origin;
      jQuery.get(site_url + "/my/api_key").done(function(res) {
        api_key = jQuery(res).find('pre').text();
        issue_number = $("#time_entry_issue_id").val();

        if (!issue_number) {
          return;
        }

        jQuery.ajax(site_url + "/issues/" + issue_number + '.json', {
          headers: {
            'X-Redmine-API-Key': api_key.toString(),
            'Content-Type': 'application/json'
          },
          processData: false,
          dataType: 'json',

          type: 'GET'
        }).done(function(res){
          $("#time_entry_custom_field_values_36").val(res.issue.custom_fields[2].value);
        });
      });
    }
  }
  prefillPaymentIdOnTimeEntriesPage();

  editWikiQuickSearch();
});
