import { FaRegCircleUser } from "react-icons/fa6";
import { MdDownloading, MdOutlineAnalytics } from "react-icons/md";
import { IoDocumentTextOutline, IoExitOutline } from "react-icons/io5";
import { IoIosSearch } from "react-icons/io";
import { RxHamburgerMenu } from "react-icons/rx";
import { useState } from "react";
import clsx from "clsx";
import { useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);

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
        "fixed top-0 left-0 h-screen text-white bg-[#03294b] p-4 flex flex-col justify-between transition-all duration-300 ease-in-out",
        isOpen ? "w-[60px]" : "w-[300px]"
      )}
    >
      {/* Гамбургер */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex justify-end mb-4"
      >
        <RxHamburgerMenu size={30} />
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
                ? "bg-white text-[#03294b]"
                : "bg-transparent text-white"
            )}
          >
            <span
              className={clsx(
                "flex-shrink-0 transition-all duration-300",
                isOpen ? "w-6 h-6" : "w-5 h-5"
              )}
            >
              {link.icon}
            </span>
            <span
              className={clsx(
                "transition-opacity duration-300 whitespace-nowrap",
                isOpen && "opacity-0"
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
          "flex items-center gap-2 rounded-l-lg px-2 py-2 cursor-pointer transition-all duration-300 hover:bg-white hover:text-[#03294b]"
        )}
      >
        <IoExitOutline className="w-5 h-5 rotate-180" />
        <span
          className={clsx(
            "transition-opacity duration-300",
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
