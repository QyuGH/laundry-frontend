import { useState } from "react";
import { getToken } from "firebase/messaging";
import { BellRinging } from "@phosphor-icons/react";
import { messagingPromise } from "../../firebase/firebaseConfig";
import { registerFcmToken } from "../../services/api";

function WebPushBanner({ onRegistered, onError }) {
  const [isRegistering, setIsRegistering] = useState(false);

  const handleEnablePush = async () => {
    setIsRegistering(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Browser notification permission was denied.");
      }

      const messaging = await messagingPromise;
      if (!messaging) {
        throw new Error("Firebase Messaging is not supported in this browser.");
      }

      const registration = await navigator.serviceWorker.ready;
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

      const token = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: registration,
      });

      if (!token) {
        throw new Error("Failed to retrieve push registration token.");
      }

      await registerFcmToken(token);
      onRegistered();
    } catch (err) {
      onError(err.message || "Failed to enable Web Push Notifications.");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="card-shell flex flex-col sm:flex-row sm:items-center sm:justify-between gap-block">
      <div className="flex items-start sm:items-center gap-3">
        <div className="p-2 rounded-md bg-canvas-bg border border-border-muted text-primary shrink-0">
          <BellRinging size={20} />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-text">
            Enable Background Web Push
          </span>
          <span className="text-xs text-text-muted">
            Receive instant device notifications from rain events.
          </span>
        </div>
      </div>
      <button
        onClick={handleEnablePush}
        disabled={isRegistering}
        className="px-3 py-1.5 bg-surface-bg border border-border rounded-md text-xs font-semibold text-text-muted hover:text-text hover:bg-canvas-bg transition-colors duration-150 shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isRegistering ? "Enabling..." : "Enable Push"}
      </button>
    </div>
  );
}

export default WebPushBanner;
