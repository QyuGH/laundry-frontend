import { useState } from "react";
import { getToken } from "firebase/messaging";
import { Bell } from "@phosphor-icons/react";
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
    <div className="rounded-lg border border-border bg-surface p-5 sm:p-6 shadow-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-md bg-brand text-white flex items-center justify-center shrink-0 shadow-xs">
          <Bell className="w-5 h-5" weight="bold" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm sm:text-base font-bold font-display text-text">
            Enable Background Web Push
          </span>
          <span className="text-xs text-text-muted font-medium mt-0.5">
            Receive instant device notifications from rain events.
          </span>
        </div>
      </div>

      <button
        onClick={handleEnablePush}
        disabled={isRegistering}
        className="inline-flex items-center justify-center px-5 py-2.5 rounded-md text-xs font-semibold bg-brand text-white hover:bg-brand-strong hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xs shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isRegistering ? "Enabling..." : "Enable Push"}
      </button>
    </div>
  );
}

export default WebPushBanner;
