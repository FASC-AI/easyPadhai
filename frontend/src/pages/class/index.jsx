import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useBreadcrumb } from "@/components/ui/breadcrumb/breadcrumb-context";
import { useEffect, useState, useContext, useCallback } from "react";
import { Tooltip } from "@mui/material";
import {
  ChevronDown,
  EllipsisIcon,
  PencilIcon,
  UserRoundCheck,
  UserRoundX,
} from "lucide-react";
import { useParams } from "react-router-dom";
import PopupAlert from "@/components/common/PopupAlert/PopupAlert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import apiService from "@/lib/apiService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { APIS } from "@/constants/api.constant";
import ROUTES from "@/constants/route.constant";
import { CounterContext } from "@/components/Layout/commonLayout/TitleOfPageProvider";

// TableListView component with pagination, drag-and-drop, and debounced search
const TableListView = ({
  columns,
  tabs,
  fetchData,
  searchPlaceholder,
  defaultPageSize,
  defaultSortField,
  defaultSortOrder,
  onAddItem,
  addButtonText,
  isDraggable,
  onDragEnd,
}) => {
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState(defaultSortField);
  const [order, setOrder] = useState(defaultSortOrder);
  const [activeTab, setActiveTab] = useState(tabs[0].value);
  const [loading, setLoading] = useState(false);
  const [dragId, setDragId] = useState(null);

  const pageSizeOptions = [5, 10, 25, { value: -1, label: "All" }];

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // Modified fetchTableData to bypass pagination when searching
  const fetchTableData = useCallback(async () => {
    setLoading(true);
    try {
      // Set pageSize to undefined when search is non-empty to fetch all data
      const effectivePageSize = debouncedSearch
        ? undefined
        : pageSize === -1
        ? undefined
        : pageSize;
      const response = await fetchData({
        page: debouncedSearch ? 0 : page, // Reset page to 0 when searching
        pageSize: effectivePageSize,
        search: debouncedSearch,
        sortBy,
        order,
        tab: activeTab,
      });
      setData(response.data);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(error?.message || "Failed to fetch classes");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, sortBy, order, activeTab, fetchData]);

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  const handleDragStart = (e, id) => {
    setDragId(id);
    e.dataTransfer.setData("text/plain", id);
    e.target.style.opacity = "0.5";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.target.closest("tr").style.backgroundColor = "#e0e0e0";
  };

  const handleDragLeave = (e) => {
    e.target.closest("tr").style.backgroundColor = "";
  };

  const handleDrop = async (e, targetId) => {
    e.preventDefault();
    e.target.closest("tr").style.backgroundColor = "";
    e.target.closest("tr").style.opacity = "1";
    if (dragId === targetId) return;

    const draggedIndex = data.findIndex((row) => row.id === dragId);
    const targetIndex = data.findIndex((row) => row.id === targetId);

    const newData = [...data];
    const [draggedItem] = newData.splice(draggedIndex, 1);
    newData.splice(targetIndex, 0, draggedItem);

    // Update the order field for all items
    const updatedData = newData.map((item, index) => ({
      ...item,
      order: index,
    }));

    setData(updatedData);
    setDragId(null);

    if (onDragEnd) {
      await onDragEnd({
        oldIndex: draggedIndex,
        newIndex: targetIndex,
        newData: updatedData,
      });
    }
  };

  // Disable drag-and-drop when searching or not in "All" pageSize
  const isDragEnabled = isDraggable && pageSize === -1 && !debouncedSearch;

  return (
    <div className="table-list-view">
      <div className="header flex justify-between items-center mb-4">
        <div className="tabs flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              className={`tab px-4 py-2 border border-gray-300 rounded-md cursor-pointer ${
                activeTab === tab.value
                  ? "bg-[#1A6FAB] text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => {
                setActiveTab(tab.value);
                setPage(0);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="controls flex gap-2 items-center">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A6FAB]"
          />
          <Button
            onClick={onAddItem}
            className="bg-[#1A6FAB] text-white hover:bg-[#175A8F] px-4 py-2 rounded-md"
          >
            {addButtonText}
          </Button>
        </div>
      </div>
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Loading classes...</span>
        </div>
      ) : data.length === 0 ? (
        <div className="empty-state">No classes found.</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.field}
                  className={col.headerClassName}
                  style={{ width: col.width }}
                  onClick={() => {
                    if (col.field !== "Action") {
                      setSortBy(col.field);
                      setOrder(order === "asc" ? "desc" : "asc");
                    }
                  }}
                >
                  {col.headerName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row.id}
                draggable={isDragEnabled}
                onDragStart={(e) => isDragEnabled && handleDragStart(e, row.id)}
                onDragOver={isDragEnabled ? handleDragOver : undefined}
                onDragLeave={isDragEnabled ? handleDragLeave : undefined}
                onDrop={(e) => isDragEnabled && handleDrop(e, row.id)}
                style={{ cursor: isDragEnabled ? "move" : "default" }}
              >
                {columns.map((col) => (
                  <td key={col.field} style={{ width: col.width }}>
                    {col.renderCell
                      ? col.renderCell({ row, value: row[col.field] })
                      : row[col.field]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Conditionally render pagination controls when search is empty */}
      {!debouncedSearch && (
        <div className="pagination flex items-center gap-2 mt-4">
          <span>Rows per page:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-white border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-[#1A6FAB]"
              >
                {pageSize === -1 ? "All" : pageSize} <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border border-gray-200 rounded-md shadow-lg">
              {pageSizeOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value || option}
                  onClick={() => {
                    setPageSize(option.value || option);
                    setPage(0);
                  }}
                  className="text-gray-700 hover:bg-gray-100 cursor-pointer px-4 py-2"
                >
                  {option.label || option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <span>
            {totalCount > 0
              ? `${
                  page * (pageSize === -1 ? totalCount : pageSize) + 1
                }-${Math.min(
                  (page + 1) * (pageSize === -1 ? totalCount : pageSize),
                  totalCount
                )} of ${totalCount}`
              : "0-0 of 0"}
          </span>
          <Button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="bg-[#1A6FAB] text-white hover:bg-[#175A8F]"
          >
            Previous
          </Button>
          <Button
            disabled={pageSize === -1 || (page + 1) * pageSize >= totalCount}
            onClick={() => setPage(page + 1)}
            className="bg-[#1A6FAB] text-white hover:bg-[#175A8F]"
          >
            Next
          </Button>
        </div>
      )}
      <style jsx>{`
        .table-list-view {
          padding: 16px;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        .data-table th,
        .data-table td {
          padding: 8px;
          border: 1px solid #ddd;
          font-size: 0.75em;
        }
        .data-table th {
          background-color: #1a6fab;
          color: white;
          text-align: left;
        }
        tr[draggable="true"]:hover {
          background-color: #f0f0f0;
        }
        .loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          gap: 10px;
        }
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #1a6fab;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
        }
        .empty-state {
          text-align: center;
          padding: 20px;
          color: #666;
          font-size: 1em;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
      <style jsx global>{`
        .responsive-table-wrapper {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .custom-tooltip-content {
          display: block !important;
          vertical-align: middle !important;
          padding: 4px 6px !important;
          font-size: 0.75em !important;
          line-height: 1.2 !important;
          max-width: 300px !important;
          max-height: 200px !important;
          overflow-y: auto !important;
          overflow-x: auto !important;
          white-space: normal !important;
        }
        .responsive-table-wrapper .data-table th,
        .responsive-table-wrapper .data-table td {
          padding: 4px 6px !important;
          font-size: 0.75em !important;
          line-height: 1.2 !important;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .responsive-table-wrapper .data-table tr {
          height: 36px !important;
        }
        @media (max-width: 768px) {
          .responsive-table-wrapper .data-table th,
          .responsive-table-wrapper .data-table td {
            padding: 3px 5px !important;
            font-size: 0.7em !important;
          }
          .responsive-table-wrapper .data-table tr {
            height: 32px !important;
          }
        }
        @media (max-width: 480px) {
          .responsive-table-wrapper .data-table th,
          .responsive-table-wrapper .data-table td {
            padding: 2px 4px !important;
            font-size: 0.65em !important;
          }
          .responsive-table-wrapper .data-table tr {
            height: 28px !important;
          }
        }
      `}</style>
    </div>
  );
};

const queryClient = new QueryClient();
const USERS_QUERY_KEY = "classes";

const ClassListView = () => {
  const { updateBreadcrumb } = useBreadcrumb();
  const [confirmationPopup, setConfirmationPopup] = useState({
    isOpen: false,
    row: null,
    action: null,
  });
  const navigate = useNavigate();
  const { id } = useParams();
  const context = useContext(CounterContext);
  const setCount = context?.setCount;

  useEffect(() => {
    if (setCount) {
      setCount("Class");
    } else {
      console.warn(
        "CounterContext is not available. Ensure ClassListView is wrapped in TitleOfPageProvider."
      );
    }
  }, [setCount]);

  useEffect(() => {
    const breadcrumbData = [{ label: "Class" }];
    updateBreadcrumb(breadcrumbData);
  }, [updateBreadcrumb]);

  const navigateToEdit = (rowData) => {
    navigate(`${ROUTES.UPDATE_CLASS}/${rowData?._id}`, {
      state: { isEditActive: true }, // Fixed typo: isEditeActive -> isEditActive
    });
  };

  const handleStatusToggle = async (row, status) => {
    const payload = { isActive: status === "Active" };
    try {
      const response = await apiService.patch(
        `${APIS.CLASS}/${row._id}`,
        payload
      );
      if (response?.status === true && response?.code === 200) {
        toast.success(`Class has been marked as ${status} successfully`);
        queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      } else {
        toast.error(response?.message || "Failed to update status");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    }
  };

  const handleDragEnd = async ({ oldIndex, newIndex, newData }) => {
    console.log("HandleDragEnd:", {
      oldIndex,
      newIndex,
      newData: newData.map((item) => ({
        id: item._id,
        classCode: item.classCode,
      })),
    });
    try {
      const orderPayload = newData.map((cls, index) => ({
        id: cls._id,
        order: index,
      }));
      console.log("Sending reorder payload:", orderPayload);
      const response = await apiService.post(`${APIS.CLASS_REORDER}`, {
        order: orderPayload,
      });
      if (response?.code === 200 && response?.status === true) {
        toast.success("Class order updated successfully");
        queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      } else {
        toast.error(response?.message || "Failed to update class order");
        queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      }
    } catch (error) {
      console.error("Reorder error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update class order"
      );
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    }
  };

  const showConfirmationPopup = (row, action) => {
    setConfirmationPopup({
      isOpen: true,
      row,
      action,
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

  const handleAddUser = () => {
    navigate(ROUTES.CLASS);
  };

  const fetchData = useCallback(
    async ({ page, pageSize, search, sortBy, order, tab }) => {
      console.log("ClassListView fetchData:", {
        page,
        pageSize,
        search,
        sortBy,
        order,
        tab,
      });
      try {
        if (id) {
          const response = await apiService.get(`${APIS.CLASS_LISTById}/${id}`);
          const classes = response?.data?.Classes || [];
          return {
            data: classes.map((cls) => ({
              ...cls,
              id: cls._id,
              status: cls.isActive ? "Active" : "Inactive",
            })),
            totalCount: response?.data?.count || classes.length,
          };
        } else {
          const params = {
            limit: pageSize,
            page: page + 1,
            search: search || undefined,
            sortBy: sortBy || undefined,
            order: order || undefined,
            isInbound: tab === "inbound" ? true : null,
          };
          if (tab === "Active") {
            params.isActive = true;
          } else if (tab === "Inactive") {
            params.isActive = false;
          }
          const response = await apiService.get(APIS.CLASS_LIST, { params });
          const data = response.data.Classes.map((row) => ({
            ...row,
            id: row._id,
            status: row.isActive ? "Active" : "Inactive",
          }));
          console.log(
            "Fetched data:",
            data.map((item) => ({
              id: item._id,
              classCode: item.classCode,
              order: item.order,
            }))
          );
          return {
            data,
            totalCount: response.data.count || 0,
          };
        }
      } catch (error) {
        console.error("Fetch error:", error);
        const message =
          error?.response?.data?.message || "Failed to fetch classes";
        toast.error(message);
        throw new Error(message);
      }
    },
    [id]
  );

  const columns = [
    {
      field: "nameEn",
      headerName: "Name",
      headerClassName: "bg-[#1A6FAB] text-white text-left",
      width: 300,
      renderCell: (params) => {
        const value = params.value || "";
        const isTruncated = value.length > 15;
        const truncated = isTruncated ? `${value.substring(0, 15)}...` : value;

        return (
          <Tooltip
            title={
              isTruncated ? (
                <div className="custom-tooltip-content">{value}</div>
              ) : (
                ""
              )
            }
            arrow
            placement="bottom"
            PopperProps={{
              sx: {
                "& .MuiTooltip-tooltip": {
                  backgroundColor: "#fff",
                  color: "#000",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15) !important",
                  borderRadius: "4px",
                  padding: "6px 8px",
                  fontSize: "0.75em",
                  lineHeight: "1.2",
                  border: "1px solid #e0e0e0",
                  maxWidth: "300px",
                  maxHeight: "200px",
                  overflowY: "auto",
                  overflowX: "auto",
                  whiteSpace: "normal",
                },
                "& .MuiTooltip-arrow": {
                  color: "#fff",
                  "&::before": {
                    border: "1px solid #e0e0e0",
                  },
                },
              },
              modifiers: [
                {
                  name: "preventOverflow",
                  options: {
                    altAxis: true,
                    padding: 5,
                  },
                },
              ],
            }}
          >
            <span
              style={{
                display: "inline-block",
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                wordBreak: "break-word",
                overflowWrap: "anywhere",
                lineHeight: "1.2",
                fontSize: "0.75em",
              }}
            >
              {truncated}
            </span>
          </Tooltip>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      headerClassName: "bg-[#1A6FAB] text-white text-left",
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
      headerClassName: "bg-[#1A6FAB] text-white text-left",
      width: 250,
      editable: false,
      renderCell: (params) => {
        const isInactive = params.row.status === "Inactive";
        const isActive = params.row.status === "Active";
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="group"
                onClick={(e) => e.stopPropagation()}
              >
                <EllipsisIcon className="text-blue-primary-200" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  navigateToEdit(params.row);
                }}
                disabled={isInactive}
              >
                <PencilIcon className="size-4 mr-2" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  showConfirmationPopup(
                    params.row,
                    isActive ? "Inactive" : "Active"
                  );
                }}
              >
                {isActive ? (
                  <>
                    <UserRoundX className="size-4 mr-2" />
                    <span>Inactive</span>
                  </>
                ) : (
                  <>
                    <UserRoundCheck className="size-4 mr-2" />
                    <span>Active</span>
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="responsive-table-wrapper">
      <QueryClientProvider client={queryClient}>
        <TableListView
          columns={columns}
          tabs={[
            { label: "All", value: "all" },
            { label: "Active", value: "Active" },
            { label: "Inactive", value: "Inactive" },
          ]}
          fetchData={fetchData}
          searchPlaceholder="Search Classes"
          defaultPageSize={10}
          defaultSortField="createdAt"
          defaultSortOrder="desc"
          onAddItem={handleAddUser}
          addButtonText="Add Class"
          isDraggable={true}
          onDragEnd={handleDragEnd}
        />
        {confirmationPopup.isOpen && (
          <PopupAlert
            open={confirmationPopup.isOpen}
            setOpen={() =>
              setConfirmationPopup({ isOpen: false, row: null, action: null })
            }
            title="Confirm Action"
            message={`Are you sure you want to mark this Class as ${confirmationPopup.action}?`}
            onConfirm={() => handleConfirmationResponse(true)}
            onCancel={() => handleConfirmationResponse(false)}
            submitTxt="Yes"
            cancelTxt="No"
          />
        )}
      </QueryClientProvider>
    </div>
  );
};

export default ClassListView;
