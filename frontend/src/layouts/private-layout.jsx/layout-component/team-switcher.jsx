import * as React from "react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import expandedLogo from "../../../assets/images/image-131.png";
import logo from "../../../assets/images/whiteLogo.png";

export function TeamSwitcher({ teams }) {
  const { isMobile, state } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState(teams[0]);

  if (!activeTeam) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className={cn(
            "data-[state=open]:bg-[#1A6FAB] data-[state=open]:text-white flex justify-center w-full transition-all duration-300 hover:bg-[#1A6FAB]/10"
          )}
        >
          <img
            className={cn(
              state === "expanded" ? "w-[100px]" : "size-8",
              "object-contain"
            )}
            src={state === "expanded" ? expandedLogo : logo}
            alt="logo"
          />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}