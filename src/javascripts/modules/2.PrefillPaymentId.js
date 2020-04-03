/* #114732 prefill payment id when editing or adding a new time entry */
jQuery(function($) {
  "use strict";

  var theme_utils = window.PurpleMine || {};
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

  var prefillPaymentIdOnTimeEntriesPage = function() {
    var is_on_time_entries = theme_utils.current_url.indexOf('time_entries/new') !== -1;
    var issue_number;
    if (is_on_time_entries) {
      theme_utils.getUserToken().then(function(res) {
        issue_number = $("#time_entry_issue_id").val();

        if (!issue_number) {
          return;
        }

        jQuery.ajax(theme_utils.site_url + "/issues/" + issue_number + '.json', {
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
});
