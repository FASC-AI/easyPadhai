
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from './layout-component/app-sidebar';
import { NavUser } from './layout-component/nav-users';
import { BreadcrumbProvider } from '@/components/ui/breadcrumb/breadcrumb-context';
import DynamicBreadcrumb from '@/components/ui/breadcrumb/dynamic-breadcrumb';

const PrivatePageLayout = (props) => {
  return (
    <BreadcrumbProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col h-screen overflow-hidden"> 
        <header className="flex h-11 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-white border border-gray-200">

            <div className="flex items-center gap-1 px-2">
           
              <Separator orientation="vertical" className="mr-2 h-4" />
              <DynamicBreadcrumb />
            </div>
            <div className='mx-2'>
              <NavUser />
              
            </div>
          </header>
          <SidebarTrigger className="absolute top-11 -left-7 mt-2.5 ml-4 z-20"  />
          <div className="flex-1 overflow-x-auto "> 
            {/* <div className="bg-sidebar h-[8px]  "></div> */}
          
            <div className="flex bg-sidebar flex-col gap-4   min-w-full overflow-y-auto "> 
              
              {props.children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </BreadcrumbProvider>
  );
}

export default PrivatePageLayout;
