import { useState, useEffect } from "react";

const STALE_THRESHOLD_MS = 30000; // 30 seconds (3 missed heartbeats)

/**
 * Hook to passively monitor device online status using the RTDB status node.
 * Evaluates the lastSeen timestamp dynamically to determine if the device is active.
 *
 * @param {object|null} rtdbStatus - The live status node fetched from RTDB ({ isOnline, lastSeen }).
 * @returns {string} One of: "checking" | "online" | "offline"
 */
function useDeviceConnection(rtdbStatus) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    if (!rtdbStatus) {
      setStatus("checking");
      return;
    }

    const checkLiveness = () => {
      const isOnline = rtdbStatus.isOnline;
      const lastSeen = rtdbStatus.lastSeen;

      if (!isOnline || !lastSeen) {
        setStatus("offline");
        return;
      }

      // lastSeen is a millisecond timestamp from Firebase Server
      const lastSeenMs =
        typeof lastSeen === "number" ? lastSeen : new Date(lastSeen).getTime();
      const elapsed = Date.now() - lastSeenMs;

      if (elapsed > STALE_THRESHOLD_MS) {
        setStatus("offline");
      } else {
        setStatus("online");
      }
    };

    // Check immediately on data update
    checkLiveness();

    // Check periodically in case no new RTDB values write (detect silence)
    const interval = setInterval(checkLiveness, 5000);

    return () => clearInterval(interval);
  }, [rtdbStatus]);

  return status;
}

export default useDeviceConnection;
