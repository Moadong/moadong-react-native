export const USER_EVENT = {
  CATEGORY_BUTTON_CLICKED: 'CategoryButton Clicked',
  SEARCH_BOX_CLICKED: 'SearchBox Clicked',
  BANNER_CLICKED: 'Banner Clicked',
  CLUB_CARD_CLICKED: 'ClubCard Clicked',
  SUBSCRIBE_BUTTON_CLICKED: 'SubscribeButton Clicked',
  TAB_CHANGED: 'Tab Changed',
  PERMISSION_DIALOG_SHOWN: 'PermissionDialog Shown',
  PERMISSION_DIALOG_CLOSED: 'PermissionDialog Closed',
  PERMISSION_DIALOG_CONFIRMED: 'PermissionDialog Confirmed',
  BOTTOM_TAB_CLICKED: 'BottomTab Clicked',
  BACK_BUTTON_CLICKED: 'BackButton Clicked',
  MORE_MENU_CLICKED: 'MoreMenu Clicked',
  GO_HOME_BUTTON_CLICKED: 'GoHomeButton Clicked',
}

export const PAGE_VIEW_EVENT = {
  MAIN_PAGE: 'MainPage',
  SUBSCRIBE_PAGE: 'SubscribePage',
  MORE_PAGE: 'MorePage',
}

// 앱 자체 진단용 — 사용자 행동이 아니라 웹↔앱 브리지 상태를 관측한다.
export const DIAGNOSTIC_EVENT = {
  BRIDGE_UNKNOWN_MESSAGE: 'Bridge UnknownMessage',
}
