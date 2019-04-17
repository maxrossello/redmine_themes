$(function () {
  /* global PurpleMine */
  'use strict'

  /* eslint-disable no-new */
  new PurpleMine.SidebarToggler()
  new PurpleMine.HistoryTabs()
  new PurpleMine.MenuCollapse()

  /* EEA fixes */
  function moveElementAbove(el_1, el_2) {
    $(el_1).next().filter(el_2).insertBefore(el_1)
  }

  function moveElementBelow(el_1, el_2) {
    $(el_1).prev().filter(el_2).insertAfter(el_1)
  }

  moveElementAbove('.members.box', '.projects.box')
})
