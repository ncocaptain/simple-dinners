import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Navigation,
  PlayCircle,
  Sparkles,
  Utensils,
} from "lucide-react";

import {
  getActiveZachsMapRestaurants,
  getRestaurantDirectionsUrl,
  getZachThumbnailUrl,
  getZachVideoUrl,
} from "../zachsMap/restaurants";

import ZachsRestaurantMap from "../zachsMap/ZachsRestaurantMap";

const restaurants = getActiveZachsMapRestaurants();

function openExternal(url: string) {
  window.open(
    url,
    "_blank",
    "noopener,noreferrer",
  );
}

export default function ZachsMapPage() {
  const navigate = useNavigate();

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(249,115,22,0.14), transparent 32%), #0f172a",
        color: "#f8fafc",
        padding:
          "calc(18px + env(safe-area-inset-top, 0px)) 16px calc(130px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 680,
          margin: "0 auto",
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            minHeight: 44,
            padding: "8px 4px",
            marginBottom: 16,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            border: 0,
            background: "transparent",
            color: "rgba(248,250,252,0.72)",
            fontSize: 14,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={18} />
          Back to your week
        </button>

        <section
          style={{
            padding: "26px 20px",
            marginBottom: 16,
            borderRadius: 24,
            border: "1px solid rgba(251,146,60,0.22)",
            background:
              "linear-gradient(145deg, rgba(124,45,18,0.28), rgba(30,41,59,0.86))",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              marginBottom: 16,
              display: "grid",
              placeItems: "center",
              borderRadius: 16,
              background: "rgba(249,115,22,0.16)",
              color: "#fb923c",
            }}
          >
            <MapPin size={27} />
          </div>

          <div
            style={{
              marginBottom: 7,
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              color: "#fdba74",
            }}
          >
            Local restaurants · Tri-Cities
          </div>

          <h1
            style={{
              margin: "0 0 10px",
              fontSize: "clamp(30px, 8vw, 42px)",
              lineHeight: 1,
              letterSpacing: "-0.04em",
            }}
          >
            Zach&apos;s Map
          </h1>

          <p
            style={{
              margin: "0 0 16px",
              maxWidth: 520,
              fontSize: 15,
              lineHeight: 1.6,
              color: "rgba(248,250,252,0.68)",
            }}
          >
            Local spots featured by ZachBites. Watch Zach&apos;s
            original video, get directions, and find somewhere
            worth trying tonight.
          </p>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "7px 10px",
              borderRadius: 999,
              background: "rgba(34,197,94,0.10)",
              border: "1px solid rgba(34,197,94,0.18)",
              color: "#86efac",
              fontSize: 11,
              fontWeight: 900,
            }}
          >
            <Sparkles size={14} />
            {restaurants.length} featured spots
          </div>
        </section>

        <ZachsRestaurantMap
          restaurants={restaurants}
        />

        <div
          style={{
            marginBottom: 12,
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#94a3b8",
          }}
        >
          Featured by ZachBites
        </div>

        <section
          style={{
            display: "grid",
            gap: 14,
          }}
        >
          {restaurants.map((restaurant) => (
            <article
              id={`zach-card-${restaurant.id}`}
              key={restaurant.id}
              style={{
                scrollMarginTop: 24,
                overflow: "hidden",
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(30,41,59,0.78)",
              }}
            >
              <img
                src={getZachThumbnailUrl(
                  restaurant.videoId,
                )}
                alt=""
                loading="lazy"
                style={{
                  width: "100%",
                  height: "clamp(180px, 32vw, 240px)",
                  objectFit: "cover",
                  display: "block",
                }}
              />

              <div style={{ padding: 16 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 8,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <h2
                      style={{
                        margin: "0 0 3px",
                        fontSize: 19,
                        lineHeight: 1.2,
                        fontWeight: 950,
                      }}
                    >
                      {restaurant.name}
                    </h2>

                    {restaurant.locationNote && (
                      <div
                        style={{
                          fontSize: 11,
                          lineHeight: 1.4,
                          color:
                            "rgba(248,250,252,0.48)",
                        }}
                      >
                        {restaurant.locationNote}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      flexShrink: 0,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#fdba74",
                    }}
                  >
                    <MapPin size={13} />
                    {restaurant.city}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginBottom: 11,
                  }}
                >
                  {restaurant.categories.map(
                    (category) => (
                      <span
                        key={category}
                        style={{
                          padding: "4px 7px",
                          borderRadius: 999,
                          background:
                            "rgba(255,255,255,0.06)",
                          fontSize: 10,
                          fontWeight: 800,
                          color: "#cbd5e1",
                        }}
                      >
                        {category}
                      </span>
                    ),
                  )}
                </div>

                {restaurant.featuredDish && (
                  <div
                    style={{
                      marginBottom: 13,
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      fontSize: 12,
                      lineHeight: 1.45,
                      color:
                        "rgba(248,250,252,0.62)",
                    }}
                  >
                    <Utensils
                      size={14}
                      style={{
                        color: "#fb923c",
                        flexShrink: 0,
                      }}
                    />
                    Zach tried:{" "}
                    <strong
                      style={{
                        color:
                          "rgba(248,250,252,0.86)",
                      }}
                    >
                      {restaurant.featuredDish}
                    </strong>
                  </div>
                )}

                <div
                  style={{
                    marginBottom: 13,
                    fontSize: 11,
                    lineHeight: 1.45,
                    color: "rgba(248,250,252,0.45)",
                  }}
                >
                  {restaurant.address},{" "}
                  {restaurant.city}, {restaurant.state}{" "}
                  {restaurant.zip}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(2, minmax(0, 1fr))",
                    gap: 8,
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      openExternal(
                        getZachVideoUrl(
                          restaurant.videoId,
                        ),
                      )
                    }
                    style={{
                      minHeight: 42,
                      padding: "9px 10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      borderRadius: 11,
                      border:
                        "1px solid rgba(255,255,255,0.09)",
                      background:
                        "rgba(255,255,255,0.05)",
                      color: "#f8fafc",
                      fontSize: 11,
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    <PlayCircle size={16} />
                    Watch Zach
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openExternal(
                        getRestaurantDirectionsUrl(
                          restaurant,
                        ),
                      )
                    }
                    style={{
                      minHeight: 42,
                      padding: "9px 10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      borderRadius: 11,
                      border:
                        "1px solid rgba(255,255,255,0.09)",
                      background:
                        "rgba(255,255,255,0.05)",
                      color: "#f8fafc",
                      fontSize: 11,
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    <Navigation size={16} />
                    Directions
                  </button>
                </div>

                <button
                  type="button"
                  disabled
                  style={{
                    width: "100%",
                    minHeight: 44,
                    marginTop: 8,
                    border: 0,
                    borderRadius: 12,
                    background: "#f97316",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 900,
                    opacity: 0.48,
                    cursor: "not-allowed",
                  }}
                >
                  Make this tonight&apos;s dinner · Coming next
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
