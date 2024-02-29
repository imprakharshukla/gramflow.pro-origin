import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

const useAuthToken = () => {
  const { getToken, userId } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const authToken = await getToken();
        setToken(authToken);
      } catch (error) {
        // Handle errors, such as token retrieval failure
        console.error("Error fetching token:", error);
      } finally {
        setAuthLoading(false);
      }
    };
    fetchToken();
  }, [getToken]);
  return { token, userId, authLoading };
};

export default useAuthToken;
