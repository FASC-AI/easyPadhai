import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { useBreadcrumb } from "@/components/ui/breadcrumb/breadcrumb-context";
import { useEffect, useState } from "react";
import TableListView from "@/components/ui/table-list-view/table-list-view";
import { ChevronDown, Settings2Icon } from "lucide-react";
import React from "react";

import "katex/dist/katex.min.css";
import {
  EllipsisIcon,
  PencilIcon,
  MailIcon,
  CheckIcon,
  Trash2Icon,
} from "lucide-react";
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
import { toTitleCase } from "@/components/functions/tittle-case";
import apiService from "@/lib/apiService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AlertDialogBox from "@/components/ui/dialog";
import katex from "katex"; // Import KaTeX for rendering LaTeX

const LessonListView = () => {
  const { updateBreadcrumb, breadcrumbData } = useBreadcrumb();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
      { label: "Users", href: "/lesson" },
      { label: "Lesson Description", href: "/lesson" },
    ];
    if (JSON.stringify(breadcrumbData) !== JSON.stringify(newBreadcrumbData)) {
      updateBreadcrumb(newBreadcrumbData);
    }
  }, [updateBreadcrumb, breadcrumbData]);

  const columns = [
    {
      field: "serial",
      headerName: "Serial No.",
      width: 200,
    },
    {
      field: "classNames",
      headerName: "Class",
      width: 200,
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

        const words = value.split(" ");
        const isTruncated = words.length > 5;
        const truncated = isTruncated
          ? words.slice(0, 5).join(" ") + "..."
          : value;

        return (
          <Tooltip title={isTruncated ? value : ""}>
            <span
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "block",
                maxWidth: "100%",
              }}
            >
              {truncated}
            </span>
          </Tooltip>
        );
      },
    },
    {
      field: "subjectNames",
      headerName: "Subject",
      minWidth: 200,
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

        const words = value.split(" ");
        const isTruncated = words.length > 5;
        const truncated = isTruncated
          ? words.slice(0, 5).join(" ") + "..."
          : value;

        return (
          <Tooltip title={isTruncated ? value : ""}>
            <span
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "block",
                maxWidth: "100%",
              }}
            >
              {truncated}
            </span>
          </Tooltip>
        );
      },
    },
    {
      field: "book",
      headerName: "Book",
      width: 200,
      renderCell: (params) => {
        const value = params.value || "";
        const words = value.split(" ");
        const isTruncated = words.length > 5;
        const truncated = isTruncated
          ? words.slice(0, 5).join(" ") + "..."
          : value;

        return (
          <Tooltip title={isTruncated ? value : ""}>
            <span
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "block",
                maxWidth: "100%",
              }}
            >
              {truncated}
            </span>
          </Tooltip>
        );
      },
    },
    {
      field: "lesson",
      headerName: "Lesson",
      width: 200,
      renderCell: (params) => {
        const value = params.value || "";
        const words = value.split(" ");
        const isTruncated = words.length > 5;
        const truncated = isTruncated
          ? words.slice(0, 5).join(" ") + "..."
          : value;

        return (
          <Tooltip title={isTruncated ? value : ""}>
            <span
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "block",
                maxWidth: "100%",
              }}
            >
              {truncated}
            </span>
          </Tooltip>
        );
      },
    },
    {
      field: "topic",
      headerName: "Topic",
      width: 200,
      renderCell: (params) => {
        const value = params.value || "";
        const words = value.split(" ");
        const isTruncated = words.length > 5;
        const truncated = isTruncated
          ? words.slice(0, 5).join(" ") + "..."
          : value;

        return (
          <Tooltip title={isTruncated ? value : ""}>
            <span
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "block",
                maxWidth: "100%",
              }}
            >
              {truncated}
            </span>
          </Tooltip>
        );
      },
    },

    {
      field: "readingDuration",
      headerName: "Reading Duration",
      minWidth: 150,
      flex: 1,
    },
    {
      field: "videoTutorialLink",
      headerName: "Video Tutorial Link",
      minWidth: 300,
      flex: 1,
      renderCell: (params) => {
        const url = params.value || "";
        const maxLength = 20;
        const truncated =
          url.length > maxLength ? `${url.slice(0, maxLength)}...` : url;
        return <span title={url}>{truncated}</span>;
      },
    },
    {
      field: "isTestRequired",
      headerName: "Test Ready",
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (params.value ? "Yes" : "No"),
    },
    {
      field: "createdBy",
      headerName: "Added By",
      width: 150,
      renderCell: (params) => <span>{params.value || "-"}</span>,
    },
    {
      field: "createdAt",
      headerName: "Added At",
      width: 150,
      renderCell: (params) => <span>{format_dd_mmm_yyyy(params.value)}</span>,
    },
    {
      field: "updatedBy",
      headerName: "Updated By",
      width: 150,
      renderCell: (params) => <span>{params.value || "-"}</span>,
    },
    {
      field: "Action",
      headerName: "Action",
      headerClassName: "super-app-theme--header hide-img-bordersvg",
      minWidth: 150,
      flex: 1,
      editable: false,
      renderCell: (params) => {
        const [isDialogOpen, setIsDialogOpen] = React.useState(false);

        const handleDelete = () => {
          setIsDialogOpen(true);
        };

        const handleConfirm = async () => {
          try {
            await apiService.delete(`${APIS.LESSON}/${params.row.id}`);
            toast.success("Lesson deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["dynamicData"] });
          } catch (error) {
            toast.error(
              error?.response?.data?.message || "Failed to delete lesson"
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
              <DropdownMenuTrigger>
                <Button variant="outline" size="icon" className="group mt-2">
                  <EllipsisIcon className="text-blue-primary-200" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  // onClick={() =>
                  //   navigate(`${ROUTES.LMS_EDIT}/${params.row.id}`)
                  // }
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`${ROUTES.LMS_EDIT}/${params.row.id}`);
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
              title="Are you absolutely sure you want to delete this Topic?"
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
      const response = await apiService.get(`${APIS.LESSON}`, { params });
      const lessons = response.data.lessons || [];
      return {
        data: lessons.map((row) => ({ ...row, id: row._id })),
        totalCount: response.data.pagination?.total || lessons.length,
      };
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch topics");
      throw error;
    }
  };

  const handleAddLesson = () => {
    navigate(ROUTES.ADD_LMS);
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
          onAddItem={handleAddLesson}
          addButtonText="Add Lesson Description"
        />
      </QueryClientProvider>
    </div>
  );
};

export default LessonListView;