import React, { useEffect, useState, useRef } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import katex from "katex";
import "katex/dist/katex.min.css";
import { useBreadcrumb } from "@/components/ui/breadcrumb/breadcrumb-context";
import TableListView from "@/components/ui/table-list-view/table-list-view";
import { EllipsisIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { APIS } from "@/constants/api.constant";
import Button from "@/components/common/Button/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ROUTES from "@/constants/route.constant";
import { Tooltip } from "@mui/material";
import { format_dd_mmm_yyyy } from "@/components/functions/date-format";
import apiService from "@/lib/apiService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AlertDialogBox from "@/components/ui/dialog";
import parse from "html-react-parser";

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
      seen.set(expr, (seen.get(expr) || 0) + 1);
      if (seen.get(expr) === 1) summarizedParts.push(expr);
    } else {
      const trimmedPart = part.trim();
      if (trimmedPart) {
        seen.set(trimmedPart, (seen.get(trimmedPart) || 0) + 1);
        if (seen.get(trimmedPart) === 1) summarizedParts.push(trimmedPart);
      }
    }
  }

  let summarized = summarizedParts
    .map((part) => {
      const count = seen.get(part);
      return count > 1 ? `${part} (x${count})` : part;
    })
    .join(" ");

  return { summarized: summarized.trim(), full: fullContent };
};

// Utility function to truncate LaTeX content
const truncateLatexContent = (value, maxLength = 20) => {
  if (!value || value.length <= maxLength)
    return { truncated: value, isTruncated: false };

  let truncated = "";
  let currentLength = 0;
  const parts = value.split(/(\\\([^()]+\\\))/g).filter(Boolean);

  for (const part of parts) {
    if (currentLength + part.length > maxLength) {
      const remaining = maxLength - currentLength;
      if (remaining > 0) {
        truncated += part.slice(0, remaining);
      }
      break;
    }
    truncated += part;
    currentLength += part.length;
  }

  return { truncated: truncated + "...", isTruncated: true };
};

// LaTeX rendering function
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
            strict: false,
            output: "html",
          });
        } catch (error) {
          return `<span className="katex-error">${expr}</span>`;
        }
      })
      .replace(/\\\[.*?\\\]/g, (_, expr) => {
        try {
          return katex.renderToString(expr, {
            displayMode: true,
            throwOnError: false,
            strict: false,
            output: "html",
          });
        } catch (error) {
          return `<span className="katex-error">${expr}</span>`;
        }
      });

    return renderedContent;
  } catch (error) {
    console.error("Error rendering LaTeX:", error);
    return value;
  }
};

