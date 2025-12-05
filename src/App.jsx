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
import { useState } from "react";
import { SidebarProvider } from "./components/sidebar/SidebarContext";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="sign-in" element={<SignIn />} />
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
          <Route
            path="users"
            element={<Users />}
          />
          <Route path="users/:id" element={<UserDetails />} />
          <Route path="health-check" element={<HealthCheck />} />
          <Route path="system-stats" element={<SystemStatistics />} />
          
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
            localStorage.getItem("access_token") ? (
              <Navigate to="/account/upload-files" replace />
            ) : (
              <Navigate to="/sign-in" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
