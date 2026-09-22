import { describe, expect, it } from "vitest";
import {
  canExport,
  canHardDelete,
  canManageSettings,
  canManageUsers,
  canWrite,
  needsDeleteConfirm,
} from "./permissions";

describe("permissions", () => {
  it("lets admin and member write, viewer cannot", () => {
    expect(canWrite("ADMIN")).toBe(true);
    expect(canWrite("MEMBER")).toBe(true);
    expect(canWrite("VIEWER")).toBe(false);
  });

  it("lets only admin hard-delete and manage users/settings", () => {
    expect(canHardDelete("ADMIN")).toBe(true);
    expect(canHardDelete("MEMBER")).toBe(false);
    expect(canManageUsers("ADMIN")).toBe(true);
    expect(canManageUsers("MEMBER")).toBe(false);
    expect(canManageSettings("VIEWER")).toBe(false);
  });

  it("requires extra confirm for member delete", () => {
    expect(needsDeleteConfirm("MEMBER")).toBe(true);
    expect(needsDeleteConfirm("ADMIN")).toBe(false);
  });

  it("allows viewers to export reports", () => {
    expect(canExport("VIEWER")).toBe(true);
  });
});
