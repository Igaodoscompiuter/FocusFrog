import { describe, it, expect } from "vitest";
import { shallowEqual } from "./useShallowStable";

describe("shallowEqual", () => {
  const fn = () => 1;
  it("é igual quando todos os campos têm a mesma referência", () => {
    expect(shallowEqual({ a: 1, fn }, { a: 1, fn })).toBe(true);
  });
  it("detecta campo com valor diferente", () => {
    expect(shallowEqual({ a: 1, fn }, { a: 2, fn })).toBe(false);
  });
  it("detecta função recriada", () => {
    expect(shallowEqual({ fn }, { fn: () => 1 })).toBe(false);
  });
  it("detecta campo a mais ou a menos", () => {
    expect(shallowEqual({ a: 1 }, { a: 1, b: undefined })).toBe(false);
    expect(shallowEqual({ a: 1, b: 2 }, { a: 1, c: 2 })).toBe(false);
  });
  it("trata NaN como igual (Object.is)", () => {
    expect(shallowEqual({ a: NaN }, { a: NaN })).toBe(true);
  });
});
