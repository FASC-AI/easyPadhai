import GetStartedPage from "./get-started/home-dashboard.page";

export const HOME = {
  GET_STARTED: '/dashboard',
  ADMIN: '/admin',
  
};

export const HOME_APIS = {
};

export const routeHomes = [
  {
    path: HOME.GET_STARTED,
    component: GetStartedPage,
  },
];
