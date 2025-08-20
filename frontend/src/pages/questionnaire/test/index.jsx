import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useBreadcrumb } from "@/components/ui/breadcrumb/breadcrumb-context";
import TableListView from "@/components/ui/table-list-view/table-list-view";
import {
  EllipsisIcon,
  PencilIcon,
  UserRoundCheck,
  UserRoundX,
  TrashIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileUpIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format_dd_mmm_yyyy } from "@/components/functions/date-format";
import apiService from "@/lib/apiService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { APIS } from "@/constants/api.constant";
import ROUTES from "@/constants/route.constant";
import PopupAlert from "@/components/common/PopupAlert/PopupAlert";
import { patchApi } from "@/services/method";
import katex from "katex";
import "katex/dist/katex.min.css";
import parse from "html-react-parser";
import { Tooltip } from "@mui/material";
import { AlertDialogBox } from "@/components/ui/dialog";

const queryClient = new QueryClient();

// Utility function to summarize repetitive LaTeX content
const summarizeRepetitiveContent = (value) => {
  if (!value) return { summarized: "", full: "" };

  const parts = value.split(/(\\\([^()]+\\\))/g).filter(Boolean);
  const seen = new Map();
  let summarizedParts = [];
  let fullContent = value;

  for (const part of parts) {
    if (part.startsWith("\\(") && part.endsWith("\\)")) {
      const expr = part;
      if (seen.has(expr)) {
        seen.set(expr, seen.get(expr) + 1);
      } else {
        seen.set(expr, 1);
        summarizedParts.push(expr);
      }
    } else {
      const trimmedPart = part.trim();
      if (trimmedPart) {
        if (seen.has(trimmedPart)) {
          seen.set(trimmedPart, seen.get(trimmedPart) + 1);
        } else {
          seen.set(trimmedPart, 1);
          summarizedParts.push(trimmedPart);
        }
      }
    }
  }

  let summarized = "";
  for (const part of summarizedParts) {
    const count = seen.get(part);
    if (count > 1) {
      if (part.startsWith("\\(") && part.endsWith("\\)")) {
        summarized += `${part} (repeated ${count}x) `;
      } else {
        summarized += `${part} (repeated ${count}x) `;
      }
    } else {
      summarized += part + " ";
    }
  }

  return { summarized: summarized.trim(), full: fullContent };
};

// Utility function to truncate LaTeX content at a logical break
const truncateLatexContent = (value, maxLength = 20) => {
  if (!value || value.length <= maxLength)
    return { truncated: value || "", isTruncated: false };

  let truncated = "";
  let currentLength = 0;
  const parts = value.split(/(\\\([^()]+\\\))/g).filter(Boolean);

  for (const part of parts) {
    currentLength += part.length;
    if (currentLength > maxLength) break;
    truncated += part;
  }

  return { truncated: truncated + "...", isTruncated: true };
};

// Function to render LaTeX content into human-readable HTML
const renderLatexContent = (value) => {
  if (!value) return "";

  try {
    let processedValue = value;

    const hasLatexDelimiters =
      /\\\(.*?\\\)/.test(value) || /\\\[.*?\\\]/.test(value);

    if (!hasLatexDelimiters) {
      const mathPatterns = [
        { pattern: /(\w+)\/(\w+)/g, replacement: "\\frac{$1}{$2}" },
        { pattern: /(\w+)\^(\w+)/g, replacement: "$1^{$2}" },
        { pattern: /(\w+)_(\w+)/g, replacement: "$1_{$2}" },
      ];

      let transformedValue = value;
      let containsMath = false;
      mathPatterns.forEach(({ pattern, replacement }) => {
        if (pattern.test(transformedValue)) {
          containsMath = true;
          transformedValue = transformedValue.replace(pattern, replacement);
        }
      });

      if (containsMath) {
        processedValue = `\\(${transformedValue}\\)`;
      } else {
        return value;
      }
    }

    const renderedContent = processedValue
      .replace(/\\\((.*?)\\\)/g, (_, expr) => {
        try {
          return katex.renderToString(expr, {
            displayMode: false,
            throwOnError: false,
          });
        } catch {
          return `<span class="katex-error">${expr}</span>`;
        }
      })
      .replace(/\\\[(.*?)\\\]/g, (_, expr) => {
        try {
          return katex.renderToString(expr, {
            displayMode: false,
            throwOnError: false,
          });
        } catch {
          return `<span class="katex-error">${expr}</span>`;
        }
      });

    return renderedContent;
  } catch (error) {
    return value;
  }
};

