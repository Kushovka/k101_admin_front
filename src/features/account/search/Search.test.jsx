import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Search from "./Search";

describe("Search component", () => {
  it("renders main elements", () => {
    render(<Search />);
    expect(screen.getByText("Поиск")).toBeInTheDocument();

    expect(screen.getByPlaceholderText("*name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("*phone")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("*person_id")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("*page")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("*page_size")).toBeInTheDocument();

    expect(screen.getByText(/найти/i)).toBeInTheDocument();

    ["№", "name", "phone", "person_id", "page", "page_size"].forEach((text) => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });
});
