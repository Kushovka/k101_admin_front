import { useEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import Appeals from "../../features/account/appeals/Appeals";
import Complaints from "../../features/account/complaints/Complaints";
import News from "../../features/account/news/News";
import Plans from "../../features/account/plans/Plans";
import Profile from "../../features/account/profile/Profile";
import Search from "../../features/account/search/Search";
import { SearchProvider } from "../../features/account/search/SearchContext";
import SearchDetails from "../../features/account/search/SearchDetails";
import SystemStatistics from "../../features/account/systemStatistics/SystemStatistics";
import UploadFiles from "../../features/account/uploadFiles/UploadFiles";
import UserDetails from "../../features/account/users/UserDetails";
import Users from "../../features/account/users/Users";
import SignIn from "../../features/auth/SignIn";
import { useBankIdleLogout } from "../../hooks/logout/useIdLogout";
import { useUploadStore } from "../../store/useUploadStore";
import PaymentError from "../paymentFailed/PaymentFailed";
import PaymentSuccess from "../paymentSuccess/PaymentSuccess";
import ProtectedRoute from "../protected-route/ProtectedRoute";
import SidebarLayout from "../sidebar-layout/SidebarLayout";
import { SidebarProvider } from "../sidebar/SidebarContext";
import SessionExpiredModal from "./SessionExpiredModal";

const AppContent: React.FC = () => {
  const location = useLocation();
  const { uploading, isBusy } = useUploadStore();
  const isAuth = Boolean(localStorage.getItem("admin_access_token"));

  const [sessionExpired, setSessionExpired] = useState(false);

  const isAccountPage = location.pathname.startsWith("/account");

  useBankIdleLogout(15 * 60 * 1000, uploading || isBusy || !isAccountPage);

  useEffect(() => {
    const handler = () => {
      setSessionExpired(true);
    };

    window.addEventListener("session-expired", handler);

    return () => {
      window.removeEventListener("session-expired", handler);
    };
  }, []);

  useEffect(() => {
    if (sessionExpired) {
      document.body.classList.add("body-no-scroll");
    } else {
      document.body.classList.remove("body-no-scroll");
    }

    return () => {
      document.body.classList.remove("body-no-scroll");
    };
  }, [sessionExpired]);

  return (
    <>
      {sessionExpired && !uploading && <SessionExpiredModal />}

      <Routes>
        <Route path="sign-in" element={<SignIn />} />
        <Route path="successful-payment" element={<PaymentSuccess />} />
        <Route path="failed-payment" element={<PaymentError />} />
        {/* <Route path="verify-2fa" element={<Verify2FA />} /> */}
        <Route
          path="account"
          element={
            <ProtectedRoute>
              <SidebarProvider>
                <SidebarLayout />
              </SidebarProvider>
            </ProtectedRoute>
          }
        >
          <Route path="upload-files" element={<UploadFiles />} />
          <Route path="profile" element={<Profile />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:id" element={<UserDetails />} />
          {/* <Route path="health-check" element={<HealthCheck />} /> */}
          <Route path="system-stats" element={<SystemStatistics />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="appeals" element={<Appeals />} />
          <Route path="news" element={<News />} />
          <Route path="plans" element={<Plans />} />

          <Route
            path="search/*"
            element={
              <SearchProvider>
                <Outlet />
              </SearchProvider>
            }
          >
            <Route index element={<Search />} />
            <Route path=":id" element={<SearchDetails />} />
          </Route>

          <Route index element={<Navigate to="profile" replace />} />
        </Route>

        <Route
          path="/"
          element={
            isAuth ? (
              <Navigate to="/account/profile" replace />
            ) : (
              <Navigate to="/sign-in" replace />
            )
          }
        />
      </Routes>
    </>
  );
};

export default AppContent;
