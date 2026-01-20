import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import Header from "../header/Header";

const SidebarLayout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col flex-1">
        {/* <Header /> */}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
export default SidebarLayout;
