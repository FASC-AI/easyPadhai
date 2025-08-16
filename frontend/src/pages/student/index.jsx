import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useBreadcrumb } from "@/components/ui/breadcrumb/breadcrumb-context";
import { useEffect, useState } from "react";
import { format_dd_mmm_yyyy } from "@/components/functions/date-format";
import TableListView from "@/components/ui/table-list-view/table-list-view";
import { ChevronDown, Settings2Icon } from "lucide-react";
import {
  EllipsisIcon,
  EyeIcon,
  PencilIcon,
  UserRoundCheck,
  UserRoundX,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";
import {
  FileUpIcon,
  ImportIcon,
  LocateFixedIcon,
  TrashIcon,
  PlusIcon,
  CopyPlus,
} from "lucide-react";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { toTitleCase } from "@/components/functions/tittle-case";
import { AlertDialogBox } from "@/components/ui/dialog";
import { Trash2Icon } from "lucide-react";
import apiService from "@/lib/apiService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { APIS } from "@/constants/api.constant";
import ROUTES from "@/constants/route.constant";
import DataCharectersTooltip from "@/components/ui/DataCharectersTooltip";
import { Link } from "react-router-dom";
import PopupAlert from "@/components/common/PopupAlert/PopupAlert";
import { getApi, patchApi } from "@/services/method";
const queryClient = new QueryClient();

const StudentListView = () => {
  const { updateBreadcrumb } = useBreadcrumb();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [confirmationPopup, setConfirmationPopup] = useState({
    isOpen: false,
    row: null,
    action: null,
  });

  const navigate = useNavigate();

  useEffect(() => {
    updateBreadcrumb([{ label: "Student" }]);
  }, []);
  const navigateToBatchfollow = (rowData) => {
    navigate(`/student-follow/${rowData?._id}`, {
      state: { supplierId: rowData?._id },
    });
  };
  const handleDeleteUser = (id) => {
    setDeleteId(id);
    setIsDialogOpen(true);
  };

  const handleConfirm = async () => {
    try {
      const response = await apiService.delete(`${APIS.PROFILE}/${deleteId}`);
      if (response?.code === 200 && response?.status === true) {
        toast.success(response.message);
        setIsDialogOpen(false);
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setIsDialogOpen(false);
        toast.error(response.message);
      }
    } catch (error) {
      setIsDialogOpen(false);
      toast.error(error?.response?.data?.message || "Delete failed");
    }
  };

  const handleStatusToggle = async (row, status) => {
    const payload = { isActive: status === "Active" };

    try {
      const response = await patchApi(APIS.Student, row._id, payload);
      if (response?.status === true && response?.code === 200) {
        toast.success(`Student has been marked as ${status}`);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const handleConfirmationResponse = (isConfirmed) => {
    if (isConfirmed && confirmationPopup.row) {
      handleStatusToggle(confirmationPopup.row, confirmationPopup.action);
    }
    setConfirmationPopup({ isOpen: false, row: null, action: null });
  };

  const handleCancelUpdate = () => {
    setConfirmationPopup({ isOpen: false, row: null, action: null });
  };

  const handleAddUser = () => {
    navigate(`${ROUTES.USER}`, { state: { userRole: "student" } });
  };

  const columns = [
    // { field: 'id', headerName: 'ID', width: 70 },
    {
      field: "name",
      headerName: "Name",
      headerClassName: "bg-[#1A6FAB] text-white",
      width: 250,
      renderCell: (params) => <span>{params.value || "--"}</span>,
    },
    {
      field: "email",
      headerName: "Email",
      headerClassName: "bg-[#1A6FAB] text-white",
      width: 250,
      renderCell: (params) => <span>{params.value || "--"}</span>,
    },

    {
      field: "mobile",
      headerName: "Mobile",
      headerClassName: "bg-[#1A6FAB] text-white",
      width: 250,
      renderCell: (params) => <span>{params.value || "--"}</span>,
    },
    {
      field: "class",
      headerName: "Class",
      headerClassName: "bg-[#1A6FAB] text-white",
      width: 250,
      renderCell: (params) => (
        <div className="relative group">
          <span className="truncate block max-w-[250px]">
            {Array.isArray(params.value)
              ? params.value.map((cls) => cls.nameEn).join(", ")
              : "--"}
          </span>
          {Array.isArray(params.value) && params.value.length > 0 && (
            <div className="absolute hidden group-hover:block bg-white p-2 rounded shadow-lg z-10">
              {params.value.map((cls) => cls.nameEn).join(", ")}
            </div>
          )}
        </div>
      ),
    },

    // {
    //   field: "sections",
    //   headerName: "Section",
    //   headerClassName: "bg-[#1A6FAB] text-white",
    //   width: 250,
    //   renderCell: (params) => (
    //     <div className="relative group">
    //       <span className="truncate block max-w-[250px]">
    //         {params.value?.length > 0
    //           ? params.value.map(section => section.sectionsName).join(', ')
    //           : '--'}
    //       </span>
    //       {params.value?.length > 0 && (
    //         <div className="absolute hidden group-hover:block bg-white p-2 rounded shadow-lg z-10">
    //           {params.value.map(section => section.sectionsName).join(', ')}
    //         </div>
    //       )}
    //     </div>
    //   ),
    // },
    {
      field: "subjects",
      headerName: "Subjects",
      headerClassName: "bg-[#1A6FAB] text-white",
      width: 250,
      renderCell: (params) => (
        <div className="relative group">
          <span className="truncate block max-w-[250px]">
            {params.value?.length > 0
              ? params.value.map((subject) => subject.nameEn).join(", ")
              : "--"}
          </span>
          {params.value?.length > 0 && (
            <div className="absolute hidden group-hover:block bg-white p-2 rounded shadow-lg z-10">
              {params.value.map((subject) => subject.nameEn).join(", ")}
            </div>
          )}
        </div>
      ),
    },
    {
      field: "batchfollow",
      headerName: "Batch Follow",
      headerClassName: "bg-[#1A6FAB] text-white",
      width: 250,
      renderCell: (params) => (
        <span>
          {params.row.batchFollow && params.row.batchFollow !== ""
            ? params.row.batchFollow
            : "--"}
        </span>
      ),
    },
    // {
    //   field: "institutes",
    //   headerName: "Institute",
    //   headerClassName: "bg-[#1A6FAB] text-white",
    //   width: 250,
    //   renderCell: (params) => {
    //     const value = params.value;
    //     const displayText =
    //       value?.institutesName  || "--";

    //     return (
    //       <div className="relative group">
    //         <span className="truncate block max-w-[250px]">{displayText}</span>
    //         {displayText !== "--" && (
    //           <div className="absolute hidden group-hover:block bg-white p-2 rounded shadow-lg z-10">
    //             {displayText}
    //           </div>
    //         )}
    //       </div>
    //     );
    //   },
    // },

    // {
    //   field: "batchFollow",
    //   headerName: "Batch Follow",
    //   headerClassName: "bg-[#1A6FAB] text-white",
    //   width: 250,
    //   renderCell: (params) => (
    //     <span>{params.value && params.value !== '' ? params.value : '--'}</span>
    //   ),
    // },

    //     {
    //       field: "lastLogin",
    //       headerName: "Last Login",
    //       headerClassName: "bg-[#1A6FAB] text-white",
    //       minWidth: 250,
    //       flex: 1,
    //       renderCell: (params) => {
    //         const ip = params.value?.ip || "--";
    //         const fullDate = params.value?.date || "--";
    //         const dateOnly = fullDate !== "--" ? fullDate.split(" ")[0] + " " + fullDate.split(" ")[1] + " " + fullDate.split(" ")[2] : "--";
    //         return <span>{ip} | {dateOnly}</span>;
    //       },
    //     }
    // ,
    {
      field: "createdAt",
      headerName: "Added At",
      headerClassName: "bg-[#1A6FAB] text-white",
      width: 250,
      renderCell: (params) => <span>{format_dd_mmm_yyyy(params.value)}</span>,
    },

    {
      field: "Action",
      headerName: "Action",
      headerClassName: "bg-[#1A6FAB] text-white",
      minWidth: 350,
      flex: 1,
      editable: false,
      renderCell: (params) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" size="icon" className="group">
                <EllipsisIcon className="text-blue-primary-200 group-hover:text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => navigateToBatchfollow(params.row)}
              >
                <PlusIcon className="size-4 mr-2" />
                <span>Batch Follow</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const fetchData = async ({ page, pageSize, search, sortBy, order, tab }) => {
    const params = {
      limit: pageSize,
      page: page + 1,
      search,
      sortBy,
      order,
    };

    if (tab === "Active") params.status = "Active";
    if (tab === "Inactive") params.status = "Inactive";

    const response = await apiService.get(`${APIS.PROFILE}/students`, {
      params,
    });

    if (response?.data?.students?.length) {
      const studentProfiles = response.data.students.map((profile) => ({
        ...profile,
        id: profile._id,
        name: profile.name || "--",
        email: profile.email || "--",
        mobile: profile.mobile || "--",
        class: profile.class || null,
        sections: profile.sections || [],
        subjects: profile.subjects || [],
        institutes: profile.institution || {},
        batchCreated: profile.batchCodes?.join(", ") || "--",
        batchFollow: profile.batchfollow?.join(", ") || "--",
        status: profile.status || "--",
        createdAt: profile.createdAt || null,
        lastLogin: {
          ip: profile.lastLogin?.ip || "--",
          date: profile.lastLogin?.date || "--",
        },
      }));

      return {
        data: studentProfiles,
        totalCount: response.data.pagination?.total || 0,
      };
    }

    return { data: [], totalCount: 0 };
  };

  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <TableListView
          columns={columns}
          fetchData={fetchData}
          searchPlaceholder="Search"
          defaultPageSize={10}
          defaultSortField="createdAt"
          defaultSortOrder="desc"
          paginationMode="server"
        />
      </QueryClientProvider>

      {confirmationPopup.isOpen && (
        <PopupAlert
          open={confirmationPopup.isOpen}
          setOpen={() =>
            setConfirmationPopup({ ...confirmationPopup, isOpen: false })
          }
          title="Confirm Action"
          message={`Are you sure you want to mark this student as ${confirmationPopup.action}?`}
          onConfirm={() => handleConfirmationResponse(true)}
          onCancel={handleCancelUpdate}
          submitTxt="Yes"
          cancelTxt="No"
        />
      )}

      <AlertDialogBox
        isOpen={isDialogOpen}
        title="Are you absolutely sure you want to delete?"
        description="This action cannot be undone."
        onConfirm={handleConfirm}
        onCancel={() => setIsDialogOpen(false)}
        submitBtnText="Delete"
      />
    </div>
  );
};

export default StudentListView;
