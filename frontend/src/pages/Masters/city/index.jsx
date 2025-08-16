import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useBreadcrumb } from "@/components/ui/breadcrumb/breadcrumb-context";
import { useEffect, useState, useContext } from "react";
import TableListView from "@/components/ui/table-list-view/table-list-view";
import { ChevronDown, Settings2Icon } from "lucide-react";
import { EllipsisIcon, EyeIcon, PencilIcon } from "lucide-react";
import PaginatedTableView from '@/components/paginated-table-view';
import DataCharectersTooltip from '@/components/ui/DataCharectersTooltip';
import { Link} from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from 'axios';
import {
  
  
  FileUpIcon,
  ImportIcon,
  LocateFixedIcon,
  TrashIcon,
  PlusIcon,
  CopyPlus,
} from 'lucide-react';
import * as Yup from 'yup';
import { Button } from "@/components/ui/button";
import { format_dd_mmm_yyyy } from "@/components/functions/date-format";
import { toTitleCase } from "@/components/functions/tittle-case";
import { AlertDialogBox } from "@/components/ui/dialog";
import { Trash2Icon } from "lucide-react";
import apiService from "@/lib/apiService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { APIS } from '@/constants/api.constant';
import ROUTES from '@/constants/route.constant';
import { CounterContext } from '@/components/Layout/commonLayout/TitleOfPageProvider';
const queryClient = new QueryClient();



