import { FaRegCircleUser } from "react-icons/fa6";
import { MdDownloading, MdOutlineAnalytics } from "react-icons/md";
import { IoDocumentTextOutline, IoExitOutline } from "react-icons/io5";
import { IoIosSearch } from "react-icons/io";
import { RxHamburgerMenu } from "react-icons/rx";
import { GoChevronRight } from "react-icons/go";

import clsx from "clsx";
import { useLocation, useNavigate } from "react-router-dom";
import React from "react";
import { useSidebar } from "./SidebarContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { isOpen, setIsOpen } = useSidebar();

  const links = [
    { name: "Пользователи", icon: <FaRegCircleUser />, path: "/account/users" },
    {
      name: "Загрузка",
      icon: <MdDownloading />,
      path: "/account/upload-files",
    },
    {
      name: "Health Check",
      icon: <IoDocumentTextOutline />,
      path: "/account/health-check",
    },
    {
      name: "Системная статистика",
      icon: <MdOutlineAnalytics />,
      path: "/account/system-stats",
    },
    { name: "Поиск", icon: <IoIosSearch />, path: "/account/search" },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <section
      className={clsx(
        "fixed h-screen text-white bg-blue01 pl-4 py-4 flex flex-col justify-between transition-all duration-300 ease-in-out min-w-[80px]",
        isOpen ? "w-[80px]" : "w-[300px]"
      )}
    >
      {/* Гамбургер */}
      <button
        data-testid="hamburger-button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={clsx(
          "flex justify-end mb-20 pr-4",
          isOpen && "items-center justify-center"
        )}
      >
        {isOpen ? <GoChevronRight size={36} /> : <RxHamburgerMenu size={30} />}
      </button>

      {/* Ссылки */}
      <div className="flex flex-col gap-4 flex-1">
        {links.map((link) => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className={clsx(
              "flex items-center gap-2 rounded-l-lg px-2 py-2 cursor-pointer transition-all duration-300",
              isActive(link.path)
                ? "bg-white text-blue01"
                : "bg-transparent text-white"
            )}
          >
            <span
              className={clsx(
                "flex-shrink-0 flex items-center justify-center transition-all duration-300"
              )}
            >
              {React.cloneElement(link.icon, {
                className: isOpen ? "w-8 h-8" : "w-5 h-5",
              })}
            </span>
            <span
              className={clsx(
                "transition-opacity duration-300 whitespace-nowrap",
                isOpen ? "opacity-0 w-0" : "opacity-100 w-auto"
              )}
            >
              {link.name}
            </span>
          </button>
        ))}
      </div>

      {/* Выход */}
      <button
        onClick={() => {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          navigate("/sign-in", { replace: true });
        }}
        className={clsx(
          "flex items-center gap-2 rounded-l-lg px-2 py-2 cursor-pointer transition-all duration-300 hover:bg-white hover:text-blue01"
        )}
      >
        <IoExitOutline
          className={clsx(
            "transition-all duration-300 rotate-180 flex-shrink-0",
            isOpen ? "w-8 h-8" : "w-5 h-5"
          )}
        />
        <span
          className={clsx(
            "transition-opacity duration-300 text-left min-w-[50px]",
            isOpen && "opacity-0"
          )}
        >
          Выход
        </span>
      </button>
    </section>
  );
};

export default Sidebar;
