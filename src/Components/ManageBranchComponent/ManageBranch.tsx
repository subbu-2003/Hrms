import { useState } from "react";
import {
  Button,
  Dropdown,
} from "antd";
import { MoreOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import DataTable from "../../Utils/DataTable";
import "./ManageBranch.css";

interface Branch {
  key: number;
  locationName: string;
  radius: string;
  employees: number;
  createdOn: string;
}

export default function ManageBranch() {
  const [data, setData] = useState<Branch[]>([
    {
      key: 1,
      locationName: "The E2o Technologies Private Limited",
      radius: "-",
      employees: 16,
      createdOn: "29-11-2025",
    },
  ]);

  // ── Row Actions ───────────────────────
  const getRowMenuItems = (record: Branch) => [
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

  // ── Columns ──────────────────────────
  const columns: ColumnsType<Branch> = [
    {
      title: "Location Name",
      dataIndex: "locationName",
    },
    {
      title: "Allowed Radius (Meter)",
      dataIndex: "radius",
    },
    {
      title: "Assigned Employees",
      dataIndex: "employees",
    },
    {
      title: "Created On",
      dataIndex: "createdOn",
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      render: (_: unknown, record: Branch) => (
        <Dropdown
          menu={{ items: getRowMenuItems(record) }}
          trigger={["click"]}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="manage-branch">

      {/* 🔹 Header */}
      <div className="manage-branch-header">
        <div className="left">
          <span className="title">Manage Branch</span>
        </div>

        <div className="right">
          <span className="note">
            <b>Note:</b> To create a new branch contact Payroll Support Team
          </span>
        </div>
      </div>

      {/* 🔹 Table */}
      <DataTable<Branch>
        columns={columns}
        data={data}
        rowKey="key"
      />

    </div>
  );
}