import { useState } from "react";
import { getToken } from "firebase/messaging";
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

      if (!("serviceWorker" in navigator)) {
        throw new Error("Service workers are not supported in this browser.");
      }

      const registration = await navigator.serviceWorker.ready;

      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };

      registration.active?.postMessage({
        type: "INIT_FIREBASE",
        config: firebaseConfig,
      });

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
    <div className="p-4 rounded-lg border border-highlight/30 bg-highlight/10 flex items-center justify-between gap-block">
      <div className="flex flex-col">
        <span className="text-sm font-semibold">
          Enable Background Web Push
        </span>
        <span className="text-xs text-text-muted text-micro">
          Receive instant device notifications from rain events.
        </span>
      </div>
      <button
        onClick={handleEnablePush}
        disabled={isRegistering}
        className="px-3 py-1.5 bg-bg-light border border-border rounded-md text-xs font-semibold text-text hover:bg-highlight transition shrink-0 disabled:opacity-55"
      >
        {isRegistering ? "Enabling..." : "Enable Push"}
      </button>
    </div>
  );
}

export default WebPushBanner;
