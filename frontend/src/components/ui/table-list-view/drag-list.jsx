import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchIcon } from 'lucide-react';
import { Input } from '../input';

const SortableRow = ({ id, children, disabled }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: isDragging ? '#f0f9ff' : 'inherit',
    opacity: isDragging ? 0.8 : 1,
    borderBottom: '1px solid #d1d5db',
  };

  return (
    <tr ref={setNodeRef} style={style} {...attributes}>
      <td className="p-2 text-left">
        <div
          ref={setActivatorNodeRef}
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
        >
          <div className="w-[30px]">
            <GripVertical className="h-5 w-5 text-gray-500" />
          </div>
        </div>
      </td>
      {children}
    </tr>
  );
};

const TableListView = ({ columns, fetchData, isDraggable, isLoading, onDragEnd, defaultSortField, defaultSortOrder, searchPlaceholder, tabs, onAddItem, addButtonText, ...props }) => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState(defaultSortField || 'createdAt');
  const [order, setOrder] = useState(defaultSortOrder || 'desc');
  const [activeTab, setActiveTab] = useState(tabs?.[0]?.value || 'all');
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const fetchTableData = useCallback(async () => {
    if (!fetchData) return;

    console.log('Fetching data with params:', { search, sortBy, order, tab: activeTab });

    try {
      const result = await fetchData({ search, sortBy, order, tab: activeTab });
      setData(result.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    }
  }, [fetchData, search, sortBy, order, activeTab]);

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    console.log('Drag end:', { activeId: active?.id, overId: over?.id });

    if (!over || active.id === over.id) {
      console.log('No reorder needed: same position or invalid drop');
      return;
    }

    const oldIndex = data.findIndex((item) => item.id === active.id);
    const newIndex = data.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      console.error('Invalid indices:', { oldIndex, newIndex });
      return;
    }

    const newData = [...data];
    const [movedItem] = newData.splice(oldIndex, 1);
    newData.splice(newIndex, 0, movedItem);

    console.log('New order:', newData.map((item) => item.id));

    setData(newData);

    if (onDragEnd) {
      onDragEnd({ oldIndex, newIndex, newData });
    }
  };

  const renderTableBody = () => {
    if (isDraggable && !isLoading) {
      return (
        <SortableContext items={data.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          {data.map((row) => (
            <SortableRow key={row.id} id={row.id} disabled={isLoading || !isDraggable}>
              {columns.map((column) => (
                <td
                  key={column.field}
                  className={`${column.cellClassName || 'p-2 text-left'} truncate max-w-[100px]`}
                  style={{ minWidth: column.minWidth || '100px' }}
                >
                  {column.renderCell
                    ? column.renderCell({ row, value: row[column.field] })
                    : row[column.field] || ''}
                </td>
              ))}
            </SortableRow>
          ))}
        </SortableContext>
      );
    }

    return (
      <>
        {data.map((row) => (
          <tr key={row.id} style={{ borderBottom: '1px solid #d1d5db' }}>
            {isDraggable && <td className="p-2 text-left"></td>}
            {columns.map((column) => (
              <td
                key={column.field}
                className={`${column.cellClassName || 'p-2 text-left'} truncate max-w-[200px]`}
                style={{ minWidth: column.minWidth || '100px' }}
              >
                {column.renderCell
                  ? column.renderCell({ row, value: row[column.field] })
                  : row[column.field] || ''}
              </td>
            ))}
          </tr>
        ))}
      </>
    );
  };

  const allColumns = [
    ...(isDraggable
      ? [
          {
            field: 'dragHandle',
            headerName: '',
            headerClassName: 'bg-[#1A6FAB] text-white px-2 py-6.5 text-left',
            cellClassName: 'px-2 py-6.5 text-left',
            minWidth: '50px',
          },
        ]
      : []),
    ...columns.map((column) => ({
      ...column,
      headerClassName: column.headerClassName || 'bg-[#1A6FAB] text-white px-2 py-6.5 text-left',
      cellClassName: column.cellClassName || 'p-2 text-left',
      minWidth: column.minWidth || '100px',
      maxWidth: column.maxWidth || '300px',
    })),
  ];

  return (
   <div className="">
  <section className=" w-full flex-1  flex flex-col ">
    <div className="table-list-view flex flex-col bg-white shadow-lg  h-[600px] border-b">
      <div className="flex justify-between mb-1 px-4 py-3">
        <div className="relative w-full sm:w-auto ml-4 w-[260px]">
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="py-2 pr-10 pl-4 w-full w-[200px]"
          />
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 mt-2">
            <SearchIcon className="size-4" />
          </span>
        </div>
        {onAddItem && (
          <Button
            size="sm"
            onClick={onAddItem}
            className="bg-[#1A6FAB] text-white hover:bg-[#1A6FAB] hover:text-white mt-2 sm:mt-0"
          >
            <PlusIcon className="size-4 mr-2 text-white" />
            {addButtonText}
          </Button>
        )}
      </div>
      {tabs && (
        <div className="flex gap-2 mb-4 border-b border-gray-300 px-4">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              className={`p-2 border-b-2 text-[14px] cursor-pointer ${
                activeTab === tab.value
                  ? 'border-[#1A6FAB] text-[#1A6FAB]'
                  : 'border-transparent text-[#939393]'
              }`}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        autoScroll={true}
      >
       <div className="flex-1 overflow-x-auto mx-4 rounded-md border-t border-t-gray-200 mb-4 border" style={{ height: '800px' }}>
  <table className="w-full table-auto border-collapse border-b border-gray-300">
    <thead className="sticky top-0 z-10">
      <tr>
        {allColumns.map((column) => (
          <th
            key={column.field}
            className={column.headerClassName}
            style={{ minWidth: column.minWidth, maxWidth: column.maxWidth }}
          >
            {column.headerName}
          </th>
        ))}
      </tr>
    </thead>
  </table>
  <div className="overflow-y-auto" style={{ maxHeight: 'calc(400px - 40px)' }}>
  <table className="w-full table-auto border-collapse">
    <tbody>
      {isLoading ? (
        <tr>
          <td colSpan={allColumns.length} className="text-left p-2">
            Loading...
          </td>
        </tr>
      ) : data.length === 0 ? (
        <tr>
          <td colSpan={allColumns.length} className="text-center p-2 text-gray-500 h-[calc(400px-40px)] align-middle">
            <div className="flex items-center justify-center h-full">
              No rows
            </div>
          </td>
        </tr>
      ) : (
        renderTableBody()
      )}
    </tbody>
    <tfoot></tfoot>
  </table>
</div>
</div>
      </DndContext>
    </div>
  </section>
</div>
  );
};

TableListView.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string.isRequired,
      headerName: PropTypes.string.isRequired,
      headerClassName: PropTypes.string,
      cellClassName: PropTypes.string,
      renderCell: PropTypes.func,
      width: PropTypes.string,
      minWidth: PropTypes.string,
      maxWidth: PropTypes.string,
    })
  ).isRequired,
  fetchData: PropTypes.func.isRequired,
  isDraggable: PropTypes.bool,
  isLoading: PropTypes.bool,
  onDragEnd: PropTypes.func,
  defaultSortField: PropTypes.string,
  defaultSortOrder: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
    })
  ),
  onAddItem: PropTypes.func,
  addButtonText: PropTypes.string,
};

TableListView.defaultProps = {
  isDraggable: false,
  isLoading: false,
  onDragEnd: () => {},
  defaultSortField: 'createdAt',
  defaultSortOrder: 'desc',
  searchPlaceholder: 'Search...',
  tabs: [],
  onAddItem: null,
  addButtonText: 'Add Item',
};

export default TableListView;