import { Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import React from "react";

const { Title } = Typography;

interface DataTableProps<T extends object> {
  title?: string;
  count?: number;
  headerActions?: React.ReactNode;

  columns: ColumnsType<T>;
  data: T[];
  rowKey: string;

  pageSize?: number;
  bordered?: boolean;
  loading?: boolean;
}

export default function DataTable<T extends object>({
  title,
  count,
  headerActions,
  columns,
  data,
  rowKey,
  pageSize = 6,
  bordered = false,
  loading = false,
}: DataTableProps<T>) {
  return (
    <div className="table-card">
      
      {/* 🔹 HEADER */}
      {(title || headerActions) && (
        <div className="table-header">
          <Title level={4} className="table-title">
            {title}{" "}
            {count !== undefined && (
              <span className="table-count">{count}</span>
            )}
          </Title>

          <div className="table-actions">
            {headerActions}
          </div>
        </div>
      )}

      {/* 🔹 TABLE */}
    <Table<T>
  columns={columns}
  dataSource={data}
  rowKey={rowKey}
  bordered={bordered}
  loading={loading}
  pagination={{
    pageSize,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "50"],
    showTotal: (total, range) =>
      `Showing ${range[0]} to ${range[1]} of ${total} Results`,
  }}
  
/>
    </div>
  );
}