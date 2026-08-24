import { supabase } from "../lib/supabase";

import type {
  FulfillmentPlacement,
} from "./types";

export async function trackFulfillmentOutboundClick(
  providerId: string,
  placement: FulfillmentPlacement,
): Promise<void> {
  if (!supabase) return;

  try {
    const { error } = await supabase
      .from("fulfillment_events")
      .insert({
        provider_id: providerId,
        placement,
        event_type: "outbound_click",
      });

    if (error && import.meta.env.DEV) {
      console.warn(
        "[fulfillment] Failed to track outbound click",
        error,
      );
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(
        "[fulfillment] Failed to track outbound click",
        error,
      );
    }
  }
}
