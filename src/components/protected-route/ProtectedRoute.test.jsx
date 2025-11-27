import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

describe("ProtectedRoute component", () => {
  it("redirect to /signin if not token", () => {
    localStorage.removeItem("access_token");

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders children if token exists", () => {
    localStorage.setItem("access_token", "mockToken");

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText("Protected content")).toBeInTheDocument();

    localStorage.removeItem("access_token");
  });
});
