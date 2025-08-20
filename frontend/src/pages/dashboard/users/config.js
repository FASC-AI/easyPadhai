import ResetPasswordPage from "./reset-password/reset-password.page";
// import { EditUserProfileForm } from "./user-edit/user-edit";
import UsersListView from "./users-list";
import UserPreviewInfo from "./users-preview/user-preview-page";
import AddEditUser from "./usersAddEdit";
export const USERS = {
  ADD_USERS: "/users/add",
  EDIT_USERS: "/users/edit",
  USERS: "/users",
  RESET_PASSWORD: "/user/reset-password",

  // USER_EDIT:'/user/edit',
  USER_PREVIEW: "/user/preview",
};

export const USERS_APIS = {
  USERS_LIST: '/auth/users',
  USER: '/auth/user',
};

export const routeUSERSs = [
  {
    path: USERS.USERS,
    component: UsersListView,
  },
  {
    path: USERS.ADD_USERS,
    component: AddEditUser,
  },
  {
    path: `${USERS.EDIT_USERS}/:id`,
    component: AddEditUser,
  },
  {
    path: USERS.RESET_PASSWORD,
    component: ResetPasswordPage,
  },
  {
    path: USERS.USER_PREVIEW,
    component: UserPreviewInfo,
  },
  // {
  //   path: USERS.USER_EDIT,
  //   component: EditUserProfileForm,
  // },
];
