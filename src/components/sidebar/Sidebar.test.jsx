import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Sidebar from "./Sidebar";

describe("Sidebar", () => {
  const setIsOpen = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all links", () => {
    render(
      <MemoryRouter>
        <Sidebar isOpen={false} setIsOpen={setIsOpen} />
      </MemoryRouter>
    );

    expect(screen.getByText("Пользователи")).toBeInTheDocument();
    expect(screen.getByText("Загрузка")).toBeInTheDocument();
    expect(screen.getByText("Health Check")).toBeInTheDocument();
    expect(screen.getByText("Системная статистика")).toBeInTheDocument();
    expect(screen.getByText("Поиск")).toBeInTheDocument();
  });

  it("toggles sidebar when hamburger is clicked", () => {
    render(
      <MemoryRouter>
        <Sidebar isOpen={false} setIsOpen={setIsOpen} />
      </MemoryRouter>
    );
    const button = screen.getByTestId("hamburger-button");
    fireEvent.click(button);
    expect(setIsOpen).toHaveBeenCalledWith(expect.any(Function));
  });

  it("calls localStorage.removeItem and navigate on logout", () => {
    const navigateMock = vi.fn();
    vi.stubGlobal("localStorage", {
      removeItem: navigateMock,
    });

    render(
      <MemoryRouter>
        <Sidebar isOpen={false} setIsOpen={setIsOpen} />
      </MemoryRouter>
    );
    const logoutButton = screen.getByText("Выход");
    fireEvent.click(logoutButton);

    expect(localStorage.removeItem).toHaveBeenCalledWith("access_token");
    expect(localStorage.removeItem).toHaveBeenCalledWith("refresh_token");
  });
});
