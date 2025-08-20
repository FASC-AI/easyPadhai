import {
  ChevronsUpDown,
  LogOut
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { User2Icon } from "lucide-react"
import { Settings2Icon } from "lucide-react"
import apiService from "@/lib/apiService"
import useStore from "@/store"
import { toast } from "sonner"
import { AUTH, AUTH_APIS } from "@/pages/auth/config"
import { useNavigate } from 'react-router-dom';
import { getInitials } from "@/components/functions/getInitials"
import { CircleUserRound } from 'lucide-react';
export function NavUser() {
  const { isMobile } = useSidebar()
  const { user, setUser, setIsAuthenticated } = useStore();
  const navigate = useNavigate()
  const handleChangePassword=()=>{
    navigate(AUTH.AUTH_CHANGE_PASSWORD_PAGE)
  }
  const handleLogout = async () => {
    try {
      console.log("Starting logout process...");
      const user_data = { _id: user?.id }
      console.log("Logout payload:", user_data);
      
      // Try API logout first
      try {
        const response = await apiService.post(AUTH_APIS.AUTH_LOGOUT, user_data);
        console.log("Logout response:", response);
        
        if (response?.code === 200 && response?.status === true) {
          toast.success(response?.message);
        } else {
          console.warn("API logout failed, proceeding with local logout");
        }
      } catch (apiError) {
        console.warn("API logout failed, proceeding with local logout:", apiError);
      }
      
      // Always perform local logout regardless of API response
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      console.log("Local logout successful, redirecting to login");
      navigate('/login', { replace: true });
      
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's an error, force logout
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      navigate('/login', { replace: true });
    }
  }
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="w-full">
              <SidebarMenuButton
                asChild
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground w-full"
              >
                <div className="flex items-center gap-2 w-full">
                  <Avatar className=" rounded-lg">
                    <AvatarImage src={user?.avatar} alt={user?.name?.english} />
                    <AvatarFallback className="rounded-lg">{getInitials(user?.name?.english)}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-[14px] font-semibold leading-tight">
                    <span className="truncate font-semibold">{user?.name?.english}</span>
                  </div>
                </div>
              </SidebarMenuButton>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side="bottom"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src='#' alt={user?.name?.english} />
                  <AvatarFallback className="rounded-lg">{getInitials(user?.name?.english)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user?.name?.english}</span>
                  <span className="truncate text-xs">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem  onClick={()=>navigate("/profile")}>
                <User2Icon />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={()=>handleChangePassword()}>
                <Settings2Icon />
                Change Password
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
