import { supabase } from "../lib/supabase";

async function authHeaders() {
  if (!supabase) {
    return {
      "Content-Type": "application/json",
    };
  }

  const {
    data,
  } = await supabase.auth.getSession();

  const token =
    data.session?.access_token;

  return {
    "Content-Type": "application/json",
    ...(token
      ? {
          Authorization:
            `Bearer ${token}`,
        }
      : {}),
  };
}

async function jsonRequest(
  url: string,
  options: RequestInit = {}
) {
  const headers =
    await authHeaders();

  const response =
    await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    });

  const data =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error ||
        `Request failed (${response.status})`
    );
  }

  return data;
}

export async function getKrogerConnectionStatus() {
  return jsonRequest(
    "/api/kroger-status"
  ) as Promise<{
    connected: boolean;
    environment?: string;
  }>;
}

export async function startKrogerConnection() {
  return jsonRequest(
    "/api/kroger-oauth-start",
    {
      method: "POST",
      body: "{}",
    }
  ) as Promise<{
    url: string;
  }>;
}

export async function disconnectKroger() {
  return jsonRequest(
    "/api/kroger-status",
    {
      method: "DELETE",
      body: "{}",
    }
  ) as Promise<{
    connected: false;
  }>;
}

export async function addItemsToKrogerCart(
  items: readonly {
    upc: string;
    quantity: number;
  }[]
) {
  return jsonRequest(
    "/api/kroger-cart",
    {
      method: "POST",
      body: JSON.stringify({
        items,
      }),
    }
  ) as Promise<{
    added: number;
  }>;
}
