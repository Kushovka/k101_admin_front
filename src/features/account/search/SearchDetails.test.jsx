import { describe, expect, it, vi } from "vitest";
import axios from "axios";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import SearchDetails from "./SearchDetails";

vi.mock("axios");

describe("SearchDetails component", () => {
  it("renders correctly", async () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/account/search/1",
            state: {
              _source: {
                id: 1,
                first_name: "User",
                last_name: "Userov",
                middle_name: "",
                email: "test@example.com",
                phone: "1234567890",
                birthday: "2023-01-01T00:00:00Z",
                snils: "",
                address: "",
              },
            },
          },
        ]}
      >
        <Routes>
          <Route path="/account/search/:id" element={<SearchDetails />} />
        </Routes>
      </MemoryRouter>
    );

    const header = await screen.findByText(
      /Подробрая информация пользователя: User/i
    );
    expect(header).toBeInTheDocument();

    expect(screen.getByText("User")).toBeInTheDocument();
    expect(screen.getByText("Userov")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });
});
