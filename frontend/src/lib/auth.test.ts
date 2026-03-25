import { describe, it, expect, beforeEach, vi } from "vitest";
import { saveToken, clearToken, getToken } from "./auth";

describe("auth utility", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const createFakeToken = (exp: number) => {
    const payload = btoa(JSON.stringify({ exp }));
    return `header.${payload}.signature`;
  };

  it("should save and retrieve token when it's not expired", () => {
    const exp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const token = createFakeToken(exp);
    saveToken(token, 3600);
    expect(getToken()).toBe(token);
  });

  it("should return null and clear storage if token is expired", () => {
    const exp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
    const token = createFakeToken(exp);
    
    // Manual setup to test expired token logic in getToken
    localStorage.setItem("todo_app_auth_token", token);
    localStorage.setItem("todo_app_auth_exp", String(exp));

    expect(getToken()).toBeNull();
    expect(localStorage.getItem("todo_app_auth_token")).toBeNull();
  });

  it("should clear token from localStorage", () => {
    localStorage.setItem("todo_app_auth_token", "fake-token");
    localStorage.setItem("todo_app_auth_exp", "1234567890");
    
    clearToken();
    
    expect(localStorage.getItem("todo_app_auth_token")).toBeNull();
    expect(localStorage.getItem("todo_app_auth_exp")).toBeNull();
  });
});
