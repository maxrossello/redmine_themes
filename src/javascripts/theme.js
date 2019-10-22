$(function () {
  /* global PurpleMine */
  'use strict'

  /* eslint-disable no-new */
  new PurpleMine.SidebarToggler();
  new PurpleMine.HistoryTabs();
  new PurpleMine.MenuCollapse();

  /* EEA fixes */
  function moveElementAbove(el_1, el_2) {
    $(el_1).next().filter(el_2).insertBefore(el_1);
  }

  function moveElementBelow(el_1, el_2) {
    $(el_1).prev().filter(el_2).insertAfter(el_1);
  }

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
    if  ((pathname.match('/projects/.*/wiki/.*/edit') || pathname.match('/projects/.*/wiki/.*/rename')) && $('#wiki_page_parent_id').length > 0) {
	    $('#wiki_page_parent_id').select2();
	    $('body').addClass('page_that_uses_select2');
    }
  }
  
  editWikiQuickSearch();
})
