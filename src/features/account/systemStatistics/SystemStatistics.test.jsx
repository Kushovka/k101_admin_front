import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SystemStatistics from "./SystemStatistics";

describe("System-statistics component", () => {
  it("renders main elements", () => {
    render(<SystemStatistics />);
    expect(screen.getByText("Системная статистика")).toBeInTheDocument();
    expect(
      screen.getByText("*Получение статистики системы.")
    ).toBeInTheDocument();
    expect(screen.getByText("gateway status :")).toBeInTheDocument();
    expect(screen.getByText("total_files_uploaded:")).toBeInTheDocument();
    expect(screen.getByText("total_records_parsed:")).toBeInTheDocument();
  });
});
