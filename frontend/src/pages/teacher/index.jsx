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

const TeacherListView = () => {
  const { updateBreadcrumb } = useBreadcrumb();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [classId, setClassId] = useState();
  const [confirmationPopup, setConfirmationPopup] = useState({
    isOpen: false,
    row: null,
    action: null,
  });
  const [openDialog, setOpenDialog] = useState(false);

  const navigate = useNavigate();
  const handleConfirm = async () => {
    try {
      const response = await apiService.delete(`${APIS.PROFILE}/${classId}`);
      if (response?.code === 200 && response?.status === true) {
        toast.success(response?.message);

        setIsDialogOpen(false);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setIsDialogOpen(false);
        toast.error(response?.message);
      }
    } catch (error) {
      setIsDialogOpen(false);
      toast.error(error?.response?.data?.message);
    }
  };
  const navigateToEdit = (rowData) => {
    navigate(`${ROUTES.UPDATE_Teacher}/${rowData?._id}`, {
      state: { isEditeActive: true },
    });
  };

  const handleViewUser = async (id, name, email, mobile) => {
    // navigate(USERS.USER_PREVIEW, {
    //   state: { id: id, name: name, email: email, mobile: mobile },
    // });
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };
  useEffect(() => {
    const breadcrumbData = [{ label: "Teacher" }];
    updateBreadcrumb(breadcrumbData);
  }, []);
  const handleStatusToggle = async (row, status) => {
    let payload = {};

    switch (status) {
      case "Active":
        payload = { isActive: true };
        break;
      case "Inactive":
        payload = { isActive: false };
        break;
      default:
        break;
    }

    try {
      const response = await patchApi(APIS.PROFILE, row._id, payload);

      if (response?.status === true && response?.code === 200) {
        toast.success(`Class marked as ${status} successfully`);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      // Catch any error including Axios thrown errors
      toast.error(error?.response?.message || error?.message);
    }
  };
  const navigateToBatchcreate = (rowData) => {
    navigate(`/batch-created/${rowData?.id}`, {
      state: { supplierId: rowData?.id },
    });
  };
  const navigateToBatchfollow = (rowData) => {
    navigate(`/batch-follow/${rowData?.id}`, {
      state: { supplierId: rowData?.id },
    });
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
            {params.value.map((classs) => classs.nameEn).join(", ")}
          </span>
          {params.value?.nameEn && (
            <div className="absolute hidden group-hover:block bg-white p-2 rounded shadow-lg z-10">
              {params.value.map((classs) => classs.nameEn).join(", ")}
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
      field: "institutes",
      headerName: "Institute",
      headerClassName: "bg-[#1A6FAB] text-white",
      width: 250,
      renderCell: (params) => (
        <div className="relative group">
          <span className="truncate block max-w-[250px]">
            {params.value?.institutesName || params.value?.description || "--"}
          </span>
          {(params.value?.institutesName || params.value?.description) && (
            <div className="absolute hidden group-hover:block bg-white p-2 rounded shadow-lg z-10">
              {params.value?.institutesName || params.value?.description}
            </div>
          )}
        </div>
      ),
    },

    {
      field: "batchCode",
      headerName: "Batch Codes",
      headerClassName: "bg-[#1A6FAB] text-white",
      width: 250,
      renderCell: (params) => {
        return (
          <span>
            {params.row.batchCreated && params.row.batchCreated !== ""
              ? params.row.batchCreated
              : "--"}
          </span>
        );
      },
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
                onClick={() => navigateToBatchcreate(params.row)}
              >
                <PlusIcon className="size-4 mr-2" />
                <span>Batch Created</span>
              </DropdownMenuItem>
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
  const showConfirmationPopup = (row, action) => {
    setConfirmationPopup({
      isOpen: true,
      row,
      action,
    });
  };
  const fetchData = async ({ page, pageSize, search, sortBy, order, tab }) => {
    const params = {
      limit: pageSize,
      page: page + 1,
      search,
      sortBy,
      order,
      status:
        tab === "Active" ? "active" : tab === "Inactive" ? "inactive" : null,
    };

    try {
      const response = await apiService.get(`${APIS.PROFILE}/teachers`, {
        params,
      });

      if (response?.data?.teachers?.length) {
        const mappedData = response.data.teachers.map((teacher) => ({
          id: teacher._id,
          name: teacher.name || "--",
          email: teacher.email || "--",
          mobile: teacher.mobile || "--",
          class: teacher.class || null,
          sections: teacher.sections || [],
          subjects: teacher.subjects || [],
          institutes: teacher.institution || {},
          batchCreated: teacher.batchCodes?.join(", ") || "--",
          batchFollow: teacher.batchfollow?.join(", ") || "--",
          status: teacher.status || "--",
          createdAt: teacher.createdAt || null,
          lastLogin: {
            ip: teacher.lastLogin?.ip || "--",
            date: teacher.lastLogin?.date || "--",
          },
        }));

        return {
          data: mappedData,
          totalCount: response.data.pagination?.total || 0,
        };
      }
      return { data: [], totalCount: 0 };
    } catch (error) {
      return { data: [], totalCount: 0 };
    }
  };
  const handleAddUser = () => {
    navigate(`${ROUTES.USER}`, { state: { userRole: "teacher" } });
  };
  const handleCancelUpdate = () => {
    setConfirmationPopup({
      isOpen: false,
      row: null,
      action: null,
    });
  };
  const handleConfirmationResponse = (isConfirmed) => {
    if (isConfirmed && confirmationPopup.row) {
      handleStatusToggle(confirmationPopup.row, confirmationPopup.action);
    }

    setConfirmationPopup({
      isOpen: false,
      row: null,
      action: null,
    });
  };
  const handleDeleteUser = (id) => {
    setClassId(id);
    setIsDialogOpen(true);
  };
  return (
    <div className="">
      <QueryClientProvider client={queryClient}>
        <TableListView
          columns={columns}
          fetchData={fetchData}
          searchPlaceholder="Search"
          defaultPageSize={10}
          defaultSortField="createdAt"
          defaultSortOrder="desc"
        />
      </QueryClientProvider>
      {confirmationPopup.isOpen && (
        <PopupAlert
          open={confirmationPopup.isOpen}
          setOpen={setOpenDialog}
          title="Confirm Action"
          message={`Are you sure, you want to mark this Teacher as ${confirmationPopup.action}?`}
          onConfirm={() => handleConfirmationResponse(true)} // Yes
          onCancel={handleCancelUpdate}
          submitTxt="Yes"
          cancelTxt="No"
        />
      )}
      <AlertDialogBox
        isOpen={isDialogOpen}
        title="Are you absolutely sure for delete?"
        description="This action cannot be undone."
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        submitBtnText="Delete"
      />
    </div>
  );
};

export default TeacherListView;
