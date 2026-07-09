import { useState } from "react";
import {
  Button,
  Dropdown,
  Space,
} from "antd";
import { MoreOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import DataTable from "../../Utils/DataTable";
import AddButton from "../../Utils/AddButton";



interface Department {
  key: number;
  name: string;
  employeeCount: number;
}

export default function Department() {
  const [data, setData] = useState<Department[]>([
    { key: 1, name: "Management Team", employeeCount: 2 },
    { key: 2, name: "Finance Team", employeeCount: 0 },
    { key: 3, name: "Marketing Team", employeeCount: 1 },
    { key: 4, name: "Developer Team", employeeCount: 13 },
  ]);

  // ── Row Actions ─────────────────────────────
  const getRowMenuItems = (record: Department) => [
    {
      key: "edit",
      label: "Edit",
      onClick: () => console.log("Edit", record),
    },
    {
      key: "delete",
      label: "Delete",
      onClick: () =>
        setData((prev) => prev.filter((d) => d.key !== record.key)),
    },
  ];

  // ── Columns ────────────────────────────────
  const columns: ColumnsType<Department> = [
    {
      title: "Department Name",
      dataIndex: "name",
    },
    {
      title: "Employee Count",
      dataIndex: "employeeCount",
      render: (count: number) => (
        <a>{count}</a>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 80,
      render: (_: unknown, record: Department) => (
        <Dropdown
          menu={{ items: getRowMenuItems(record) }}
          trigger={["click"]}
        >
          <Button
            type="text"
            icon={<MoreOutlined />}
          />
        </Dropdown>
      ),
    },
  ];

  // ── Render ────────────────────────────────
  return (
    <div style={{ padding: 16 }}>
      <DataTable<Department>
        title="Departments"
        count={data.length}
        columns={columns}
        data={data}
        rowKey="key"
        headerActions={
          <Space>
            <AddButton
              label="Add New"
              onClick={() => console.log("Add Department")}
            />
          </Space>
        }
      />
    </div>
  );
}