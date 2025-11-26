import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";

vi.mock("axios");

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import Users from "./Users";

beforeEach(() => {
  axios.get.mockReset();
  mockNavigate.mockReset();
});

describe("Users component", () => {
  // проверка статических элементов
  it("renders table headers", () => {
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );
    expect(screen.getByText("№")).toBeInTheDocument();
    expect(screen.getByText("Никнейм")).toBeInTheDocument();
    expect(screen.getByText("Имя")).toBeInTheDocument();
    expect(screen.getByText("Фамилия")).toBeInTheDocument();
    expect(screen.getByText("Почта")).toBeInTheDocument();
    expect(screen.getByText("Роль")).toBeInTheDocument();
    expect(screen.getByText("Дата регистрации")).toBeInTheDocument();
    expect(screen.getByText("Статус")).toBeInTheDocument();
    expect(screen.getByText("Идентификатор")).toBeInTheDocument();
  });
});
//   проверка загрузки и отображения пользователей
it("renders users from API", async () => {
  const mockUsers = [
    {
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
  ];
  axios.get.mockResolvedValue({ data: { users: mockUsers } });

  render(
    <MemoryRouter>
      <Users />
    </MemoryRouter>
  );

  expect(await screen.findByText("testuser")).toBeInTheDocument();
  expect(await screen.findByText("Test")).toBeInTheDocument();
});
