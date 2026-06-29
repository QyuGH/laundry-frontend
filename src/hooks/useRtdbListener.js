import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "../firebase/firebaseConfig";

/**
 * Subscribes to a Firebase Realtime Database path and returns its live value.
 * Automatically unsubscribes when the component unmounts or the path changes.
 *
 * @param {string|null} path - The RTDB path to subscribe to. Pass null to skip subscription.
 * @returns {{ data: any, isLoading: boolean }}
 */
function useRtdbListener(path) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!path) {
      setIsLoading(false);
      return;
    }

    const dbRef = ref(rtdb, path);

    const unsubscribe = onValue(dbRef, (snapshot) => {
      setData(snapshot.val());
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [path]);

  return { data, isLoading };
}

export default useRtdbListener;
