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

interface Designation {
  key: number;
  name: string;
  employeeCount: number;
}

export default function Designation() {
  const [data, setData] = useState<Designation[]>([
    { key: 1, name: "E2o", employeeCount: 0 },
    { key: 2, name: "Digital Marketing Executive", employeeCount: 1 },
    { key: 3, name: "Director", employeeCount: 2 },
    { key: 4, name: "Senior Full Stack Developer", employeeCount: 0 },
    { key: 5, name: "Junior Full Stack Developer", employeeCount: 13 },
  ]);

  // ── Row Actions ─────────────────────────────
  const getRowMenuItems = (record: Designation) => [
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
  const columns: ColumnsType<Designation> = [
    {
      title: "Designation Name",
      dataIndex: "name",
    },
    {
      title: "Employee Count",
      dataIndex: "employeeCount",
      render: (count: number) => <a>{count}</a>,
    },
    {
      title: "Action",
      key: "action",
      width: 80,
      render: (_: unknown, record: Designation) => (
        <Dropdown
          menu={{ items: getRowMenuItems(record) }}
          trigger={["click"]}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  // ── Render ────────────────────────────────
  return (
    <div style={{ padding: 16 }}>
      <DataTable<Designation>
        title="Designations"
        count={data.length}
        columns={columns}
        data={data}
        rowKey="key"
        headerActions={
          <Space>
            <AddButton
              label="Add New"
              onClick={() => console.log("Add Designation")}
            />
          </Space>
        }
      />
    </div>
  );
}