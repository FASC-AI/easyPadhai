# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh





















import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useBreadcrumb } from "@/components/ui/breadcrumb/breadcrumb-context";
import { useEffect } from "react";
import TableListView from "@/components/ui/table-list-view/table-list-view";

// Create a new QueryClient instance
const queryClient = new QueryClient();

// Generate dummy data for users
const generateDummyUsers = (count) => {
  const users = [];
  const statuses = ["active", "inactive", "pending"];
  const roles = ["admin", "user", "editor", "viewer"];

  for (let i = 1; i <= count; i++) {
    users.push({
      id: i,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      role: roles[Math.floor(Math.random() * roles.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString(),
      lastLogin: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  return users;
};

// Create a total of 150 dummy users
const allUsers = generateDummyUsers(150);

// Mock API query function
const fetchUsers = async ({ page, pageSize, search, sortBy, order, tab }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Filter users based on tab
  let filteredUsers = [...allUsers];

  if (tab === "active") {
    filteredUsers = filteredUsers.filter(user => user.status === "active");
  } else if (tab === "inactive") {
    filteredUsers = filteredUsers.filter(user => user.status === "inactive");
  } else if (tab === "pending") {
    filteredUsers = filteredUsers.filter(user => user.status === "pending");
  }

  // Filter by search term
  if (search) {
    const searchLower = search.toLowerCase();
    filteredUsers = filteredUsers.filter(user =>
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  }

  // Sort users
  filteredUsers.sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (order === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Calculate pagination
  const totalCount = filteredUsers.length;
  const startIndex = page * pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  return {
    data: paginatedUsers,
    totalCount,
  };
};

// Grid view component
const UserGridView = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map(user => (
        <div key={user.id} className="p-4 border rounded shadow">
          <h3 className="font-bold">{user.name}</h3>
          <p className="text-sm text-gray-600">{user.email}</p>
          <div className="mt-2 flex justify-between">
            <span className={`text-xs px-2 py-1 rounded ${user.status === 'active' ? 'bg-green-100 text-green-800' :
                user.status === 'inactive' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
              }`}>
              {user.status}
            </span>
            <span className="text-xs text-gray-500">{user.role}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// Custom filter component
const CustomFilter = () => {
  return (
    <div className="flex items-center gap-2">
      <select className="border p-2 rounded">
        <option value="">All Roles</option>
        <option value="admin">Admin</option>
        <option value="user">User</option>
        <option value="editor">Editor</option>
        <option value="viewer">Viewer</option>
      </select>
    </div>
  );
};

const UsersListView = () => {
  const { updateBreadcrumb } = useBreadcrumb();
  
  useEffect(() => {
    // Update the breadcrumb data when this page is loaded
    const breadcrumbData = [
      { label: "Dashboard", href: "/" },
      { label: "Users", href: "/users" }
    ];
    updateBreadcrumb(breadcrumbData);
  }, [updateBreadcrumb]);

  // Define columns for the data grid
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'role', headerName: 'Role', width: 120 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <span className={`px-2 py-1 rounded text-xs ${params.value === 'active' ? 'bg-green-100 text-green-800' :
            params.value === 'inactive' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
          }`}>
          {params.value}
        </span>
      )
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 180,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString()
    },
    {
      field: 'lastLogin',
      headerName: 'Last Login',
      width: 180,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString()
    }
  ];

  // Define tabs
  const tabs = [
    { label: "All Users", value: "all" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Pending", value: "pending" }
  ];

  const handleAddUser = () => {
    console.log("Add user button clicked");
    // Implement your add user logic here
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TableListView
        title="Users Management"
        data={allUsers}
        columns={columns}
        tabs={tabs}
        fetchData={fetchUsers}
        gridViewComponent={() => <UserGridView data={allUsers.slice(0, 12)} />}
        customFilterComponent={CustomFilter}
        searchPlaceholder="Search users"
        defaultPageSize={10}
        defaultSortField="createdAt"
        defaultSortOrder="desc"
        onAddItem={handleAddUser}
        addButtonText="Add User"
      />
    </QueryClientProvider>
  );
};

export default UsersListView;