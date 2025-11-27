import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import HealthCheck from "./HealthCheck";

describe("HealthCheck component", () => {
  it("renders main elements", () => {
    render(<HealthCheck />);
    expect(screen.getByText("Health Check")).toBeInTheDocument();
    expect(
      screen.getByText("*Проверка состояния Admin Panel и Gateway.")
    ).toBeInTheDocument();
    expect(screen.getByText("status:")).toBeInTheDocument();
    expect(screen.getByText("version:")).toBeInTheDocument();
    expect(screen.getByText("gateway - status:")).toBeInTheDocument();
    expect(screen.getByText("url:")).toBeInTheDocument();
  });
});
