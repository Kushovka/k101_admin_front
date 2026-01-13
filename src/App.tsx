import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import SignIn from "./features/auth/SignIn";
import UploadFiles from "./features/account/uploadFiles/UploadFiles";
import ProtectedRoute from "./components/protected-route/ProtectedRoute";
import Users from "./features/account/users/Users";
import SidebarLayout from "./components/sidebar-layout/SidebarLayout";
import HealthCheck from "./features/account/healthCheck/HealthCheck";
import SystemStatistics from "./features/account/systemStatistics/SystemStatistics";
import Search from "./features/account/search/Search";
import UserDetails from "./features/account/users/UserDetails";
import SearchDetails from "./features/account/search/SearchDetails";
import { SearchProvider } from "./features/account/search/SearchContext";
import { SidebarProvider } from "./components/sidebar/SidebarContext";
import Plans from "./features/account/plans/Plans";
import Profile from "./features/account/profile/Profile";
import React from "react";
import PaymentSuccess from "./components/paymentSuccess/PaymentSuccess";
import PaymentError from "./components/paymentError/PaymentError";
// import Verify2FA from "./features/auth/Verify2FA";

const App: React.FC = () => {
  const isAuth = Boolean(localStorage.getItem("access_token"));
  return (
    <BrowserRouter>
      <Routes>
        <Route path="sign-in" element={<SignIn />} />
        <Route path="payment_success" element={<PaymentSuccess />} />
        <Route path="payment_error" element={<PaymentError />} />
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

          <Route index element={<Navigate to="upload-files" replace />} />
        </Route>

        <Route
          path="/"
          element={
            isAuth ? (
              <Navigate to="/account/upload-files" replace />
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
