import { useState, useEffect } from "react";
import {
  Button,
  Dropdown,
  Checkbox,
  Space,
  Modal,
  Tag,
  Descriptions,
  Form,
  Input,
  Select,
  DatePicker,Row,Col,
} from "antd";
import { DownOutlined, MoreOutlined, FilterOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import DataTable from "../../Utils/DataTable";
import AddButton from "../../Utils/AddButton";
import "./Employee.css";

interface Employee {
  key: number;
  employeeId: number;
  employeeName: string;
  department: string;
  designation: string;
  dateOfJoining: string;
  masterBranch: string;
  status: "Active" | "Inactive";
  tags: string[];
}

const actionsMenuItems = [
  { key: "import", label: "Import" },
  { key: "download", label: "Download Sample" },
  { key: "bulk", label: "Bulk Update Employee" },
  { key: "export", label: "Export" },
  { key: "viewDownloads", label: "View Downloads" },
];

type FilterableKey =
  | "employeeId"
  | "employeeName"
  | "department"
  | "designation"
  | "dateOfJoining"
  | "masterBranch"
  | "status";

const DEPARTMENTS = ["Developer Team", "Marketing Team", "Management Team"];
const DESIGNATIONS = [
  "Junior Full Stack Developer",
  "Digital Marketing Executive",
  "Director",
];
const BRANCHES = ["The E2o Technologies Private Limited"];

export default function Employee() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // ── View modal ──────────────────────────────────────────────────────────────
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // ── Add / Edit modal ────────────────────────────────────────────────────────
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (formModalOpen) {
      if (editingEmployee) {
        form.setFieldsValue({
          employeeName: editingEmployee.employeeName,
          department: editingEmployee.department,
          designation: editingEmployee.designation,
          dateOfJoining: dayjs(editingEmployee.dateOfJoining, "DD MMM YYYY"),
          masterBranch: editingEmployee.masterBranch,
          status: editingEmployee.status,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ status: "Active" });
      }
    }
  }, [formModalOpen, editingEmployee, form]);

  const [data, setData] = useState<Employee[]>([
    { key: 7, employeeId: 7, employeeName: "KIRUTHIKA R", department: "Developer Team", designation: "Junior Full Stack Developer", dateOfJoining: "20 Mar 2026", masterBranch: "The E2o Technologies Private Limited", status: "Active", tags: [] },
    { key: 6, employeeId: 6, employeeName: "ABITHA J", department: "Developer Team", designation: "Junior Full Stack Developer", dateOfJoining: "20 Mar 2026", masterBranch: "The E2o Technologies Private Limited", status: "Active", tags: [] },
    { key: 5, employeeId: 5, employeeName: "ARUN RAJEEV L", department: "Marketing Team", designation: "Digital Marketing Executive", dateOfJoining: "16 Mar 2026", masterBranch: "The E2o Technologies Private Limited", status: "Active", tags: [] },
    { key: 4, employeeId: 4, employeeName: "Ashok Kumar N", department: "Management Team", designation: "Director", dateOfJoining: "12 Dec 2025", masterBranch: "The E2o Technologies Private Limited", status: "Active", tags: [] },
    { key: 3, employeeId: 3, employeeName: "Vetrivel U", department: "Management Team", designation: "Director", dateOfJoining: "12 Dec 2025", masterBranch: "The E2o Technologies Private Limited", status: "Active", tags: [] },
    { key: 2, employeeId: 2, employeeName: "Aabith", department: "Developer Team", designation: "Junior Full Stack Developer", dateOfJoining: "05 Jan 2026", masterBranch: "The E2o Technologies Private Limited", status: "Active", tags: [] },
    { key: 1, employeeId: 1, employeeName: "Hema Priya V", department: "Developer Team", designation: "Junior Full Stack Developer", dateOfJoining: "15 Dec 2025", masterBranch: "The E2o Technologies Private Limited", status: "Active", tags: [] },
  ]);

  const openAddModal = () => { setEditingEmployee(null); setFormModalOpen(true); };
  const openEditModal = (record: Employee) => { setEditingEmployee(record); setFormModalOpen(true); };
  const closeFormModal = () => { form.resetFields(); setEditingEmployee(null); setFormModalOpen(false); };

  const handleFormSave = () => {
    form.validateFields().then((values) => {
      const formattedDate = dayjs(values.dateOfJoining).format("DD MMM YYYY");
      if (editingEmployee) {
        setData((prev) => prev.map((emp) => emp.key === editingEmployee.key ? { ...emp, ...values, dateOfJoining: formattedDate } : emp));
      } else {
        const nextId = data.length > 0 ? Math.max(...data.map((d) => d.employeeId)) + 1 : 1;
        setData((prev) => [{ key: nextId, employeeId: nextId, ...values, dateOfJoining: formattedDate, tags: [] }, ...prev]);
      }
      closeFormModal();
    }).catch(() => {});
  };

  // ── Filter helpers ──────────────────────────────────────────────────────────
  const getFilters = (key: FilterableKey) =>
    Array.from(new Set(data.map((d) => String(d[key])))).map((val) => ({ text: val, value: val }));

  const buildFilterDropdown =
    (dataIndex: FilterableKey) =>
    ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: {
      setSelectedKeys: (keys: React.Key[]) => void;
      selectedKeys: React.Key[];
      confirm: () => void;
      clearFilters?: () => void;
    }) => (
      <div style={{ padding: "8px 12px", minWidth: 200 }}>
        <div style={{ marginBottom: 8 }}>
          {getFilters(dataIndex).map((opt) => (
            <div
              key={opt.value}
              style={{ padding: "4px 0", cursor: "pointer" }}
              onClick={() => {
                const current = selectedKeys as string[];
                const next = current.includes(opt.value)
                  ? current.filter((k) => k !== opt.value)
                  : [...current, opt.value];
                setSelectedKeys(next);
              }}
            >
              <Space>
                <Checkbox checked={(selectedKeys as string[]).includes(opt.value)} />
                <span>{opt.text}</span>
              </Space>
            </div>
          ))}
        </div>
        <Space style={{ marginTop: 8 }}>
          <Button type="primary" size="small" style={{ width: 80 }} onClick={() => confirm()}>Search</Button>
          <Button size="small" style={{ width: 70 }} onClick={() => { clearFilters?.(); confirm(); }}>Reset</Button>
        </Space>
      </div>
    );

  const makeOnFilter =
    (dataIndex: FilterableKey) =>
    (value: boolean | React.Key, record: Employee) =>
      String(record[dataIndex]) === String(value);

  const updateStatus = (key: number, newStatus: "Active" | "Inactive") => {
    setData((prev) => prev.map((emp) => emp.key === key ? { ...emp, status: newStatus } : emp));
  };

  const getRowMenuItems = (record: Employee) => [
    { key: "view", label: "View", onClick: () => { setSelectedEmployee(record); setViewModalOpen(true); } },
    { key: "edit", label: "Edit", onClick: () => openEditModal(record) },
    { key: "delete", label: "Delete", onClick: () => setData((prev) => prev.filter((emp) => emp.key !== record.key)) },
  ];

  // ── Columns ─────────────────────────────────────────────────────────────────
  // ✅ FIX: filterIcon={() => <FilterOutlined />} forces Ant to render the
  //    filter trigger INSIDE the header cell instead of a separate <tr>,
  //    which eliminates the ghost empty row below the header.
  const withFilter = (dataIndex: FilterableKey) => ({
    filterDropdown: buildFilterDropdown(dataIndex),
    filterIcon: () => <FilterOutlined style={{ color: "#aaa", fontSize: 12 }} />,
    onFilter: makeOnFilter(dataIndex),
  });

  const columns: ColumnsType<Employee> = [
    {
      title: (
        <Checkbox
          checked={selectedRowKeys.length === data.length && data.length > 0}
          indeterminate={selectedRowKeys.length > 0 && selectedRowKeys.length < data.length}
          onChange={(e) => setSelectedRowKeys(e.target.checked ? data.map((d) => d.key) : [])}
        />
      ),
      dataIndex: "checkbox",
      width: 50,
      render: (_: unknown, record: Employee) => (
        <Checkbox
          checked={selectedRowKeys.includes(record.key)}
          onChange={(e) => setSelectedRowKeys((prev) => e.target.checked ? [...prev, record.key] : prev.filter((k) => k !== record.key))}
        />
      ),
    },
    { title: "Employee ID",    dataIndex: "employeeId",    ...withFilter("employeeId") },
    { title: "Employee Name",  dataIndex: "employeeName",  ...withFilter("employeeName") },
    { title: "Department",     dataIndex: "department",    ...withFilter("department") },
    { title: "Designation",    dataIndex: "designation",   ...withFilter("designation") },
    { title: "Date Of Joining",dataIndex: "dateOfJoining", ...withFilter("dateOfJoining") },
    {
      title: "Master Branch",
      dataIndex: "masterBranch",
      ...withFilter("masterBranch"),
      render: (text: string) => <a className="branch-link">{text}</a>,
    },
    {
      title: "Status",
      dataIndex: "status",
      ...withFilter("status"),
      render: (status: string, record: Employee) => (
        <Dropdown
          menu={{
            items: [
              { key: "Active",   label: "Active",   onClick: () => updateStatus(record.key, "Active") },
              { key: "Inactive", label: "Inactive", onClick: () => updateStatus(record.key, "Inactive") },
            ],
          }}
          trigger={["click"]}
        >
          <Space style={{ cursor: "pointer" }}>
            <span className={`status-cell ${status === "Active" ? "active" : "inactive"}`}>
              <span className={`status-dot ${status === "Active" ? "active" : "inactive"}`} />
              {status}
            </span>
            <DownOutlined className="status-chevron" />
          </Space>
        </Dropdown>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 50,
      render: (_: unknown, record: Employee) => (
        <Dropdown menu={{ items: getRowMenuItems(record) }} trigger={["click"]}>
          <Button type="text" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="employee-wrapper">
  <div className="table-scroll-wrapper">
    <DataTable<Employee>
      title="Total Active Employees"
      count={data.length}
      columns={columns}
      data={data}
      rowKey="employeeId"
      headerActions={
        <Space>
          <AddButton label="Add New" className="employee-add-btn" onClick={openAddModal} />
          <Button>Attendance Permission</Button>
          <Dropdown menu={{ items: actionsMenuItems }} trigger={["click"]}>
            <Button>Actions <DownOutlined /></Button>
          </Dropdown>
        </Space>
      }
    />
  </div>


      {/* ── Add / Edit Modal ─────────────────────────────────────────────────── */}
      <Modal
        title={editingEmployee ? "Edit Employee" : "Add Employee"}
        open={formModalOpen}
        onCancel={closeFormModal}
        onOk={handleFormSave}
        okText={editingEmployee ? "Update" : "Add"}
        cancelText="Cancel"
        width={700}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Employee Name" name="employeeName" rules={[{ required: true, message: "Please enter employee name" }]}>
                <Input placeholder="Enter employee name" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Department" name="department" rules={[{ required: true, message: "Please select department" }]}>
                <Select placeholder="Select department">
                  {DEPARTMENTS.map((d) => <Select.Option key={d} value={d}>{d}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Designation" name="designation" rules={[{ required: true, message: "Please select designation" }]}>
                <Select placeholder="Select designation">
                  {DESIGNATIONS.map((d) => <Select.Option key={d} value={d}>{d}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Date Of Joining" name="dateOfJoining" rules={[{ required: true, message: "Please select date of joining" }]}>
                <DatePicker format="DD MMM YYYY" style={{ width: "100%" }} placeholder="Select date" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Master Branch" name="masterBranch" rules={[{ required: true, message: "Please select master branch" }]}>
                <Select placeholder="Select master branch">
                  {BRANCHES.map((b) => <Select.Option key={b} value={b}>{b}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Status" name="status" rules={[{ required: true, message: "Please select status" }]}>
                <Select placeholder="Select status">
                  <Select.Option value="Active">Active</Select.Option>
                  <Select.Option value="Inactive">Inactive</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* ── View Modal ───────────────────────────────────────────────────────── */}
      <Modal
        title="Employee Details"
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[<Button key="close" onClick={() => setViewModalOpen(false)}>Close</Button>]}
        width={420}
      >
        {selectedEmployee && (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Employee ID">{selectedEmployee.employeeId}</Descriptions.Item>
            <Descriptions.Item label="Name">{selectedEmployee.employeeName}</Descriptions.Item>
            <Descriptions.Item label="Department">{selectedEmployee.department}</Descriptions.Item>
            <Descriptions.Item label="Designation">{selectedEmployee.designation}</Descriptions.Item>
            <Descriptions.Item label="Date of Joining">{selectedEmployee.dateOfJoining}</Descriptions.Item>
            <Descriptions.Item label="Master Branch">{selectedEmployee.masterBranch}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={selectedEmployee.status === "Active" ? "green" : "red"}>{selectedEmployee.status}</Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}