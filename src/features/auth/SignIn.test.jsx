import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";

// сначала делаем мок
vi.mock("./auth", () => ({
  login: vi.fn(() => Promise.resolve()),
}));

// потом импортируем SignIn и login
import SignIn from "./SignIn";
import { login } from "./auth";

describe("SignIn component", () => {
  it("renders login button", () => {
    render(
      <MemoryRouter>
        <SignIn />
      </MemoryRouter>
    );

    const button = screen.getByRole("button", { name: /войти/i });
    expect(button).toBeInTheDocument();
  });

  it("calls login on submit", async () => {
    render(
      <MemoryRouter>
        <SignIn />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByPlaceholderText(/пароль/i), {
      target: { value: "1234" },
    });

    fireEvent.click(screen.getByRole("button", { name: /войти/i }));

    // ждем, пока login вызовется
    await waitFor(() => {
      expect(login).toHaveBeenCalledWith("testuser", "1234");
    });
  });
});
