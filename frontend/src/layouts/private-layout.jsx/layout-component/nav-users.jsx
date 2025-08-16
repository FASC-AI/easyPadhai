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
      const user_data = { _id: user?.id }
      const response = await apiService.post(AUTH_APIS.AUTH_LOGOUT, user_data, {
        withCredentials: true
      });
      if (response?.code === 200 && response?.status === true) {
        toast.success(response?.message);
        setUser(null);
        setIsAuthenticated(false);
        // Clear token from localStorage
        localStorage.removeItem('token');
        navigate('/', { replace: true })
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  }
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className=" rounded-lg">
                <AvatarImage src={user?.avatar} alt={user?.name?.english} />
<Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src='#' alt={user?.name?.english} />
                  <AvatarFallback className="rounded-lg">{getInitials(user?.name?.english)}</AvatarFallback>
                </Avatar>
              </Avatar>
              <div className="grid flex-1 text-left text-[14px] font-semibold leading-tight">
                <span className="truncate font-semibold">{user?.name?.english}</span>
               
              </div>
              {/* <ChevronsUpDown className="ml-auto size-4" /> */}
            </SidebarMenuButton>
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
