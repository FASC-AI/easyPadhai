import { routeAuths, routechangePass } from "@/pages/auth/config";
import LoginPage from "@/pages/auth/login/login.page";
// import { routeAPDA_MITRAs } from "@/pages/dashboard/apda-mitra/config";
import { routeHomes } from "@/pages/dashboard/home-section/config";
import GetStartedPage from "@/pages/dashboard/home-section/get-started/home-dashboard.page";
import { routeUSERSs } from "@/pages/dashboard/users/config";
import { routePPTCs } from "@/pages/privacy-term-conditions/config";
import AddClass from '@/pages/class/classAddEdit'
import AddSubject from '@/pages/subject/subjectAddEdit'
import ClassListView from "@/pages/class";
import SubjectListView from "@/pages/subject";
import Addinstitutes from "@/pages/institutes/institutesAddEdit";
import AddEditLms from "@/pages/LMS/lmsAddEdit";
import InstitutesListView from "@/pages/institutes";
import sectionsListView from "@/pages/section";
import AddEditCountry from "@/pages/Masters/country/AddEditCountry";
import CountryListView from "@/pages/Masters/country";
import Addsections from "@/pages/section/sectionAddEdit";
import AddEditState from  "@/pages/Masters/state/AddEditState";
import AddEditDistrict from  "@/pages/Masters/district/AddEditDistrict";
import StateListView from "@/pages/Masters/state";
import DistrictListView from "@/pages/Masters/district";
import CityListView from "@/pages/Masters/city";
import AddEditCity from "@/pages/Masters/city/AddEditCity";
import AddInstruction from "@/pages/instruction/instructionAddEdit";
import InstructionListView from "@/pages/instruction";
import Addbanners from "@/pages/banner/banner";
import AddWhatsapp from "@/pages/whatsapp/whatsappAddEdit";
import bannersListView from "@/pages/banner";
import NotificationListView from "@/pages/notification";
import NotificationAddEdit from "@/pages/notification/notificationAddEdit";
import ROUTES from "@/constants/route.constant";
import StudentListView from "@/pages/student";
import TeacherListView from "@/pages/teacher";
import LessonListView from "@/pages/LMS";
import BatchListView from "@/pages/Batch";
import BookListView from "@/pages/Masters/Book";
import AddEditBook from "@/pages/Masters/Book/AddEditBook";
import LessonMasterListView from "@/pages/Masters/Lesson";
import AddEditLessonMaster from "@/pages/Masters/Lesson/AddEditLesson";
import StudentFollowListView from "@/pages/student/batchfollow";
import TeacherCreationListView from "@/pages/teacher/batchcreation";
import TeacherFollowListView from "@/pages/teacher/batchfollow";
import Addtests from "@/pages/questionnaire/test/AddEditTest";
import TestListView from "@/pages/questionnaire/test";
import AddEditHomework from "@/pages/Homework/homeworkAddEdit";
import HomeworkListView from "@/pages/Homework";
import UserProfile from "@/pages/dashboard/users/userprofile";
import BatchList from "@/pages/institutes/batchlist";
const protectedRoutes = [
  ...routeUSERSs,
  ...routeHomes,
  ...routechangePass,
  { path: ROUTES.CLASS, component: AddClass },
  { path: ROUTES.SUBJECT, component: AddSubject },
  { path: ROUTES.CLASS_LIST, component: ClassListView },
  { path: `${ROUTES.UPDATE_CLASS}/:id`, component: AddClass },
  { path: ROUTES.SUBJECT_LIST, component: SubjectListView },
  { path: `${ROUTES.UPDATE_SUBJECT}/:id`, component: AddSubject },
  //institues
  { path: ROUTES.INSTITUTES, component: Addinstitutes },
  { path: ROUTES.INSTITUTES_LIST, component: InstitutesListView },
  { path: `${ROUTES.UPDATE_INSTITUTES}/:id`, component: Addinstitutes },
  { path: `${ROUTES.BATCH_DATA}/:id`, component: BatchList },
  //LMS
  { path: ROUTES.ADD_LMS, component: AddEditLms },
  { path: `${ROUTES.LMS_EDIT}/:id`, component: AddEditLms },
  { path: ROUTES.LMS, component: LessonListView },
  //Batch
  { path: ROUTES.BATCH, component: BatchListView },
  //section
  { path: ROUTES.SECTION, component: Addsections },
  { path: ROUTES.SECTION_LIST, component: sectionsListView },
  { path: `${ROUTES.UPDATE_SECTION}/:id`, component: Addsections },
  //country
  { path: ROUTES.COUNTRY, component: AddEditCountry },
  { path: ROUTES.COUNTRY_LIST, component: CountryListView },
  { path: `${ROUTES.UPDATE_COUNTRY}/:id`, component: AddEditCountry },
  //
  { path: ROUTES.STATE, component: AddEditState },
  { path: ROUTES.STATE_LIST, component: StateListView },
  { path: `${ROUTES.UPDATE_STATE}/:id`, component: AddEditState },

  //state
  { path: ROUTES.DISTRICT, component: AddEditDistrict },
  { path: ROUTES.DISTRICT_LIST, component: DistrictListView },
  { path: `${ROUTES.UPDATE_DISTRICT}/:id`, component: AddEditDistrict },
  //city
  { path: ROUTES.CITY, component: AddEditCity },
  { path: ROUTES.CITY_LIST, component: CityListView },
  { path: `${ROUTES.UPDATE_CITY}/:id`, component: AddEditCity },
  //instruction
  { path: ROUTES.INSTRUCTION, component: AddInstruction },
  { path: ROUTES.INSTRUCTION_LIST, component: InstructionListView },
  { path: `${ROUTES.UPDATE_INSTRUCTION}/:id`, component: AddInstruction },
  //section
  { path: ROUTES.BANNER, component: Addbanners },
  { path: ROUTES.BANNER_LIST, component: bannersListView },
  { path: `${ROUTES.UPDATE_BANNER}/:id`, component: Addbanners },
  { path: ROUTES.WHATSAPP, component: AddWhatsapp },
  { path: `${ROUTES.WHATSAPP}/list`, component: AddWhatsapp },
  { path: ROUTES.NOTIFICATION, component: NotificationAddEdit },
  { path: ROUTES.NOTIFICATION_LIST, component: NotificationListView },
  { path: `${ROUTES.UPDATE_NOTIFICATION}/:id`, component: NotificationAddEdit },
  //Teacher
  { path: ROUTES.STUDENT_LIST, component: StudentListView },
  { path: `${ROUTES.STUDENT_FOLLOW}/:id`, component: StudentFollowListView },
  //Student
  { path: ROUTES.TEACHER_LIST, component: TeacherListView },
  { path: `${ROUTES.BATCH_CREATED}/:id`, component: TeacherCreationListView },
  { path: `${ROUTES.BATCH_FOLLOW}/:id`, component: TeacherFollowListView },
  //Book
  { path: ROUTES.BOOK_LIST, component: BookListView },
  { path: ROUTES.BOOK, component: AddEditBook },
  { path: `${ROUTES.UPDATE_BOOK}/:id`, component: AddEditBook },
  //Lesson-Master
  { path: ROUTES.LESSON_MASTER_LIST, component: LessonMasterListView },
  {
    path: `${ROUTES.LESSON_MASTER_LIST}/:id`, // e.g., "/lesson-master/list/:id"
    component: LessonMasterListView,
  },
  { path: ROUTES.LESSON_MASTER, component: AddEditLessonMaster },

  { path: `${ROUTES.UPDATE_LESSON_MASTER}/:id`, component: AddEditLessonMaster },
  //Test
  { path: ROUTES.TEST, component: Addtests },
  { path: ROUTES.TEST_LIST, component: TestListView },
  { path: `${ROUTES.UPDATE_TEST}/:id`, component: Addtests },
  {
    path: `${ROUTES.UPDATE_LESSON_MASTER}/:id`,
    component: AddEditLessonMaster,
  },
  //Home Work
  { path: ROUTES.HOMEWORK_LIST, component: HomeworkListView },
  { path: ROUTES.HOMEWORK, component: AddEditHomework },
  {
    path: `${ROUTES.HOMEWORK_Edit}/:id`,
    component: AddEditHomework,
  },
  //
  { path: ROUTES.USER_PROFILE, component: UserProfile },
];

const publicRoutes = [
    ...routeAuths,
    ...routePPTCs,
];


export { protectedRoutes, publicRoutes };
