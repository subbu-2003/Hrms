
import { Routes, Route } from "react-router-dom";
import Layout from "./Components/LayoutComponent/Layout";
import Login from "./Components/LoginComponent/Login";
import Employee from "./Components/EmployeeComponent/Employee";
import Profile from "./Components/ProfileComponent/Profile";
import Department from "./Components/DepartmentComponent/Department";
import Designation from "./Components/DesignationComponent/Designation";
import AttendancePermission from "./Components/AttendancePermission/AttendancePermission";
import ManageBranch from "./Components/ManageBranchComponent/ManageBranch";
import Camera from "./Components/CameraComponent/Camera";
import FacebookLogin from "./Components/FacebookComponent/Facebooklogin";


export default function App() {
  return (
    <div className="">
     <Routes>
        <Route path="/" element={<Layout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/fblogin" element={<FacebookLogin />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
        <Route path="/employee" element={<Employee />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/department" element={<Department />} />
        <Route path="/designation" element={<Designation />} />
        <Route path="/camera" element={<Camera />} />
        <Route path="/attendancepermission" element={<AttendancePermission />} />
        <Route path="/managebranch" element={<ManageBranch />} />
      </Route>
    </Routes>
    </div>
  );
}