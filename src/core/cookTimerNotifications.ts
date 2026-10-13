import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

const COOK_TIMER_NOTIFICATION_ID = 1611001;
const COOK_TIMER_CHANNEL_ID = "cook-timers-v5";

type TimerAlertOptions = {
  endsAt: number;
  recipeName?: string;
  language?: "en" | "es";
};

export async function cancelCookTimerAlert() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await LocalNotifications.cancel({
      notifications: [
        {
          id: COOK_TIMER_NOTIFICATION_ID,
        },
      ],
    });
  } catch {
    // Timer UI should continue working even if native cancellation fails.
  }
}

export async function scheduleCookTimerAlert({
  endsAt,
  recipeName,
  language = "en",
}: TimerAlertOptions) {
  if (!Capacitor.isNativePlatform()) {
    return {
      scheduled: false,
      permissionDenied: false,
    };
  }

  try {
    let permission =
      await LocalNotifications.checkPermissions();

    if (permission.display !== "granted") {
      permission =
        await LocalNotifications.requestPermissions();
    }

    if (permission.display !== "granted") {
      return {
        scheduled: false,
        permissionDenied: true,
      };
    }

    await cancelCookTimerAlert();

    if (Capacitor.getPlatform() === "android") {
      const exactPermission =
        await LocalNotifications.checkExactNotificationSetting();

      if (exactPermission.exact_alarm !== "granted") {
        const updatedPermission =
          await LocalNotifications.changeExactNotificationSetting();

        if (updatedPermission.exact_alarm !== "granted") {
          return {
            scheduled: false,
            permissionDenied: false,
            exactAlarmDenied: true,
          };
        }
      }

      await LocalNotifications.createChannel({
        id: COOK_TIMER_CHANNEL_ID,
        name: "Cook timers",
        description: "Timer alerts while cooking with Simple Dinners",
        sound: "diner_order_up.wav",
        importance: 5,
        vibration: true,
        visibility: 1,
      });
    }

    const isSpanish = language === "es";

    const notification: any = {
      id: COOK_TIMER_NOTIFICATION_ID,

      title: isSpanish
        ? "⏱️ Temporizador terminado"
        : "⏱️ Timer finished",

      body: recipeName?.trim()
        ? isSpanish
          ? `${recipeName} está listo para el siguiente paso.`
          : `${recipeName} is ready for the next step.`
        : isSpanish
        ? "Tu temporizador de cocina terminó."
        : "Your cooking timer is finished.",

      schedule: {
        at: new Date(endsAt),
        allowWhileIdle: true,
      },

      sound:
        Capacitor.getPlatform() === "android"
          ? "diner_order_up.wav"
          : "default",
      channelId:
        Capacitor.getPlatform() === "android"
          ? COOK_TIMER_CHANNEL_ID
          : undefined,
      foreground: false,
      autoCancel: true,

      extra: {
        type: "cook-timer",
      },
    };

    // First pass: avoid sending Android users to the special
    // exact-alarm settings screen. We'll add a polished opt-in
    // for exact timer alerts after this flow is proven.
    if (Capacitor.getPlatform() === "android") {
      notification.isExactNotification = true;
      notification.isExactMandatory = true;
    }

    await LocalNotifications.schedule({
      notifications: [notification],
    });

    return {
      scheduled: true,
      permissionDenied: false,
    };
  } catch (error) {
    console.warn(
      "Cook timer notification could not be scheduled:",
      error
    );

    return {
      scheduled: false,
      permissionDenied: false,
    };
  }
}