const CityListView = () => {
  const { updateBreadcrumb } = useBreadcrumb();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [CityId, setCityId] = useState();
  const navigate = useNavigate();
  let setCount = useContext(CounterContext);

  const handleConfirm = async () => {
    try {
      const response = await apiService.delete(`${APIS.CITY}/${CityId}`);
      
      if (response?.message === "OK" && response?.status === true) {
        toast.success('City deleted successfully');
        setIsDialogOpen(false);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setIsDialogOpen(false);
        toast.error(response?.message || 'Failed to delete City');
      }
    } catch (error) {
      setIsDialogOpen(false);
      toast.error(error?.response?.data?.message || 'Something went wrong');
    }
  };
  
  const navigateToEdit = (rowData) => {
    navigate(`${ROUTES.UPDATE_CITY}/${rowData?._id}`, {
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
    const breadcrumbData = [

      { label: "City", },
    ];
    updateBreadcrumb(breadcrumbData);
  }, []);
  const columns = [
    // { field: 'id', headerName: 'ID', width: 70 },
    {
      field: "code",
  headerName: "Code",
      headerClassName: "bg-[#1A6FAB] text-white",
  width: 250,
  renderCell: (params) => <span>{params.row.code}</span>,
},
    {
      field: "name",
  headerName: "Name",
      headerClassName: "bg-[#1A6FAB] text-white",
  width: 250,
  renderCell: (params) => <span>{params.row.name.english}</span>,
},
// {
//   field: 'statehindi',
//   headerName: 'Name (Hi)',
//   headerClassName: "bg-[#1A6FAB] text-white", 

//   width: 300,
//   renderCell: (params) => <div>{params?.row?.name?.hindi || '-'}</div>,

// },
// {
//   field: 'shortName',
//   headerName: 'Short Name',
//   headerClassName: "bg-[#1A6FAB] text-white",

//   width: 250,
//   renderCell: (params) => (
//     <div>{params?.row?.shortName?.english || '-'}</div>
//   ),
 
// },
// {
//   field: 'lgd',
//   headerName: 'LGD',
//   headerClassName: "bg-[#1A6FAB] text-white",

//   width: 300,
//   renderCell: (params) => <div>{params?.row?.lgd || '-'}</div>,

// },
{
  field: 'state',
  headerName: 'State',
  headerClassName: "bg-[#1A6FAB] text-white",

  width: 200,
  renderCell: (params) => (
    <div>{params.row?.state?.name?.english || '-'}</div>
  ),
},
{
  field: 'country',
  headerName: 'Country',
  headerClassName: "bg-[#1A6FAB] text-white",

  width: 200,
  renderCell: (params) => (
    <div>{params.row?.country?.name?.english}</div>
  ),
},

{
  field: 'status',
  headerName: 'Status',
 headerClassName: "bg-[#1A6FAB] text-white",
  width: 150,


  renderCell: (params) => {
    const isActive = params.row.isActive;

    return (
      <div>
        <span style={{ color: isActive ? 'green' : 'red' }}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
    );
  },
},
// {
//   field: "description",
// headerName: "Class Description",
// width: 250,
// renderCell: (params) => <span>{params.value}</span>,
// },
    {
      field: 'Action',
      headerName: 'Action',
      headerClassName: "bg-[#1A6FAB] text-white",
      width: 250,
      editable: false,
      renderCell: (params) => {
        const isInactive = params.row.status === 'Inactive';
        return (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" size="icon" className="">
                <EllipsisIcon className="text-blue-primary-200 group-hover:text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
             
              {/* <DropdownMenuItem onClick={() => navigateToView(params.row)}>
                <EyeIcon className="size-4 mr-2" />
                <span>View</span>
              </DropdownMenuItem> */}
              <DropdownMenuItem
                onClick={() => navigateToEdit(params.row)}
                disabled={isInactive}
              >
                <PencilIcon className="size-4 mr-2" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteUser(params.row._id)}
                disabled={isInactive}
              >
                <TrashIcon className="size-4 mr-2" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
        {
          field: "space",
          headerName: "",
          headerClassName: "bg-[#1A6FAB] text-white",
          minWidth: 350,
          flex: 1,
          renderCell: (params) => (
            <Link to={``} state={{ id: params.row._id }}>
              {params.value.length >= 25 ? (
                <DataCharectersTooltip text={params.value} maxLength="25" />
              ) : (
                params.value
              )}
            </Link>
          ),
        },
  ];
//   const columns = [
//     // { field: 'id', headerName: 'ID', width: 70 },
    
//     {
//       field: "name",
//   headerName: "Name",
//   width: 250,
//   renderCell: (params) => <span>{params.row.name.english}</span>,
// },

// // {
// //   field: "description",
// // headerName: "Class Description",
// // width: 250,
// // renderCell: (params) => <span>{params.value}</span>,
// // },
//     {
//       field: 'Action',
//       headerName: 'Action',
//       headerClassName: 'super-app-theme--header hide-img-bordersvg',
//       width: 250,
//       editable: false,
//       renderCell: (params) => {
//         const isInactive = params.row.status === 'Inactive';
//         return (
//           <DropdownMenu>
//             <DropdownMenuTrigger>
//               <Button variant="outline" size="icon" className="group">
//                 <EllipsisIcon className="text-blue-primary-200 group-hover:text-white" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
             
//               {/* <DropdownMenuItem onClick={() => navigateToView(params.row)}>
//                 <EyeIcon className="size-4 mr-2" />
//                 <span>View</span>
//               </DropdownMenuItem> */}
//               <DropdownMenuItem
//                 onClick={() => navigateToEdit(params.row)}
//                 disabled={isInactive}
//               >
//                 <PencilIcon className="size-4 mr-2" />
//                 <span>Edit</span>
//               </DropdownMenuItem>
//               <DropdownMenuItem
//                 onClick={() => handleDeleteUser(params.row._id)}
//                 disabled={isInactive}
//               >
//                 <TrashIcon className="size-4 mr-2" />
//                 <span>Delete</span>
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         );
//       },
//     },
//   ];
  const HEAD_BUTTONS = [
    // {
    //   label: 'Total Stock',
    //   children: (
    //     <div CityName={cn(buttonVariants(), '')}>
    //       Total Stock: {totalStock}
    //     </div>
    //   ),
    // },
    {
      label: 'Add City',
      children: <Button onClick={() => handleAddUser()} CityName="bg-[#1A6FAB] text-white hover:bg-[#1A6FAB] hover:text-white">+ Add City</Button>,
    },
    {
      label: 'More',
      children: (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="outline" size="icon" CityName="group">
              <EllipsisIcon CityName="text-blue-primary-200 group-hover:text-white" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExportCSV()}>
              <FileUpIcon CityName="size-4 mr-2" />
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

    const response = await apiService.get(`${APIS.CITY}`, {
      params,
    });
    if (!Array.isArray(response?.data?.list) || response.data.list.length === 0) {
      return {
        data: [],
        totalCount: 0,
      };
    }
    return {
      data: response.data.list.map((row) => ({ ...row, id: row._id, space: '', })),
      totalCount: response.pagination.totalCount || 0,
    };
  };
  const handleAddUser = () => {
    navigate(ROUTES.CITY);
  };

  const handleDeleteUser = (id) => {
    setCityId(id);
    setIsDialogOpen(true);
  };
  return (
    <div CityName="">
      <QueryClientProvider client={queryClient}>
        <TableListView
          columns={columns}
         
          fetchData={fetchData}
        
          searchPlaceholder="Search"
          defaultPageSize={10}
          defaultSortField="createdAt"
          defaultSortOrder="desc"
          onAddItem={handleAddUser}
          addButtonText="Add City"
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

export default CityListView;