const HomeworkListView = () => {
  const { updateBreadcrumb, breadcrumbData } = useBreadcrumb();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const tableRef = useRef(null);
  const [tableParams, setTableParams] = useState({
    page: 0,
    pageSize: 10,
    search: "",
    sortBy: "createdAt",
    order: "desc",
    tab: "all",
    role: "",
  });

  useEffect(() => {
    const newBreadcrumbData = [
      { label: "Users", href: "/homework" },
      { label: "Homework", href: "/homework" },
    ];
    if (JSON.stringify(breadcrumbData) !== JSON.stringify(newBreadcrumbData)) {
      updateBreadcrumb(newBreadcrumbData);
    }
  }, [updateBreadcrumb, breadcrumbData]);

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.scrollLeft = 0;
    }
  }, []);

  const columns = [
    {
      field: "classNames",
      headerName: "Class",
      width: 150,
    },
    {
      field: "subjectNames",
      headerName: "Subject",
      width: 150,
    },
    {
      field: "book",
      headerName: "Book",
      width: 200,
    },
    {
      field: "lesson",
      headerName: "Lesson",
      width: 200,
    },
    {
      field: "topic",
      headerName: "Topic",
      minWidth: 200,
      maxWidth: 200,
      flex: 0.2,
      renderCell: (params) => {
        let value = "";
        if (Array.isArray(params.value)) {
          value = params.value
            .filter((item) => item != null && item !== "")
            .map((item) => String(item))
            .join(", ");
        } else if (params.value != null) {
          value = String(params.value);
        }

        const { summarized, full } = summarizeRepetitiveContent(value);
        const renderedFullContent = renderLatexContent(full);
        const { truncated, isTruncated } = truncateLatexContent(summarized, 15);

        return (
          <Tooltip
            title={
              isTruncated ? (
                <div className="custom-tooltip-content">
                  {parse(renderedFullContent)}
                </div>
              ) : null
            }
          >
            <span className="truncate w-[100px] block">{truncated}</span>
          </Tooltip>
        );
      },
    },
    {
      field: "question",
      headerName: "Question",
      minWidth: 200,
      maxWidth: 200,
      flex: 0.3,
      renderCell: (params) => {
        const value = params.value || "";
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
              ) : null
            }
            arrow
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
                maxHeight: "1em",
                fontSize: "0.8em",
              }}
            >
              {parse(renderedContent)}
            </span>
          </Tooltip>
        );
      },
    },
    {
      field: "solution",
      headerName: "Answer",
      minWidth: 200,
      maxWidth: 200,
      flex: 0.3,
      renderCell: (params) => {
        const value = params.value || "";
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
              ) : null
            }
            arrow
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
                maxHeight: "1em",
                fontSize: "0.8em",
              }}
            >
              {parse(renderedContent)}
            </span>
          </Tooltip>
        );
      },
    },
    {
      field: "hint",
      headerName: "Solution",
      minWidth: 200,
      maxWidth: 200,
      flex: 0.2,
      renderCell: (params) => {
        const value = params.value || "";
        const { summarized, full } = summarizeRepetitiveContent(value);
        const renderedContent = renderLatexContent(summarized);
        const renderedFullContent = renderLatexContent(full);
        const { truncated, isTruncated } = truncateLatexContent(summarized, 15);

        return (
          <Tooltip
            title={
              isTruncated ? (
                <div className="custom-tooltip-content">
                  {parse(renderedFullContent)}
                </div>
              ) : null
            }
            arrow
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
                maxHeight: "1em",
                fontSize: "0.8em",
              }}
            >
              {parse(renderedContent)}
            </span>
          </Tooltip>
        );
      },
    },
    {
      field: "createdBy",
      headerName: "Created By",
      width: 120,
    },
    {
      field: "updatedBy",
      headerName: "Updated By",
      width: 120,
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 120,
      renderCell: (params) => (
        <span style={{ fontSize: "0.9em" }}>
          {format_dd_mmm_yyyy(params.value)}
        </span>
      ),
    },
    {
      field: "Action",
      headerName: "Action",
      headerClassName: "super-app-theme--header-0",
      width: 120,
      renderCell: (params) => {
        const [isDialogOpen, setIsDialogOpen] = useState(false);

        const handleDelete = () => {
          setIsDialogOpen(true);
        };

        const handleConfirm = async () => {
          try {
            await apiService.delete(`${APIS.Homework}/${params.row.id}`);
            toast.success("Homework deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["dynamicData"] });
          } catch (error) {
            toast.error(
              error?.response?.data?.message || "Failed to delete homework"
            );
          } finally {
            setIsDialogOpen(false);
          }
        };

        const handleCancel = () => {
          setIsDialogOpen(false);
        };

        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 w-9 mt-0">
                  <EllipsisIcon className="" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`${ROUTES.HOMEWORK_Edit}/${params.row.id}`);
                  }}
                  className="text-gray-600 hover:bg-gray-50"
                >
                  <PencilIcon className="size-4 mr-2" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2Icon className="size-4 mr-2" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogBox
              isOpen={isDialogOpen}
              title="Are you absolutely sure you want to delete this homework?"
              description="This action cannot be undone."
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              submitBtnText="Delete"
            />
          </>
        );
      },
    },
  ];

  const tabs = [{ label: "All", value: "all" }];

  const fetchData = async ({
    page,
    pageSize,
    search,
    sortBy,
    order,
    tab,
    role,
  }) => {
    const params = {
      sortBy,
      order,
      status: tab !== "all" ? tab : null,
    };
    if (search || role) {
      params.search = role || search || null;
      if (role) {
        params.role = role;
      }
    }
    if (!search && !role) {
      params.limit = pageSize;
      params.page = page + 1;
    }
    try {
      const response = await apiService.get(`${APIS.Homework}`, { params });
      const homework = response.data.homework || [];
      return {
        data: homework.map((row) => ({ ...row, id: row._id })),
        totalCount: response.data.pagination?.total || homework.length,
      };
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch homework");
      throw error;
    }
  };

  const handleAddHomework = () => {
    navigate(ROUTES.HOMEWORK);
  };

  return (
    <div
      ref={tableRef}
      style={{
        overflowX: "auto",
        width: "100%",
        maxWidth: "100%",
        paddingBottom: "10px",
      }}
    >
      <style>
        {`
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
        `}
      </style>
      <QueryClientProvider client={queryClient}>
        <TableListView
          columns={columns}
          tabs={tabs}
          fetchData={fetchData}
          searchPlaceholder="Search"
          defaultPageSize={10}
          defaultSortField="createdAt"
          defaultSortOrder="desc"
          onAddItem={handleAddHomework}
          addButtonText="Add Homework"
          style={{
            width: "max-content",
            minWidth: "100%",
            tableLayout: "auto",
            fontSize: "0.9em",
          }}
          autoHeight
          disableExtendRowFullWidth
          initialState={{
            scroll: { left: 0 },
          }}
        />
      </QueryClientProvider>
    </div>
  );
};

export default HomeworkListView;
