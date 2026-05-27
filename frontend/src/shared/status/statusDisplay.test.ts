import { describe, expect, it } from "vitest";
import { mapInspectionStatusToDisplay } from "./statusDisplay";

describe("mapInspectionStatusToDisplay", () => {
  it("keeps FAILED separate from rejected", () => {
    expect(mapInspectionStatusToDisplay("FAILED")).toMatchObject({
      label: "처리 실패",
      description: "시스템 처리 실패이며 불합격이 아님",
    });
  });

  it("maps REJECTED to the only failed-quality label", () => {
    expect(mapInspectionStatusToDisplay("REJECTED").label).toBe("불합격");
  });
});
