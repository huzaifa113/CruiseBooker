import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  // No authentication required - return dummy values
  return {
    user: null,
    isLoading: false,
    isAuthenticated: false,
  };
}