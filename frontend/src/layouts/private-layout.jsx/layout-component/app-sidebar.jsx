import React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  // SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-users";
import useStore from "@/store";
import { TeamSwitcher } from "./team-switcher";
import { HOME } from "@/pages/dashboard/home-section/config";
import {
  House,
  User,
  LibraryBig,
  UserRoundPen,
  GraduationCap,
  Settings,
  FolderKanban,
  NotebookPen,
  BookOpenCheck,
} from "lucide-react";
import ROUTES from "@/constants/route.constant";
// import { APDA_MITRA } from "@/pages/dashboard/apda-mitra/config"
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Home",
      url: "",
      icon: House,
      isActive: true,
      items: [{ title: "Dashboard", url: HOME.GET_STARTED }],
    },

    // {
    //   title: "Teacher",
    //   url: "#",
    //   icon: UserRoundPen,
    //   isActive: true,
    //   items: [{ title: "Teacher", url: "/teacher/list" }],
    // },
    // {
    //   title: "Student",
    //   url: "#",
    //   icon: GraduationCap,
    //   isActive: true,
    //   items: [{ title: "Student", url: "/student/list" }],
    // },
    {
      title: "User",
      url: "#",
      icon: User,
      isActive: true,
      items: [
        { title: "User ", url: "/users" },
        { title: "Teacher", url: "/teacher/list" },
        { title: "Student", url: "/student/list" },
        // { title: "Aapda Mitra", url: APDA_MITRA.APDA_MITRA },
        // { title: "Starred", url: "/register" },
        // { title: "Settings", url: "#" },
      ],
    },

    {
      title: "LMS",
      url: "#",
      icon: NotebookPen,
      isActive: true,
      items: [
        { title: "Lesson Description", url: ROUTES.LMS },
        { title: "Home Work", url: ROUTES.HOMEWORK_LIST },

        // { title: "Aapda Mitra", url: APDA_MITRA.APDA_MITRA },
        // { title: "Starred", url: "/register" },
        // { title: "Settings", url: "#" },
      ],
    },
    {
      title: "Questionnaire ",
      url: "#",
      icon: BookOpenCheck,
      isActive: true,
      items: [
        { title: "Question", url: ROUTES.TEST_LIST },
        { title: "Instruction ", url: "/instruction/list" },
      ],
    },
    {
      title: "Master",
      url: "#",
      icon: FolderKanban,
      isActive: true,
      items: [
        { title: "Class ", url: "/class/list", icon: LibraryBig },
        { title: "Section ", url: "/section/list" },
        { title: "Book ", url: "/book/list" },
        { title: "Lesson ", url: "/lesson-master/list" },
        { title: "Subject ", url: "/subject/list" },
      ],
    },
    {
      title: "Communication",
      url: "#",
      icon: FolderKanban,
      isActive: true,
      items: [
        { title: "Banner ", url: "/banner/list" },
        { title: "Notification ", url: "/notification/list" },
        { title: "WhatsApp ", url: "/whatsapp" },
      ],
    },
    {
      title: "System Settings",
      url: "#",
      icon: Settings,
      isActive: true,
      items: [
        { title: "Country ", url: "/country/list" },
        { title: "State ", url: "/state/list" },
        { title: "District ", url: "/district/list" },
        { title: "City ", url: "/city/list" },
      ],
    },
    {
      title: "Expansion",
      url: "#",
      icon: Settings,
      isActive: true,
      items: [
        { title: "Institution ", url: "/institutes/list" },
        ,
        { title: "Batches", url: ROUTES.BATCH },
      ],
    },
  ],
  navMainEditor: [
    {
      title: "Home",
      url: "",
      icon: House,
      isActive: true,
      items: [{ title: "Dashboard", url: HOME.GET_STARTED }],
    },
    {
      title: "LMS",
      url: "#",
      icon: NotebookPen,
      isActive: true,
      items: [
        { title: "Lesson Description", url: ROUTES.LMS },
        { title: "Home Work", url: ROUTES.HOMEWORK_LIST },

        // { title: "Aapda Mitra", url: APDA_MITRA.APDA_MITRA },
        // { title: "Starred", url: "/register" },
        // { title: "Settings", url: "#" },
      ],
    },
    {
      title: "Questionnaire ",
      url: "#",
      icon: BookOpenCheck,
      isActive: true,
      items: [
        { title: "Question", url: ROUTES.TEST_LIST },
        { title: "Instruction ", url: "/instruction/list" },
      ],
    },
  ],
  projects: [
    { name: "Design Engineering", url: "#", icon: Frame },
    { name: "Sales & Marketing", url: "#", icon: PieChart },
    { name: "Travel", url: "#", icon: Map },
  ],
};

export function AppSidebar(props) {
  const { user } = useStore();
  const navItems =
    user.userRole === "editor" ? data.navMainEditor : data.navMain;
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} className="text-blue-300" />
      </SidebarFooter>
      {/* <SidebarRail /> */}
    </Sidebar>
  );
}
