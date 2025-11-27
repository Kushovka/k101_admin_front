import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import UploadFiles from "./UploadFiles";

describe("UploadFiles component", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });
  it("renders main elements", () => {
    render(<UploadFiles />);
    expect(screen.getByText("Загрузка файлов")).toBeInTheDocument();
    expect(screen.getByText("Перетащите файлы сюда или")).toBeInTheDocument();
    expect(screen.getByText("Выберите файлы")).toBeInTheDocument();
  });

  it("add files when selected via file input", () => {
    render(<UploadFiles />);
    const input = screen.getByTestId("file-input");
    const file = new File(["file content"], "testfile.txt", {
      type: "text/plain",
    });
    fireEvent.change(input, { target: { files: [file] } });
    expect(screen.getByText("testfile.txt")).toBeInTheDocument();
  });

  it("deletes a file when delete button is clicked", () => {
    render(<UploadFiles />);
    const file = new File(["file content"], "testfile.txt", {
      type: "text/plain",
    });

    const input = screen.getByTestId("file-input");
    fireEvent.change(input, { target: { files: [file] } });

    const deleteButton = screen.getByTestId("delete-button");
    fireEvent.click(deleteButton);
    expect(screen.queryByText("testfile.txt")).not.toBeInTheDocument();
  });

  it("adds file via drag and drop", () => {
    render(<UploadFiles />);
    const dropZone = screen.getByText(
      "Перетащите файлы сюда или"
    ).parentElement;

    const file = new File(["content"], "dragged.txt", { type: "text/plain" });

    fireEvent.dragOver(dropZone);
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file],
      },
    });
    expect(screen.getByText("dragged.txt")).toBeInTheDocument();
  });
});
