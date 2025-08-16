import ForgotPassPage from "./forgot-password/forgot-pass.page";
import LoginPage from "./login/login.page";
import RegistrationPage from "./registration/registration.page";
// import ResetPasswordPage from "./reset-password/reset-password.page";
import imageSlider1 from "/assets/images/img1.jpg";
import imageSlider2 from "/assets/images/img2.jpg";
import imageSlider3 from "/assets/images/img3.png";
import imageSlider4 from "/assets/images/img4.png";
import VerifyEmailPage from "./verify-email/verify-email.page";
import ChangePasswordPage from "./change-password/change-password.page";
import { SetPassword } from "./change-password/set-password";
export const AUTH = {
  AUTH_LOGIN_PAGE: '/',
  AUTH_REGISTRATION_PAGE: '/register',
  AUTH_FORGOT_PASS_PAGE: '/forgot-pass',
  AUTH_RESET_PASSWORD_PAGE: '/reset-pass',
  AUTH_VERIFY_EMAIL_PAGE: '/verify-email',

  AUTH_CHANGE_PASSWORD_PAGE: '/change-pass',
  AUTH_SET_PASSWORD:'/set-pass'
  
};

export const AUTH_APIS = {
  AUTH_REGISTRATION_PAGE: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_FORGOT_PASSWORD: '/auth/forget-password',
  AUTH_VERIFY_OTP: '/auth/verify-otp',
  AUTH_RESET_PASS: '/auth/reset-password',
  
  AUTH_CHANGE_PASS: '/auth/add-password',
  
  AUTH_CHANGE_PASSWORD: '/auth/change-password',
  AUTH_VERIFY_EMAIL: '/auth/mail-verify',
  
  AUTH_LOGOUT: '/auth/logout',

};

export const routeAuths = [
  {
    path: AUTH.AUTH_LOGIN_PAGE,
    component: LoginPage,
  },
  {
    path: '/*',
    component: LoginPage,
  },
  // {
  //   path: AUTH.AUTH_REGISTRATION_PAGE,
  //   component: RegistrationPage,
  // },
  {
    path: AUTH.AUTH_FORGOT_PASS_PAGE,
    component: ForgotPassPage,
  },


  {
    path: AUTH.AUTH_VERIFY_EMAIL_PAGE,
    component: VerifyEmailPage,
  },


];

export const routechangePass = [
  {
    path: AUTH.AUTH_CHANGE_PASSWORD_PAGE,
    component: ChangePasswordPage,
  },
  {
    path: AUTH.AUTH_SET_PASSWORD,
    component: SetPassword,
  },
];

export const LOGIN_PAGE_IMAGES = [imageSlider1, imageSlider2, imageSlider3, imageSlider4]