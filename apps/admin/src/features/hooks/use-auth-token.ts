import { useEffect, useState } from "react";
import useSessionWithLoading from "./use-session-auth";

interface AuthTokenData {
  token: string | null;
  error: string | null;
  loading: boolean;
}

const useAuthToken = (): AuthTokenData => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { session, loading: authLoading } = useSessionWithLoading();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const tokenReq = await fetch("/api/token");
        if (!tokenReq.ok) {
          setError("Failed to fetch token")
          return;
        }
        const data = await tokenReq.json();
        setToken(data.token);
      } catch (error) {
        setError("Error fetching token");
        console.error("Error fetching token:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, [session, authLoading]);

  return { token, error, loading };
};

export default useAuthToken;
