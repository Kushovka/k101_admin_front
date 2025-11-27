import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import UserDetails from "./UserDetails";
import axios from "axios";

vi.mock("axios");

describe("UserDetails component", () => {
  it("renders user details components", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        id: 1,
        username: "testuser",
        first_name: "Test",
        last_name: "User",
        email: "test@example.com",
        role: "user",
        registration_date: "2023-01-01T00:00:00Z",
        is_blocked: false,
        is_email_verified: true,
        balance: 100,
        free_requests_count: 10,
        all_requests_count: 50,
        total_spent: 20,
      },
    });

    render(
      <MemoryRouter initialEntries={["/account/users/1"]}>
        <Routes>
          <Route path="/account/users/:id" element={<UserDetails />} />
        </Routes>
      </MemoryRouter>
    );

    const header = await screen.findByText(/Пользователь: Test/i);
    expect(header).toBeInTheDocument();

    expect(screen.getByDisplayValue("Test")).toBeInTheDocument();
    expect(screen.getByDisplayValue("User")).toBeInTheDocument();
    expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();

    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();

    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
  });
});
