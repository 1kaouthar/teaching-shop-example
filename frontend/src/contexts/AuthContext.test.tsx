import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthContextProvider, useAuth } from './AuthContext';

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should start with unauthenticated state', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthContextProvider,
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.token).toBe(null);
  });

  it('should login and store token', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthContextProvider,
    });

    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com', is_staff: false };
    const mockToken = 'test-token-123';

    act(() => {
      result.current.login(mockToken, mockUser);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe(mockToken);
    expect(localStorage.getItem('token')).toBe(mockToken);
    expect(JSON.parse(localStorage.getItem('user')!)).toEqual(mockUser);
  });

  it('should logout and clear token', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthContextProvider,
    });

    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com', is_staff: false };
    const mockToken = 'test-token-123';

    act(() => {
      result.current.login(mockToken, mockUser);
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.token).toBe(null);
    expect(localStorage.getItem('token')).toBe(null);
    expect(localStorage.getItem('user')).toBe(null);
  });

  it('should restore auth state from localStorage', () => {
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com', is_staff: false };
    const mockToken = 'test-token-123';
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthContextProvider,
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe(mockToken);
    expect(result.current.user).toEqual(mockUser);
  });
});
