import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useBreadcrumb } from "@/components/ui/breadcrumb/breadcrumb-context";
import { useEffect, useState, useContext } from "react";
import TableListView from "@/components/ui/table-list-view/table-list-view";
import { ChevronDown, Settings2Icon } from "lucide-react";
import {
  EllipsisIcon, EyeIcon, PencilIcon, UserRoundCheck,
  UserRoundX,
} from "lucide-react"; 
import PaginatedTableView from "@/components/paginated-table-view";
import DataCharectersTooltip from "@/components/ui/DataCharectersTooltip";
import { Link } from "react-router-dom";
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
import { format_dd_mmm_yyyy } from "@/components/functions/date-format";
import { toTitleCase } from "@/components/functions/tittle-case";
import { AlertDialogBox } from "@/components/ui/dialog";
import { Trash2Icon } from "lucide-react";
import apiService from "@/lib/apiService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { APIS } from "@/constants/api.constant";
import ROUTES from "@/constants/route.constant";
import PopupAlert from '@/components/common/PopupAlert/PopupAlert';
import { getApi, patchApi } from '@/services/method';

import { CounterContext } from "@/components/Layout/commonLayout/TitleOfPageProvider";
const queryClient = new QueryClient();

const InstructionListView = () => {
  const { updateBreadcrumb } = useBreadcrumb();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [InstructionId, setInstructionId] = useState();
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmationPopup, setConfirmationPopup] = useState({
    isOpen: false,
    row: null,
    action: null,
  });
  let setCount = useContext(CounterContext);
  useEffect(() => {
    setCount = "Instruction";
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
      const response = await patchApi(APIS.INSTRUCTION, row._id, payload);
      
      // Axios auto-throws on non-2xx, so if we're here, it's 2xx
      if (response?.status === true && response?.code === 200) {
        toast.success(`Instruction has been marked as ${status} successfully`);
        setTimeout(() => {
          window.location.reload();
        }, 1000);

      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      // Catch any error including Axios thrown errors
      toast.error(
        error?.response?.message ||
        error?.message
      );
    }
  };

  const handleConfirm = async () => {
    try {
      const response = await apiService.delete(`${APIS.INSTRUCTION}/${InstructionId}`);
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
    navigate(`${ROUTES.UPDATE_INSTRUCTION}/${rowData?._id}`, {
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
    const breadcrumbData = [{ label: "Instruction" }];
    updateBreadcrumb(breadcrumbData);
  }, []);

  const columns = [
    // {
    //   field: "codee",
    //   headerName: "Code",
    //   width: 250,
    //   headerClassName: "bg-[#1A6FAB] text-white",
    //   renderCell: (params) => <span>{params.value}</span>,
    // },
   {
  field: "InstructionsName",
  headerName: "Name",
  width: 250,
  headerClassName: "bg-[#1A6FAB] text-white",
  renderCell: (params) => {
    const text = params.value || "";
    return (
      <div className="truncate w-full">
        {text.length >= 25 ? (
          <DataCharectersTooltip text={text} maxLength="25" />
        ) : (
          <span>{text}</span>
        )}
      </div>
    );
  },
},
    {
      field: "type",
      headerName: "Type",
      width: 250,
      headerClassName: "bg-[#1A6FAB] text-white",
      renderCell: (params) => <span>{params.value}</span>,
    },
    {
      field: "classes",
      headerName: "Class",
      width: 250,
      headerClassName: "bg-[#1A6FAB] text-white",
      renderCell: (params) => {
        const items = params.value || [];
        const maxVisible = 2; // Maximum number of items to show
        const visibleItems = items.slice(0, maxVisible);
        const hiddenCount = items.length - maxVisible;

        return (
          <div className="flex flex-wrap gap-1">
            {visibleItems.map((item, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                {item.nameEn}
              </span>
            ))}
            {hiddenCount > 0 && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                +{hiddenCount} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      field: "subjects",
      headerName: "Subject",
      width: 250,
      headerClassName: "bg-[#1A6FAB] text-white",
      renderCell: (params) => {
        const items = params.value || [];
        const maxVisible = 2; // Maximum number of items to show
        const visibleItems = items.slice(0, maxVisible);
        const hiddenCount = items.length - maxVisible;

        return (
          <div className="flex flex-wrap gap-1">
            {visibleItems.map((item, index) => (
              <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                {item.nameEn}
              </span>
            ))}
            {hiddenCount > 0 && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                +{hiddenCount} more
              </span>
            )}
          </div>
        );
      },
    },
      // {
      //   field: "description",
      //   headerName: "Description",
      //     headerClassName: "bg-[#1A6FAB] text-white",
      //     minWidth: 350,
      //     flex: 1,
      //     renderCell: (params) => {
      //       const plainText = params.value?.replace(/<[^>]*>/g, '') || '';
      //       return (
      //         <Link to={``} state={{ id: params.row._id }}>
      //           {plainText.length >= 25 ? (
      //             <DataCharectersTooltip text={plainText} maxLength="25" />
      //           ) : (
      //             plainText
      //           )}
      //         </Link>
      //       );
      //     },
      //   },
       {
      field: "status",
      headerName: "Status",
      headerClassName: "bg-[#1A6FAB] text-white",
      width: 200,
      renderCell: (params) => {
        const status = params.value;

        let color = "gray";
        if (status === "Active") color = "green";
        else if (status === "Inactive") color = "red";

        return <span style={{ color }}>{status}</span>;
      },
    },
    {
      field: "Action",
      headerName: "Action",
      headerClassName: "bg-[#1A6FAB] text-white ",
      minWidth: 150,
      flex: 1,
      editable: false,
      renderCell: (params) => {
        const isInactive = params.row.status === 'Inactive';
        const isActive = params.row.status === 'Active';
        return (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" size="icon" InstructionName="group">
                <EllipsisIcon InstructionName="text-blue-primary-200" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => navigateToEdit(params.row)}
                disabled={isInactive}
              >
                <PencilIcon InstructionName="size-4 mr-2" />
                <span>Edit</span>
              </DropdownMenuItem>
              {/* <DropdownMenuItem onClick={() => showConfirmationPopup(params.row, "Active")}
                disabled={isActive}
              >

                <UserRoundCheck className="size-4 mr-2" />
                <span> Active</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => showConfirmationPopup(params.row, "Inactive")}
                disabled={isInactive}>
                <UserRoundX className="size-4 mr-2" />
                <span>Inactive</span>
              </DropdownMenuItem> */}
               {isActive ? (
                          <DropdownMenuItem onClick={() => showConfirmationPopup(params.row, "Inactive")}>
                            <UserRoundX className="size-4" />
                            <span>Inactive</span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => showConfirmationPopup(params.row, "Active")}>
                            <UserRoundCheck className="size-4 " />
                            <span>Active</span>
                          </DropdownMenuItem>
                        )}
              <DropdownMenuItem
                onClick={() => handleDeleteUser(params.row._id)}
                disabled={isInactive}
              >
                <TrashIcon InstructionName="size-4 mr-2" />
                <span>Delete</span>
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
  const HEAD_BUTTONS = [
    // {
    //   label: 'Total Stock',
    //   children: (
    //     <div InstructionName={cn(buttonVariants(), '')}>
    //       Total Stock: {totalStock}
    //     </div>
    //   ),
    // },
    {
      label: "Add Instruction",
      children: (
        <Button
          onClick={() => handleAddUser()}
          InstructionName="bg-[#1A6FAB] text-white hover:bg-[#1A6FAB] hover:text-white"
        >
          + Add Instruction
        </Button>
      ),
    },
    {
      label: "More",
      children: (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="outline" size="icon" InstructionName="group">
              <EllipsisIcon InstructionName="text-blue-primary-200" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExportCSV()}>
              <FileUpIcon InstructionName="size-4 mr-2" />
              <span>Export CSV</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const fetchData = async ({ page, pageSize, search, sortBy, order, tab }) => {
    const params = {
      limit: pageSize,
      page: page + 1,
      search,
      sortBy,
      order,
      isInbound: tab === "inbound" ? true : null,
    };
    if (tab === 'Active') {
      params.isActive = true;

    } else if (tab === 'Inactive') {
      params.isActive = false;

    }
    const response = await apiService.get(`${APIS.INSTRUCTION_LIST}`, {
      params,
    });
 
    return {
      data: response.data.instruction.map((row) => {
        let status = "Active"; // default

        if (row.isActive) status = "Active";
        else if (!row.isActive) status = "Inactive";

        return { ...row, id: row._id, status }
      }),
      totalCount: response.data.count || 0,
    };
  };
  const handleAddUser = () => {
    navigate(ROUTES.INSTRUCTION);
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
    setInstructionId(id);
    setIsDialogOpen(true);
  };
  return (
    <div InstructionName="">
      <QueryClientProvider client={queryClient}>
        <TableListView
          columns={columns}
          tabs={[
            { label: 'All', value: 'all' },
            { label: 'Active', value: 'Active' },
            { label: 'Inactive', value: 'Inactive' },
          ]}
          fetchData={fetchData}
          searchPlaceholder="Search"
          defaultPageSize={10}
          defaultSortField="createdAt"
          defaultSortOrder="desc"
          onAddItem={handleAddUser}
          addButtonText="Add Instruction"
        />
      </QueryClientProvider>
      {/* <PaginatedTableView
        queryKey={[`routes ${1} `, JSON.stringify('1')]}
        queryFn={fetchData}
        columns={columns}
        pageName="Crew"
        headButtons={HEAD_BUTTONS}
      
        tabs={[
          { label: 'All', value: 'all' },


        ]}
      /> */}
            {confirmationPopup.isOpen && (
                    <PopupAlert
                      open={confirmationPopup.isOpen}
                      setOpen={setOpenDialog}
                      title="Status"
                      message={`Are you sure, you want to mark this Instruction as ${confirmationPopup.action}?`}
                      onConfirm={() => handleConfirmationResponse(true)} // Yes
                      onCancel={handleCancelUpdate}
                      submitTxt="Yes"
                      cancelTxt="No"
                    />
                  )}
      <AlertDialogBox
        isOpen={isDialogOpen}
        title="Delete"
        description="Are you absolutely sure for delete? This action cannot be undone."
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        submitBtnText="Delete"
      />
    </div>
  );
};

export default InstructionListView;