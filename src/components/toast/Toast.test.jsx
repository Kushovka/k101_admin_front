import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Toast from "./Toast";

describe("Toast component", () => {
  it("renders with correct message and color", () => {
    render(<Toast message="Ошибка !" type="error" onClose={vi.fn()} />);
    const toast = screen.getByText("Ошибка !");
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveClass("bg-red-500");

    render(<Toast message="Успех !" type="success" onClose={vi.fn()} />);
    const successToast = screen.getByText("Успех !");
    expect(successToast).toBeInTheDocument();
    expect(successToast).toHaveClass("bg-green-500");
  });

  it("calls onClose after 3 sec", () => {
    vi.useFakeTimers();
    const onCloseMock = vi.fn(); 
    render(<Toast message="Закрытие!" onClose={onCloseMock} />);
    expect(onCloseMock).not.toHaveBeenCalled();

    vi.advanceTimersByTime(3000);
    expect(onCloseMock).toHaveBeenCalled();

    vi.useRealTimers();
  });
});
