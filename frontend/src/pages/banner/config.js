import AddClass from "./classAddEdit";

export const CLASS = {
  CLASS: '/class',

  
  // USER_EDIT:'/user/edit',
  // USER_PREVIEW:'/user/preview'
  
};

export const CLASS_APIS = {
  // USERS_LIST: '/auth/users',
  CLASS: '/auth/class',
};

export const routeCLASSs = [
  {
    path: CLASS.CLASS,
    component: AddClass,

  },
  // {
  //   path: USERS.RESET_PASSWORD,
  //   component: ResetPasswordPage,
  // },
  // {
  //   path: USERS.USER_PREVIEW,
  //   component: UserPreviewInfo,
  // },
  // {
  //   path: USERS.USER_EDIT,
  //   component: EditUserProfileForm,
  // },
  
];
