import { useState, useEffect, useCallback, useRef } from "react";
import { runHandshake } from "../services/api";

const STALE_THRESHOLD_MS = 60000;

/**
 * Manages the device handshake state machine for the Control Panel.
 *
 * States:
 *  - "idle"     : Hook has not run yet.
 *  - "checking" : Handshake request is in flight.
 *  - "online"   : Device responded successfully to the ping.
 *  - "offline"  : Handshake timed out, failed, or lastSeen is stale.
 *
 * @param {string|null} deviceId - The current user's device ID.
 * @param {object|null} rtdbStatus - The live status node from RTDB ({ isOnline, lastSeen }).
 * @returns {{ deviceStatus: string, runHandshakeCheck: function }}
 */
function useHandshake(deviceId, rtdbStatus) {
  const [deviceStatus, setDeviceStatus] = useState("idle");
  const stalenessTimerRef = useRef(null);

  const runHandshakeCheck = useCallback(async () => {
    if (!deviceId) return;

    setDeviceStatus("checking");

    try {
      const result = await runHandshake();
      setDeviceStatus(result.online ? "online" : "offline");
    } catch {
      setDeviceStatus("offline");
    }
  }, [deviceId]);

  // Run automatically on mount when deviceId is available.
  useEffect(() => {
    if (deviceId) {
      runHandshakeCheck();
    }
  }, [deviceId, runHandshakeCheck]);

  // Monitor RTDB lastSeen staleness. If lastSeen is older than 60 seconds
  // and the device is currently "online", revert status to "offline".
  useEffect(() => {
    if (stalenessTimerRef.current) {
      clearInterval(stalenessTimerRef.current);
    }

    if (deviceStatus !== "online" || !rtdbStatus) return;

    stalenessTimerRef.current = setInterval(() => {
      const lastSeen = rtdbStatus?.lastSeen;
      if (!lastSeen) return;

      const lastSeenMs =
        typeof lastSeen === "number"
          ? lastSeen * 1000
          : new Date(lastSeen).getTime();
      const staleDuration = Date.now() - lastSeenMs;

      if (staleDuration > STALE_THRESHOLD_MS) {
        setDeviceStatus("offline");
        clearInterval(stalenessTimerRef.current);
      }
    }, 10000);

    return () => clearInterval(stalenessTimerRef.current);
  }, [deviceStatus, rtdbStatus]);

  return { deviceStatus, runHandshakeCheck };
}

export default useHandshake;
