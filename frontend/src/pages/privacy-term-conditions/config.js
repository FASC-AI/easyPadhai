import PrivacyPolicy from "./privacy-policy-page";
import TermConditions from "./term-condition-page";

export const PPTC = {
  PPTC_PRIVACY_POLICY: '/privacy-policy',
  PPTC_TERM_CONDITION: '/terms-conditions',
  
};


export const routePPTCs = [
  {
    path: PPTC.PPTC_PRIVACY_POLICY,
    component: PrivacyPolicy,
  },
  {
    path: PPTC.PPTC_TERM_CONDITION,
    component: TermConditions,
  }
];