const TestListView = () => {
  const { updateBreadcrumb } = useBreadcrumb();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [testId, setTestId] = useState();
  const navigate = useNavigate();
  const [confirmationPopup, setConfirmationPopup] = useState({
    isOpen: false,
    row: null,
    action: null,
  });

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
      const response = await patchApi(APIS.TEST, row._id, payload);
      if (response?.status === true && response?.code === 201) {
        toast.success(`Question has been marked as ${status} successfully`);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error(error?.response?.message || error?.message);
    }
  };

  const handleConfirm = async () => {
    try {
      const response = await apiService.delete(`${APIS.TEST}/${testId}`);
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
    navigate(`${ROUTES.UPDATE_TEST}/${rowData?._id}`, {
      state: { isEditeActive: true },
    });
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  useEffect(() => {
    const breadcrumbData = [{ label: "Question" }];
    updateBreadcrumb(breadcrumbData);
  }, [updateBreadcrumb]);

  const columns = [
    {
      field: "classes",
      headerName: "Class",
      flex: 1,
      minWidth: 100,
      headerClassName: "bg-[#1A6FAB] text-white",
      renderCell: (params) => {
        const items = params.value || [];
        const maxVisible = 2;
        const visibleItems = items.slice(0, maxVisible);
        const hiddenCount = items.length - maxVisible;
        const hiddenItems = items.slice(maxVisible);

        return (
          <div className="flex flex-wrap gap-1">
            {visibleItems.map((item, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
              >
                {item?.nameEn}
              </span>
            ))}
            {hiddenCount > 0 && (
              <Tooltip
                title={
                  <div className="flex flex-wrap gap-1">
                    {hiddenItems.map((item, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                      >
                        {item?.nameEn}
                      </span>
                    ))}
                  </div>
                }
                placement="bottom"
              >
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs cursor-pointer">
                  +{hiddenCount}
                </span>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      field: "subjects",
      headerName: "Subjects",
      flex: 1,
      minWidth: 100,
      headerClassName: "bg-[#1A6FAB] text-white",
      renderCell: (params) => {
        const items = params.value || [];
        const maxVisible = 2;
        const visibleItems = items.slice(0, maxVisible);
        const hiddenCount = items.length - maxVisible;
        const hiddenItems = items.slice(maxVisible);

        return (
          <div className="flex flex-wrap gap-1">
            {visibleItems.map((item, index) => (
              <span
                key={index}
                className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs"
              >
                {item?.nameEn}
              </span>
            ))}
            {hiddenCount > 0 && (
              <Tooltip
                title={
                  <div className="flex flex-wrap gap-1">
                    {hiddenItems.map((item, index) => (
                      <span
                        key={index}
                        className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs"
                      >
                        {item?.nameEn}
                      </span>
                    ))}
                  </div>
                }
                placement="bottom"
              >
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs cursor-pointer">
                  +{hiddenCount}
                </span>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      field: "book",
      headerName: "Book",
      flex: 1,
      minWidth: 150,
      headerClassName: "bg-[#1A6FAB] text-white hide-on-mobile",
      cellClassName: "hide-on-mobile",
      renderCell: (params) => {
        const items = params.value || [];
        const maxVisible = 2;
        const visibleItems = items.slice(0, maxVisible);
        const hiddenCount = items.length - maxVisible;
        const hiddenItems = items.slice(maxVisible);

        return (
          <div className="flex flex-wrap gap-1">
            {visibleItems.map((item, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
              >
                {item?.nameEn}
              </span>
            ))}
            {hiddenCount > 0 && (
              <Tooltip
                title={
                  <div className="flex flex-wrap gap-1">
                    {hiddenItems.map((item, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                      >
                        {item?.nameEn}
                      </span>
                    ))}
                  </div>
                }
                placement="bottom"
              >
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs cursor-pointer">
                  +{hiddenCount}
                </span>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      field: "lesson",
      headerName: "Lesson",
      flex: 1,
      minWidth: 150,
      headerClassName: "bg-[#1A6FAB] text-white hide-on-mobile",
      cellClassName: "hide-on-mobile",
      renderCell: (params) => {
        const items = params.value || [];
        const maxVisible = 2;
        const visibleItems = items.slice(0, maxVisible);
        const hiddenCount = items.length - maxVisible;
        const hiddenItems = items.slice(maxVisible);

        return (
          <div className="flex flex-wrap gap-1">
            {visibleItems.map((item, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
              >
                {item?.nameEn}
              </span>
            ))}
            {hiddenCount > 0 && (
              <Tooltip
                title={
                  <div className="flex flex-wrap gap-1">
                    {hiddenItems.map((item, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                      >
                        {item?.nameEn}
                      </span>
                    ))}
                  </div>
                }
                placement="bottom"
              >
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs cursor-pointer">
                  +{hiddenCount}
                </span>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      field: "topic",
      headerName: "Topic",
      flex: 1,
      minWidth: 150,
      headerClassName: "bg-[#1A6FAB] text-white hide-on-mobile",
      cellClassName: "hide-on-mobile",
      renderCell: (params) => {
        const items = params.value || [];
        const maxVisible = 2;
        const visibleItems = items.slice(0, maxVisible);
        const hiddenCount = items.length - maxVisible;
        const hiddenItems = items.slice(maxVisible);

        return (
          <div className="flex flex-wrap gap-1">
            {visibleItems.map((item, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
              >
                {item?.nameEn}
              </span>
            ))}
            {hiddenCount > 0 && (
              <Tooltip
                title={
                  <div className="flex flex-wrap gap-1">
                    {hiddenItems.map((item, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                      >
                        {item?.nameEn}
                      </span>
                    ))}
                  </div>
                }
                placement="bottom"
              >
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs cursor-pointer">
                  +{hiddenCount}
                </span>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      field: "description",
      headerName: "Question",
      headerClassName: "bg-[#1A6FAB] text-white",
      flex: 1,
      minWidth: 250,
      renderCell: (params) => {
        const value = params.value || "";
        if (!value) return <span>No description</span>;

        const { summarized, full } = summarizeRepetitiveContent(value);
        const renderedContent = renderLatexContent(summarized);
        const renderedFullContent = renderLatexContent(full);
        const { truncated, isTruncated } = truncateLatexContent(summarized, 20);

        return (
          <Tooltip
            title={
              isTruncated ? (
                <div className="custom-tooltip-content">
                  {parse(renderedFullContent)}
                </div>
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
                  maxWidth: "300px", // Fixed max width for tooltip
                  maxHeight: "200px", // Fixed max height for tooltip
                  overflowY: "auto", // Vertical scrollbar if content exceeds maxHeight
                  overflowX: "auto", // Horizontal scrollbar if content exceeds maxWidth
                  whiteSpace: "normal", // Allow text wrapping
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
                    padding: 8,
                  },
                },
                {
                  name: "flip",
                  options: {
                    enabled: false,
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
                maxHeight: "2em",
                fontSize: "0.75em",
              }}
              className="katex-wrapper"
            >
              {parse(renderedContent)}
            </span>
          </Tooltip>
        );
      },
    },
    {
      field: "type",
      headerName: "Question Type",
      flex: 1,
      minWidth: 150,
      headerClassName: "bg-[#1A6FAB] text-white",
      renderCell: (params) => <span>{params.value}</span>,
    },
    {
      field: "status",
      headerName: "Status",
      headerClassName: "bg-[#1A6FAB] text-white",
      flex: 1,
      minWidth: 100,
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
      headerClassName: "bg-[#1A6FAB] text-white",
      minWidth: 100,
      flex: 0.5,
      editable: false,
      renderCell: (params) => {
        const isInactive = params.row.status === "Inactive";
        const isActive = params.row.status === "Active";
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 w-9 group">
                <EllipsisIcon className="text-blue-primary-200 w-4 h-4" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => navigateToEdit(params.row)}
                disabled={isInactive}
              >
                <PencilIcon className="size-3 mr-1" />
                <span className="text-xs">Edit</span>
              </DropdownMenuItem>
              {isActive ? (
                <DropdownMenuItem
                  onClick={() => showConfirmationPopup(params.row, "Inactive")}
                >
                  <UserRoundX className="size-3 mr-1" />
                  <span className="text-xs">Inactive</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => showConfirmationPopup(params.row, "Active")}
                >
                  <UserRoundCheck className="size-3 mr-1" />
                  <span className="text-xs">Active</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => handleDeleteUser(params.row._id)}
                disabled={isInactive}
              >
                <TrashIcon className="size-3 mr-1" />
                <span className="text-xs">Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const HEAD_BUTTONS = [
    {
      label: "Add Question",
      children: (
        <Button
          onClick={() => handleAddUser()}
          className="bg-[#1A6FAB] text-white hover:bg-[#1A6FAB] hover:text-white text-xs px-2 py-1"
        >
          <PlusIcon className="size-3 mr-1" />
          Add Question
        </Button>
      ),
    },
    {
      label: "More",
      children: (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 w-9 group">
              <EllipsisIcon className="text-blue-primary-200 w-4 h-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExportCSV()}>
              <FileUpIcon className="size-3 mr-1" />
              <span className="text-xs">Export CSV</span>
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
    if (tab === "Active") {
      params.isActive = true;
    } else if (tab === "Inactive") {
      params.isActive = false;
    }
    const response = await apiService.get(`${APIS.TEST_LIST}`, { params });
    return {
      data: response.data.test.map((row) => {
        let status = "Active";
        if (row.isActive) status = "Active";
        else if (!row.isActive) status = "Inactive";
        return { ...row, id: row._id, status };
      }),
      totalCount: response.data.count || 0,
    };
  };

  const handleAddUser = () => {
    navigate(ROUTES.TEST, {
      state: { isEditeActive: false },
    });
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
    setTestId(id);
    setIsDialogOpen(true);
  };

  const showConfirmationPopup = (row, action) => {
    setConfirmationPopup({
      isOpen: true,
      row,
      action,
    });
  };

  const handleExportCSV = () => {
    // Placeholder for CSV export functionality
  };

  return (
    <div className="responsive-table-wrapper">
      <style>
        {`
          .responsive-table-wrapper {
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .katex-wrapper {
            display: inline-block !important;
            vertical-align: middle !important;
          }
          .katex-wrapper p {
            margin: 0 !important;
            padding: 0 !important;
            display: inline !important;
            lineHeight: 1 !important;
          }
          .katex-wrapper .katex {
            display: inline-block !important;
            vertical-align: middle !important;
           
          }
          .katex-wrapper .katex-html {
            line-height: 1 !important;
          }
          .custom-tooltip-content {
            display: block !important; /* Changed to block for proper scrolling */
            vertical-align: middle !important;
            padding: 4px 6px !important;
            font-size: 0.75em !important;
            line-height: 1.2 !important;
            max-width: 300px !important; /* Match with tooltip maxWidth */
            max-height: 200px !important; /* Match with tooltip maxHeight */
            overflow-y: auto !important; /* Vertical scrollbar */
            overflow-x: auto !important; /* Horizontal scrollbar */
            white-space: normal !important; /* Allow text wrapping */
          }
          .custom-tooltip-content p {
            margin: 0 !important;
            padding: 0 !important;
            display: inline !important;
            lineHeight: 1 !important;
          }
          .custom-tooltip-content .katex {
            display: inline-block !important;
            vertical-align: middle !important;
            font-size: 0.75em !important;
          }
          .custom-tooltip-content .katex-html {
            line-height: 1 !important;
          }
          /* Table styling */
          .responsive-table-wrapper .MuiTableCell-root {
            padding: 4px 6px !important;
            font-size: 0.75em !important;
            line-height: 1.2 !important;
          }
          .responsive-table-wrapper .MuiTableRow-root {
            height: 36px !important;
          }
          .bg-blue-100, .bg-green-100 {
          
            
           
          }
          /* Responsive styles */
          @media (max-width: 768px) {
            .hide-on-mobile {
              display: none !important;
            }
            .responsive-table-wrapper .MuiTableCell-root {
              padding: 3px 5px !important;
              font-size: 0.7em !important;
            }
            .responsive-table-wrapper .MuiTableRow-root {
              height: 32px !important;
            }
            .bg-blue-100, .bg-green-100 {
              font-size: 0.65em !important;
              padding: 1px 2px !important;
            }
            .katex-wrapper .katex,
            .custom-tooltip-content .katex {
              font-size: 0.7em !important;
            }
          }
          @media (max-width: 480px) {
            .responsive-table-wrapper .MuiTableCell-root {
              padding: 2px 4px !important;
              font-size: 0.65em !important;
            }
            .responsive-table-wrapper .MuiTableRow-row {
              height: 28px !important;
            }
            .bg-blue-100, .bg-green-100 {
              font-size: 0.6em !important;
              padding: 1px 2px !important;
            }
            .katex-wrapper .katex,
            .custom-tooltip-content .katex {
              font-size: 0.65em !important;
            }
          }
        `}
      </style>
      <QueryClientProvider client={queryClient}>
        <TableListView
          columns={columns}
          tabs={[
            { label: "All", value: "all" },
            { label: "Active", value: "Active" },
            { label: "Inactive", value: "Inactive" },
          ]}
          fetchData={fetchData}
          searchPlaceholder="Search"
          defaultPageSize={10}
          defaultSortField="createdAt"
          defaultSortOrder="desc"
          onAddItem={handleAddUser}
          addButtonText="Add Question"
          headButtons={HEAD_BUTTONS}
        />
      </QueryClientProvider>

      {confirmationPopup.isOpen && (
        <PopupAlert
          open={confirmationPopup.isOpen}
          setOpen={setConfirmationPopup}
          title="Status"
          message={`Are you sure, you want to mark this question as ${confirmationPopup.action}?`}
          onConfirm={() => handleConfirmationResponse(true)}
          onCancel={handleCancelUpdate}
          submitTxt="Yes"
          cancelTxt="No"
        />
      )}
      <AlertDialogBox
        isOpen={isDialogOpen}
        title="Delete"
        description="Are you absolutely sure you want to delete? This action cannot be undone."
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        submitBtnText="Delete"
      />
    </div>
  );
};

export default TestListView;
