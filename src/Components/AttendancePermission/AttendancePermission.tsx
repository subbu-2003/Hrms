import { useState } from "react";
import { Button, Select, Switch, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import "./AttendancePermission.css";

const { Text } = Typography;

interface Employee {
  key: number;
  id: number;
  name: string;
  department: string;
  designation: string;
  biometrics: string;
  method: string;
  mobile: boolean;
}

const initialData: Employee[] = [
  { key: 19, id: 19, name: "KIRUTHIKA R", department: "Developer Team", designation: "Junior Full Stack Developer", biometrics: "Fingerprint", method: "Hardware Device", mobile: false },
  { key: 18, id: 18, name: "ABITHA J", department: "Developer Team", designation: "Junior Full Stack Developer", biometrics: "Fingerprint", method: "Hardware Device", mobile: false },
  { key: 17, id: 17, name: "ARUN RAJEEV L", department: "Marketing Team", designation: "Digital Marketing Executive", biometrics: "Fingerprint", method: "Hardware Device", mobile: false },
  { key: 16, id: 16, name: "Ashok Kumar N", department: "Management Team", designation: "Director", biometrics: "-", method: "Hardware Device", mobile: true },
  { key: 15, id: 15, name: "Vetrivel U", department: "Management Team", designation: "Director", biometrics: "-", method: "Hardware Device", mobile: true },
  { key: 11, id: 11, name: "Aabith", department: "Developer Team", designation: "Junior Full Stack Developer", biometrics: "Fingerprint", method: "Hardware Device", mobile: true },
];

function FingerprintIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="ap-icon">
      <path d="M12 2C9.5 2 7.3 3.1 5.8 4.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18.2 4.9C16.7 3.1 14.5 2 12 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 9.5C3.4 10.9 3 12.4 3 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 19.5C6.6 20.4 7.4 21.1 8.4 21.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 8C10.3 8 9 9.3 9 11C9 13.5 10 15.5 11.5 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15 11C15 9.3 13.7 8 12 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 11C12 12.5 12.3 13.9 12.8 15.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 9C17.6 8 17 7.2 16.2 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M21 14C21 12.4 20.6 10.9 20 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M17 18C17.8 16.6 18.5 15 18.8 13.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14.5 21C15.5 20.3 16.3 19.3 17 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function HardwareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="ap-icon">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}

function MobileIcon() {
  return (
    <svg width="12" height="14" viewBox="0 0 24 24" fill="none" className="ap-icon">
      <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <line x1="9" y1="18" x2="15" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function AttendancePermission() {
  const [data, setData] = useState<Employee[]>(initialData);
  const [branch, setBranch] = useState<string>("1");
  const [device, setDevice] = useState<string>("1");
  const [attempts, setAttempts] = useState<number>(7);

  const toggleMobile = (key: number, checked: boolean) => {
    setData(prev =>
      prev.map(item => (item.key === key ? { ...item, mobile: checked } : item))
    );
  };

  const handleEnableAll = () =>
    setData(prev => prev.map(item => ({ ...item, mobile: true })));

  const handleDisableAll = () =>
    setData(prev => prev.map(item => ({ ...item, mobile: false })));

  const columns: ColumnsType<Employee> = [
    {
      title: "Employee ID",
      dataIndex: "id",
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Employee Name",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Department",
      dataIndex: "department",
      sorter: (a, b) => a.department.localeCompare(b.department),
    },
    {
      title: "Designation",
      dataIndex: "designation",
      sorter: (a, b) => a.designation.localeCompare(b.designation),
    },
    {
      title: "Biometrics Registered",
      dataIndex: "biometrics",
      render: (val: string) =>
        val === "-" ? (
          <Text type="secondary">-</Text>
        ) : (
          <span className="ap-biometrics">
            <FingerprintIcon />
            {val}
          </span>
        ),
    },
    {
      title: "Attendance Method",
      dataIndex: "method",
      render: (_: string, record: Employee) => (
        <div className="ap-method-cell">
          <span className="ap-method-tag">
            <HardwareIcon />
            Hardware Device
          </span>
          {record.mobile && (
            <>
              <span className="ap-method-divider">|</span>
              <span className="ap-method-tag">
                <MobileIcon />
                Mobile App
              </span>
            </>
          )}
        </div>
      ),
    },
    {
      title: "Mobile Attendance",
      dataIndex: "mobile",
      render: (_: boolean, record: Employee) => (
        <Switch
          checked={record.mobile}
          onChange={(checked) => toggleMobile(record.key, checked)}
        />
      ),
    },
  ];

  return (
    <div className="ap-wrapper">
      <div className="table-card">

        {/* ── Header ───────────────────────────────────────── */}
        <div className="table-header">
          <Text className="table-title">Attendance Permission</Text>

          {/* Action groups — wrap into rows on mobile */}
          <div className="ap-header-actions">
            <div className="ap-action-group">
              <Text className="ap-group-label">Mobile Attendance</Text>
              <Space size={8}>
                <Button onClick={handleEnableAll}>Enable</Button>
                <Button onClick={handleDisableAll}>Disable</Button>
              </Space>
            </div>
            <div className="ap-action-group">
              <Text className="ap-group-label">Geo Fencing</Text>
              <Space size={8}>
                <Button>Enable</Button>
                <Button>Disable</Button>
              </Space>
            </div>
          </div>
        </div>

        {/* ── Filters ──────────────────────────────────────── */}
        <div className="ap-filters">
          <div className="ap-filter-item">
            <label className="ap-filter-label">Choose Branch</label>
            <Select
              value={branch}
              onChange={setBranch}
              style={{ width: "100%" }}
              options={[{ label: "The E2o Technologies", value: "1" }]}
            />
          </div>
          <div className="ap-filter-item">
            <label className="ap-filter-label">Choose Device</label>
            <Select
              value={device}
              onChange={setDevice}
              style={{ width: "100%" }}
              options={[{ label: "The E2o Technologies", value: "1" }]}
            />
          </div>
          <div className="ap-filter-item">
            <label className="ap-filter-label">Choose No Of Attempt</label>
            <Select
              value={attempts}
              onChange={setAttempts}
              style={{ width: "100%" }}
              options={[
                { label: "3 Attempt", value: 3 },
                { label: "5 Attempt", value: 5 },
                { label: "7 Attempt", value: 7 },
              ]}
            />
          </div>
        </div>

        {/* ── Table ────────────────────────────────────────── */}
        <div className="table-scroll-wrapper">
          <Table<Employee>
            columns={columns}
            dataSource={data}
            rowKey="key"
            rowSelection={{ type: "checkbox" }}
            pagination={{ pageSize: 6 }}
            className="ap-table"
            scroll={{ x: "max-content" }}
          />
        </div>

      </div>
    </div>
  );
}