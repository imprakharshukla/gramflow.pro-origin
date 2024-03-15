import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react'; // replace 'your-session-library' with the actual library you're using

function useSessionWithLoading() {
    const [loading, setLoading] = useState(true);
    const { data: session } = useSession();
    useEffect(() => {
        // If session data is not yet available (still loading), set loading to true
        if (session === undefined) {
            setLoading(true);
        } else {
            setLoading(false);
        }
    }, [session]);

    return { loading, session }
}

export default useSessionWithLoading;
