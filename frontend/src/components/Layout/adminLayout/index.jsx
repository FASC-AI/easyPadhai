import { useEffect, useState } from 'react';
import Header from '../Header';
import Sidebar from '../Sidebar';
import '../Admin.css';
import useStore from '@/store/userStore';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const AdminLayout = (props) => {
  const { permissions } = useStore();

  const [isShowSidebar, setIsShowSidebar] = useState(false);
  const toggleSidebar = (isOpen) => {
    setIsShowSidebar(isOpen !== undefined ? isOpen : !isShowSidebar);
  };

  return (
    <div className="adminLayoutWrap relative">
      {isShowSidebar && (
        <div className="overlay1" onClick={() => toggleSidebar()} />
      )}

      <Sidebar
        page={props.page}
        currentUser={props.currentUser}
        isShowSidebar={isShowSidebar}
        setIsShowSidebar={setIsShowSidebar}
        toggleSidebar={toggleSidebar}
        permissions={permissions}
      />

      <div
        className={`adminLayoutInner ${
          isShowSidebar ? 'marginLeft active-sidebar' : ''
        }`}
      >
        <Header currentUser={props.currentUser} isShowSidebar={isShowSidebar} />
        <div className="layoutContent !pb-0 h-[calc(100vh-59px)]">
          {props.children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
