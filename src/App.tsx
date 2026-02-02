import React, { useEffect, useState } from "react";
import { CgDanger } from "react-icons/cg";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import PaymentError from "./components/paymentFailed/PaymentFailed";
import PaymentSuccess from "./components/paymentSuccess/PaymentSuccess";
import ProtectedRoute from "./components/protected-route/ProtectedRoute";
import SidebarLayout from "./components/sidebar-layout/SidebarLayout";
import { SidebarProvider } from "./components/sidebar/SidebarContext";
import HealthCheck from "./features/account/healthCheck/HealthCheck";
import Plans from "./features/account/plans/Plans";
import Profile from "./features/account/profile/Profile";
import Search from "./features/account/search/Search";
import { SearchProvider } from "./features/account/search/SearchContext";
import SearchDetails from "./features/account/search/SearchDetails";
import SystemStatistics from "./features/account/systemStatistics/SystemStatistics";
import UploadFiles from "./features/account/uploadFiles/UploadFiles";
import UserDetails from "./features/account/users/UserDetails";
import Users from "./features/account/users/Users";
import SignIn from "./features/auth/SignIn";
import { useBankIdleLogout } from "./hooks/logout/useIdLogout";
// import Verify2FA from "./features/auth/Verify2FA";

const App: React.FC = () => {
  const isAuth = Boolean(localStorage.getItem("access_token"));
  useBankIdleLogout(100 * 60 * 1000);

  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const handler = () => setSessionExpired(true);
    window.addEventListener("session-expired", handler);
    return () => window.removeEventListener("session-expired", handler);
  }, []);

  useEffect(() => {
    if (sessionExpired) {
      document.body.classList.add("body-no-scroll");
    } else {
      document.body.classList.remove("body-no-scroll");
    }

    return () => document.body.classList.remove("body-no-scroll");
  }, [sessionExpired]);

  return (
    <BrowserRouter>
      {sessionExpired && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[3px] flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white w-[380px] rounded-2xl shadow-2xl border border-gray-100 animate-scaleIn p-6">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center border border-yellow-100">
                <CgDanger className="w-9 h-9 text-yellow-400/60" />
              </div>

              <h3 className="text-[18px] font-semibold">Сессия истекла</h3>

              <p className="text-[14px] text-gray-600 text-center leading-snug">
                Пожалуйста войдите снова чтобы продолжить работу.
              </p>
            </div>

            <div className="mt-5 flex justify-center">
              <button
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors"
                onClick={() => {
                  localStorage.removeItem("access_token");
                  window.location.href = "/sign-in";
                }}
              >
                Войти снова
              </button>
            </div>
          </div>
        </div>
      )}
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
          <Route path="health-check" element={<HealthCheck />} />
          <Route path="system-stats" element={<SystemStatistics />} />
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
    </BrowserRouter>
  );
};

export default App;
