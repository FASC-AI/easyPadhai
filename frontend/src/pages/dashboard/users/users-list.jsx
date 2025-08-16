import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { useBreadcrumb } from "@/components/ui/breadcrumb/breadcrumb-context";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Correct import
import TableListView from "@/components/ui/table-list-view/table-list-view";
import useStore from "@/store";
import {
  EllipsisIcon,
  PencilIcon,
  UserRoundCheck,
  UserRoundX,
} from "lucide-react";
import { APIS } from "@/constants/api.constant";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { format_dd_mmm_yyyy } from "@/components/functions/date-format";
import { toTitleCase } from "@/components/functions/tittle-case";
import { AlertDialogBox } from "@/components/ui/dialog";
import apiService from "@/lib/apiService";
import { USERS } from "./config";
import { toast } from "sonner";
import { Tooltip } from "@mui/material";
import { CustomFilter } from "@/components/common/CustomFilter";
import moment from "moment";

const queryClient = new QueryClient();
const USERS_QUERY_KEY = "users";

const UsersListView = () => {
  const { user } = useStore();
  const [filterRole, setRole] = useState("editor");
  const { updateBreadcrumb, breadcrumbData } = useBreadcrumb();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [actionStatus, setActionStatus] = useState("Inactive");
  const [tableParams, setTableParams] = useState({
    page: 0,
    pageSize: 10,
    search: "",
    sortBy: "createdAt",
    order: "desc",
    tab: "all",
    role: "editor",
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.error) {
      toast.error(location.state.error);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const getOptionLabel = (option) => option.label;
  const getOptionValue = (option) => option.value;

  const handleConfirm = async () => {
    try {
      const response = await apiService.patch(
        `${APIS.UPDATE_STATUS}/${userId}`,
        {
          status: actionStatus,
        }
      );
      console.log("Status update response:", response);
      queryClient.invalidateQueries({ queryKey: ["dynamicData"] });
      if (response?.code === 200 && response?.status === true) {
        toast.success(
          response?.message ||
            `User ${
              actionStatus.toLowerCase() === "active"
                ? "activated"
                : "inactivated"
            } successfully`
        );
        setIsDialogOpen(false);
        updateUserInCache(userId, actionStatus);
        await queryClient.invalidateQueries({
          queryKey: [USERS_QUERY_KEY],
          exact: false,
        });
      } else {
        setIsDialogOpen(false);
        toast.error(response?.message || "Failed to update status");
      }
    } catch (error) {
      setIsDialogOpen(false);
      toast.error(error?.response?.data?.message || "Server error");
    }
  };

  const updateUserInCache = (userId, newStatus) => {
    queryClient.setQueryData([USERS_QUERY_KEY], (oldData) => {
      if (!oldData) return oldData;
      console.log(`Updating cache for user ${userId} to status ${newStatus}`);
      return {
        ...oldData,
        data: oldData.data.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        ),
      };
    });
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  const handleStatusChange = (id, status) => {
    setUserId(id);
    setActionStatus(status);
    setIsDialogOpen(true);
  };

  useEffect(() => {
    const newBreadcrumbData = [
      { label: "Users", href: "/users" },
      { label: "User", href: "/users" },
    ];
    if (JSON.stringify(breadcrumbData) !== JSON.stringify(newBreadcrumbData)) {
      updateBreadcrumb(newBreadcrumbData);
    }
  }, [updateBreadcrumb, breadcrumbData]);

  const columns = [
    {
      field: "name",
      headerName: "Name",
      headerClassName: "bg-[#1A6FAB] text-white",
      minWidth: 250,
      flex: 1,
      renderCell: (params) => {
        const imageUrl =
          params.row.picture || "https://via.placeholder.com/150";
        const value = params.value || "";
        const truncatedValue =
          value.length > 15 ? value.substring(0, 15) + "..." : value;

        return (
          <div className="flex items-center space-x-2">
            {/* {imageUrl && (
              <img
                src={imageUrl}
                alt={value}
                className="w-8 h-8 rounded object-cover border border-gray-200"
              />
            )} */}
            <Avatar className="border">
              <AvatarImage src={imageUrl} />
              <AvatarFallback>{truncatedValue[0]}</AvatarFallback>
            </Avatar>
            <span title={value}>{truncatedValue}</span>
          </div>
        );
      },
    },
    { field: "email", headerName: "Email", width: 250 },
    {
      field: "mobile",
      headerName: "Mobile",
      width: 120,
      renderCell: (params) => <span>{toTitleCase(params.value || "-")}</span>,
    },
    {
      field: "userRole",
      headerName: "Role",
      width: 120,
      renderCell: (params) =>
        params.value ? (
          <span>{toTitleCase(params.value)}</span>
        ) : (
          <span>-</span>
        ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => {
        const status = params.value ? params.value.trim() : params.value;
        console.log(`User ${params.row.id} status: ${status}`);
        let statusClass;

        switch (status) {
          case "Active":
            statusClass = "bg-green-100 text-green-800";
            break;
          case "Inactive":
            statusClass = "bg-red-100 text-red-800";
            break;
          case "Pending":
            statusClass = "bg-yellow-100 text-yellow-800";
            break;
          case "Invited":
            statusClass = "bg-blue-100 text-blue-800";
            break;
          default:
            statusClass = "bg-gray-100 text-gray-800";
        }
        return (
          <span className={`px-2 py-1 rounded text-xs ${statusClass}`}>
            {toTitleCase(status || "Unknown")}
          </span>
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 180,
      renderCell: (params) => (
        <span>{format_dd_mmm_yyyy(params.value) || "-"}</span>
      ),
    },
    {
      field: "lastLogin",
      headerName: "Last Login",
      minWidth: 200,
      width: 200,
      renderCell: (params) => {
        const ip = params.value?.ip || "--";
        const date = params.value?.date
          ? moment
              .utc(params.value?.date)
              .utcOffset("+05:30")
              .format("DD MMM, YYYY HH:mm:ss")
          : "--";
        const displayText = `${ip} | ${date}`;

        return (
          <Tooltip title={displayText} arrow placement="top">
            <span
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "inline-block",
                width: "100%",
              }}
            >
              {displayText}
            </span>
          </Tooltip>
        );
      },
    },
    ...(user.userRole === "admin"
      ? [
          {
            field: "Action",
            headerName: "Action",
            headerClassName: "super-app-theme--header hide-img-bordersvg",
            minWidth: 100,
            flex: 1,
            editable: false,
            renderCell: (params) => {
              const status = params.row.status
                ? params.row.status.trim()
                : params.row.status;

              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 w-9 group mt-2 cursor-pointer">
                      <EllipsisIcon className="text-blue-600" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {status === "Active" ? (
                      <>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/users/edit/${params.row.userId}`);
                          }}
                          className="text-gray-600 hover:bg-gray-50"
                        >
                          <PencilIcon className="w-4 h-4 mr-2" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(params.row.userId, "Inactive")
                          }
                          className="text-red-600 hover:bg-red-50"
                        >
                          <UserRoundX className="w-4 h-4 mr-2" />
                          <span>Inactive</span>
                        </DropdownMenuItem>
                      </>
                    ) : status === "Inactive" ? (
                      <>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/users/edit/${params.row.userId}`);
                          }}
                          className="text-gray-600 hover:bg-gray-50"
                        >
                          <PencilIcon className="w-4 h-4 mr-2" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(params.row.userId, "Active")
                          }
                          className="text-green-600 hover:bg-green-50"
                        >
                          <UserRoundCheck className="w-4 h-4 mr-2" />
                          <span>Active</span>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(
                              `/users/edit/${
                                params.row.userId || params.row.id
                              }`
                            );
                          }}
                          className="text-gray-600 hover:bg-gray-50"
                        >
                          <PencilIcon className="w-4 h-4 mr-2" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            },
          },
        ]
      : []),
  ];

  const tabs = [
    { label: "All", value: "all" },
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
    { label: "Pending", value: "Pending" },
  ];

  const fetchData = async ({ page, pageSize, search, sortBy, order, tab }) => {
    const params = {
      sortBy,
      order,
      status: tab !== "all" ? tab : null,
      role: filterRole || null,
    };
    if (search) {
      params.search = search;
    }
    if (!search) {
      params.limit = pageSize;
      params.page = page + 1;
    }
    if (user.userRole && user.userRole !== "admin") {
      params.role = user.userRole;
    }
    console.log("API params:", params);
    try {
      const response = await apiService.get(`${APIS.PROFILE}`, { params });
      let profiles = response.data.profiles || [];

      // Additional frontend filtering as a fallback
      if (
        user.userRole &&
        user.userRole !== "admin" &&
        user.userRole !== "editor"
      ) {
        profiles = profiles.filter(
          (profile) => profile.userRole === user.userRole
        );
      }
      return {
        data: profiles.map((row) => ({
          ...row,
          id: row._id,
          status: row.status ? row.status.trim() : row.status,
        })),
        totalCount: response.data.pagination.total,
      };
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch users");
      throw error;
    }
  };

  const handleAddUser = () => {
    navigate(USERS.ADD_USERS);
  };

  const handleTableStateChange = (newState) => {
    setTableParams((prev) => ({ ...prev, ...newState }));
  };

  const staticServiceTypes = [
    { value: "editor", label: "Editor" },
    { value: "teacher", label: "Teacher" },
    { value: "student", label: "Student" },
  ];

  const fetchRole = async (inputValue) => {
    return staticServiceTypes.filter((serviceType) =>
      serviceType.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <TableListView
          columns={columns}
          tabs={tabs}
          fetchData={fetchData}
          searchPlaceholder="Search"
          defaultPageSize={10}
          defaultSortField="createdAt"
          defaultSortOrder="desc"
          onAddItem={handleAddUser}
          addButtonText="Add User"
          queryKey={USERS_QUERY_KEY}
          onStateChange={handleTableStateChange}
          refetchKey={filterRole}
          customFilter={() => (
            <>
              <div className="flex items-center space-x-4">
                <div className="w-[150px]">
                  <CustomFilter
                    fetchData={fetchRole}
                    selectedValues={filterRole}
                    onSelect={(value) => setRole(value || null)}
                    label="Role"
                    isMulti={false}
                    searchable={true}
                    getOptionLabel={getOptionLabel}
                    getOptionValue={getOptionValue}
                  />
                </div>
              </div>
            </>
          )}
        />

        <AlertDialogBox
          isOpen={isDialogOpen}
          title="Status"
          description={`Are you sure to ${actionStatus.toLowerCase()} this user?`}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          submitBtnText={actionStatus}
        />
      </QueryClientProvider>
    </div>
  );
};

export default UsersListView;
