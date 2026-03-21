import { FaUsers } from "react-icons/fa";
import { FaRegCircleUser } from "react-icons/fa6";
import { GoChevronRight } from "react-icons/go";
import { IoIosSearch } from "react-icons/io";
import { IoExitOutline } from "react-icons/io5";
import {
  MdAttachMoney,
  MdDownloading,
  MdOutlineAnalytics,
} from "react-icons/md";
import { RxHamburgerMenu } from "react-icons/rx";

import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "./SidebarContext";

import type { ReactElement, SVGProps } from "react";
import { FiMessageSquare } from "react-icons/fi";
import { getPendingComplaintsCount } from "../../api/complaints";

interface SidebarLink {
  name: string;
  icon: ReactElement<SVGProps<SVGAElement>>;
  path: string;
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const count = await getPendingComplaintsCount();
        setPendingCount(count);
      } catch (e) {
        console.error(e);
      }
    };

    fetchCount();

    const interval = setInterval(fetchCount, 60000);

    return () => clearInterval(interval);
  }, []);

  const { isOpen, setIsOpen } = useSidebar();

  // links
  const links: SidebarLink[] = [
    { name: "Профиль", icon: <FaRegCircleUser />, path: "/account/profile" },
    { name: "Пользователи", icon: <FaUsers />, path: "/account/users" },
    {
      name: "Загрузка",
      icon: <MdDownloading />,
      path: "/account/upload-files",
    },
    // {
    //   name: "Health Check",
    //   icon: <IoDocumentTextOutline />,
    //   path: "/account/health-check",
    // },
    {
      name: "Системная статистика",
      icon: <MdOutlineAnalytics />,
      path: "/account/system-stats",
    },
    {
      name: "Обращения",
      icon: <FiMessageSquare />,
      path: "/account/complaints",
    },
    {
      name: "Тарифы",
      icon: <MdAttachMoney />,
      path: "/account/plans",
    },
    { name: "Поиск", icon: <IoIosSearch />, path: "/account/search" },
  ];

  const isActive = (path: string): boolean =>
    location.pathname.startsWith(path);

  return (
    <section
      className={clsx(
        "fixed h-screen text-slate-300 bg-sbr pl-4 py-4 flex flex-col justify-between transition-all duration-300 ease-in-out min-w-[80px]",
        isOpen ? "w-[80px]" : "w-[300px]",
      )}
    >
      {/* hamburger */}
      <button
        data-testid="hamburger-button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={clsx(
          "flex justify-end px-3 py-2 mb-6 text-slate-400 hover:text-white transition",
          isOpen && "items-center justify-center",
        )}
      >
        {isOpen ? <GoChevronRight size={36} /> : <RxHamburgerMenu size={30} />}
      </button>

      {/* links */}
      <div className="flex flex-col gap-4 flex-1">
        {links.map((link) => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className={clsx(
              "flex items-center gap-3 rounded-l-md px-3 py-2 text-left transition-colors",
              isActive(link.path)
                ? "bg-white text-blue01"
                : "bg-transparent text-slate-300 hover:text-white",
            )}
          >
            <div className="relative flex items-center">
              {React.cloneElement(link.icon, {
                className: isOpen ? "w-8 h-8" : "w-5 h-5",
              })}

              {link.path === "/account/complaints" && pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[16px] h-[16px] flex items-center justify-center rounded-full px-[4px]">
                  {pendingCount > 99 ? "99+" : pendingCount}
                </span>
              )}
            </div>
            <span
              className={clsx(
                "transition-opacity duration-300 whitespace-nowrap",
                isOpen ? "opacity-0 w-0" : "opacity-100 w-auto",
              )}
            >
              {link.name}
            </span>
          </button>
        ))}
      </div>

      {/* exit */}
      <button
        onClick={() => {
          localStorage.removeItem("admin_access_token");
          localStorage.removeItem("admin_refresh_token");
          navigate("/sign-in", { replace: true });
        }}
        className={clsx(
          "flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-blue01 hover:bg-white rounded-l-md transition",
        )}
      >
        <IoExitOutline
          className={clsx(
            "transition-all duration-300 rotate-180 flex-shrink-0",
            isOpen ? "w-8 h-8" : "w-5 h-5",
          )}
        />
        <span
          className={clsx(
            "transition-opacity duration-300 text-left min-w-[50px]",
            isOpen && "opacity-0",
          )}
        >
          Выход
        </span>
      </button>
    </section>
  );
};

export default Sidebar;
