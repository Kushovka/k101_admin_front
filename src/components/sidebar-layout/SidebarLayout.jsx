import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import { useState } from "react";
import Header from "../header/Header";

const SidebarLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="flex flex-col flex-1">
        <Header />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
export default SidebarLayout;
