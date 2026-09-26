import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import type { ZachsMapRestaurant } from "./restaurants";
import { ZACHS_MAP_COORDINATES } from "./coordinates.generated";

type Props = {
  restaurants: ZachsMapRestaurant[];
};

type MappedRestaurant = {
  restaurant: ZachsMapRestaurant;
  latitude: number;
  longitude: number;
};

const tileUrl =
  import.meta.env.VITE_ZACHS_MAP_TILE_URL?.trim() ||
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

const pinIcon = L.divIcon({
  className: "",
  iconSize: [38, 46],
  iconAnchor: [19, 43],
  popupAnchor: [0, -39],
  html: `
    <div
      style="
        width: 34px;
        height: 34px;
        display: grid;
        place-items: center;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        background: #f97316;
        border: 3px solid #fff7ed;
        box-shadow: 0 8px 18px rgba(0,0,0,0.35);
      "
    >
      <div
        style="
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: #fff7ed;
        "
      ></div>
    </div>
  `,
});

function FitRestaurantBounds({
  restaurants,
}: {
  restaurants: MappedRestaurant[];
}) {
  const map = useMap();

  useEffect(() => {
    if (!restaurants.length) return;

    const bounds = L.latLngBounds(
      restaurants.map(
        ({ latitude, longitude }) =>
          [latitude, longitude] as [number, number],
      ),
    );

    map.fitBounds(bounds, {
      padding: [34, 34],
      maxZoom: 12,
    });
  }, [map, restaurants]);

  return null;
}

function jumpToRestaurantCard(
  restaurantId: string,
) {
  document
    .getElementById(
      `zach-card-${restaurantId}`,
    )
    ?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
}

function FocusRestaurantBridge({
  markerRefs,
}: {
  markerRefs: {
    current: Record<string, L.Marker | null>;
  };
}) {
  const map = useMap();

  useEffect(() => {
    function handleFocus(event: Event) {
      const detail = (
        event as CustomEvent<{
          restaurantId?: string;
        }>
      ).detail;

      const restaurantId =
        detail?.restaurantId;

      if (!restaurantId) return;

      const marker =
        markerRefs.current[restaurantId];

      if (!marker) return;

      const position =
        marker.getLatLng();

      map.flyTo(
        position,
        Math.max(map.getZoom(), 15),
        {
          duration: 0.65,
        },
      );

      window.setTimeout(() => {
        marker.openPopup();
      }, 700);
    }

    window.addEventListener(
      "zachs-map-focus",
      handleFocus,
    );

    return () => {
      window.removeEventListener(
        "zachs-map-focus",
        handleFocus,
      );
    };
  }, [map, markerRefs]);

  return null;
}

export default function ZachsRestaurantMap({
  restaurants,
}: Props) {
  const markerRefs =
    useRef<Record<string, L.Marker | null>>(
      {},
    );

  const mappedRestaurants =
    useMemo<MappedRestaurant[]>(() => {
      return restaurants.flatMap(
        (restaurant) => {
          const coordinates =
            ZACHS_MAP_COORDINATES[
              restaurant.id as keyof typeof ZACHS_MAP_COORDINATES
            ];

          if (!coordinates) {
            console.warn(
              `Missing Zach's Map coordinates for ${restaurant.id}`,
            );

            return [];
          }

          return [
            {
              restaurant,
              latitude:
                coordinates.latitude,
              longitude:
                coordinates.longitude,
            },
          ];
        },
      );
    }, [restaurants]);

  return (
    <section
      id="zachs-map-map"
      style={{
        marginBottom: 22,
        overflow: "hidden",
        borderRadius: 22,
        border:
          "1px solid rgba(255,255,255,0.09)",
        background: "#111827",
        boxShadow:
          "0 18px 42px rgba(0,0,0,0.2)",
      }}
    >
      <div
        style={{
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          gap: 12,
          background:
            "rgba(30,41,59,0.96)",
          borderBottom:
            "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 950,
              color: "#f8fafc",
            }}
          >
            Explore Zach&apos;s Map
          </div>

          <div
            style={{
              marginTop: 2,
              fontSize: 11,
              color:
                "rgba(248,250,252,0.5)",
            }}
          >
            Tap a pin to see the restaurant.
          </div>
        </div>

        <div
          style={{
            flexShrink: 0,
            padding: "5px 9px",
            borderRadius: 999,
            background:
              "rgba(249,115,22,0.12)",
            border:
              "1px solid rgba(249,115,22,0.22)",
            color: "#fdba74",
            fontSize: 10,
            fontWeight: 900,
          }}
        >
          {mappedRestaurants.length} spots
        </div>
      </div>

      <div
        style={{
          position: "relative",
          height:
            "clamp(300px, 50vw, 430px)",
        }}
      >
        <MapContainer
          center={[36.48, -82.5]}
          zoom={10}
          scrollWheelZoom
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url={tileUrl}
          />

          <FitRestaurantBounds
            restaurants={
              mappedRestaurants
            }
          />

          <FocusRestaurantBridge
            markerRefs={markerRefs}
          />

          {mappedRestaurants.map(
            ({
              restaurant,
              latitude,
              longitude,
            }) => (
              <Marker
                key={restaurant.id}
                ref={(marker) => {
                  markerRefs.current[
                    restaurant.id
                  ] = marker;
                }}
                position={[
                  latitude,
                  longitude,
                ]}
                icon={pinIcon}
              >
                <Popup>
                  <div
                    style={{
                      minWidth: 180,
                    }}
                  >
                    <div
                      style={{
                        marginBottom: 3,
                        fontSize: 14,
                        fontWeight: 900,
                        color: "#0f172a",
                      }}
                    >
                      {restaurant.name}
                    </div>

                    <div
                      style={{
                        marginBottom: 8,
                        fontSize: 11,
                        color: "#64748b",
                      }}
                    >
                      {restaurant.city},{" "}
                      {restaurant.state}
                    </div>

                    {restaurant.featuredDish && (
                      <div
                        style={{
                          marginBottom: 9,
                          fontSize: 11,
                          lineHeight: 1.4,
                          color: "#334155",
                        }}
                      >
                        Zach tried:{" "}
                        <strong>
                          {
                            restaurant.featuredDish
                          }
                        </strong>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        jumpToRestaurantCard(
                          restaurant.id,
                        )
                      }
                      style={{
                        width: "100%",
                        minHeight: 34,
                        border: 0,
                        borderRadius: 9,
                        background:
                          "#f97316",
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 900,
                        cursor: "pointer",
                      }}
                    >
                      View restaurant ↓
                    </button>
                  </div>
                </Popup>
              </Marker>
            ),
          )}
        </MapContainer>

        <style>{`
          #zachs-map-map .leaflet-container {
            background: #172033;
            font-family: inherit;
          }

          #zachs-map-map .leaflet-tile-pane {
            filter:
              saturate(0.72)
              brightness(0.82)
              contrast(1.08);
          }

          #zachs-map-map .leaflet-popup-content-wrapper,
          #zachs-map-map .leaflet-popup-tip {
            background: #ffffff;
          }

          #zachs-map-map .leaflet-popup-content {
            margin: 13px 14px;
          }

          #zachs-map-map .leaflet-control-attribution {
            background:
              rgba(255,255,255,0.88);
            font-size: 9px;
          }

          #zachs-map-map .leaflet-control-zoom a {
            color: #0f172a;
          }
        `}</style>
      </div>
    </section>
  );
}
