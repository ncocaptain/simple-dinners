import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ChefHat,
  ExternalLink,
  Globe2,
  Heart,
  Languages,
  ShoppingCart,
  Sparkles,
  Star,
  Utensils,
} from "lucide-react";

import Card from "../components/Card";
import { getStoredLanguage } from "../i18n";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.ncocaptain.simpledinners&pcampaignid=web_share";

const APP_STORE_URL =
  "https://apps.apple.com/us/app/simple-dinners/id6761655374";

const FACEBOOK_URL = "https://www.facebook.com/simpledinnersapp/";
const TIKTOK_URL = "https://www.tiktok.com/@simpledinnersapp";
const INSTAGRAM_URL = "";
const YOUTUBE_URL = "";

type StoreRating = {
  platform: string;
  rating: string;
  count: string;
  href: string;
};

const DEFAULT_STORE_RATINGS: StoreRating[] = [
  {
    platform: "Google Play",
    rating: "5.0",
    count: "14 public reviews",
    href: PLAY_STORE_URL,
  },
  {
  platform: "App Store",
  rating: "5.0",
  count: "2 public reviews",
  href: APP_STORE_URL,
},
];

type StoreBadgeProps = { store: "google" | "apple"; isSpanish: boolean };

function StoreBadgeImage({ store, isSpanish }: StoreBadgeProps) {
  return (
    <img
      src={"/store-badges/" + store + "-" + (isSpanish ? "es" : "en") + (store === "google" ? ".png" : ".svg")}
      alt={store === "google" ? "Google Play" : "App Store"}
      style={{ display: "block", width: store === "google" ? 196 : 144, maxWidth: "100%", height: "auto" }}
    />
  );
}

function StoreBadgeLink({ store, isSpanish }: StoreBadgeProps) {
  const label = store === "google" ? "Google Play" : "App Store";
  return (
    <a
      href={store === "google" ? PLAY_STORE_URL : APP_STORE_URL}
      target="_blank"
      rel="noreferrer"
      aria-label={(isSpanish ? "Descargar Simple Dinners en " : "Download Simple Dinners on ") + label}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", height: 76, maxWidth: "100%", textDecoration: "none", borderRadius: 12 }}
    >
      <StoreBadgeImage store={store} isSpanish={isSpanish} />
    </a>
  );
}

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M22 12.06C22 6.49 17.52 2 12 2S2 6.49 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.23.2 2.23.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.91h-2.34V22C18.34 21.24 22 17.08 22 12.06Z" />
    </svg>
  );
}

function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M16.6 5.82c1.05.75 2.3 1.2 3.62 1.25v3.3a7.45 7.45 0 0 1-3.7-.98v5.94c0 3.27-2.65 5.92-5.92 5.92a5.92 5.92 0 0 1-5.92-5.92c0-3.27 2.65-5.92 5.92-5.92.4 0 .8.04 1.17.12v3.43a2.58 2.58 0 0 0-1.17-.28 2.65 2.65 0 1 0 2.65 2.65V2.75h3.35c.2 1.25.9 2.35 2 3.07Z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { label: "Facebook", href: FACEBOOK_URL, Icon: FacebookIcon },
  { label: "TikTok", href: TIKTOK_URL, Icon: TikTokIcon },
  { label: "Instagram", href: INSTAGRAM_URL, Icon: Sparkles },
  { label: "YouTube", href: YOUTUBE_URL, Icon: Sparkles },
].filter((link) => link.href.trim().length > 0);

export default function AboutPage() {
  const navigate = useNavigate();
  const language = getStoredLanguage();

  const isSpanish = language === "es";

  const [storeRatings, setStoreRatings] =
    useState<StoreRating[]>(DEFAULT_STORE_RATINGS);

  useEffect(() => {
    let cancelled = false;

    async function loadStoreRatings() {
      try {
        const response = await fetch("/api/store-ratings");

        if (!response.ok) return;

        const data = await response.json();

        if (!cancelled && Array.isArray(data?.ratings)) {
          setStoreRatings(data.ratings);
        }
      } catch {
        // Keep fallback ratings if the live endpoint is not ready yet.
      }
    }

    loadStoreRatings();

    return () => {
      cancelled = true;
    };
  }, []);

  const copy = isSpanish
    ? {
        eyebrow: "Planificación de cenas para la vida real",
        title: "La cena, más simple.",
        subtitle:
          "Simple Dinners te ayuda a planificar tu semana, guardar recetas, crear listas de compras y cocinar paso a paso sin complicarte.",
        primaryCta: "Abrir la app",
        playStore: "Google Play",
        appStore: "App Store",
        updateTitle: "Ahora con Zach’s Map y nutrición Plus",
        updateText:
          "Descubre restaurantes destacados por ZachBites en la sección de comida para llevar. Con Simple Dinners Plus, también puedes consultar información nutricional estimada por porción de tus recetas.",
        socialProof: "Gracias por ayudar a crecer Simple Dinners.",
        ratingsTitle: "Calificaciones de la app",
        ratingsSubtitle:
          "Gracias a los primeros usuarios que están ayudando a crecer Simple Dinners.",
        socialTitle: "Síguenos",
        socialSubtitle:
          "Acompaña el crecimiento de Simple Dinners y ve lo que viene después.",
        featuredTitle: "Presentado en WJHL",
        featuredText:
          "Simple Dinners apareció en In the Kitchen with Kelly, compartiendo la historia de cómo se creó la app.",
        missionTitle: "Hecha para familias ocupadas",
        missionText:
          "Simple Dinners fue creada para reducir el estrés de la cena. Ya sea que estés alimentando a tu familia, planificando una semana ocupada o simplemente cansado de preguntar “¿qué hay para cenar?”, el objetivo es simple: hacer la cena más fácil, una noche a la vez.",
        featuresTitle: "Qué puedes hacer",
        finalTitle: "¿Listo para hacer la cena más fácil?",
        finalText:
          "Usa Simple Dinners en la web o descarga la app en tu teléfono.",
        plusTitle: "Más ayuda con Simple Dinners Plus",
        plusText: "La planificación diaria, tu recetario, la lista de compras y el Modo Cocina siguen siendo gratis. Plus añade más ayuda y funciones para compartir en familia.",
        plusFeatures: [
          {
            "title": "Nutrición estimada",
            "text": "Consulta las calorías, proteínas, carbohidratos, grasas, fibra y sodio estimados por porción, a partir de datos de USDA FoodData Central."
          },
          {
            "title": "Sincronización del hogar",
            "text": "Mantén tu plan de cenas, lista de compras y recetario sincronizados con tu hogar."
          },
          {
            "title": "Smart Week",
            "text": "Crea un plan de cenas personalizado según tu horario, despensa, preferencias y peticiones."
          },
          {
            "title": "Smart Shopping",
            "text": "Recibe ayuda adicional para organizar y depurar tu lista de compras."
          },
          {
            "title": "Más formas de guardar recetas",
            "text": "Importa recetas desde enlaces compatibles de Instagram, TikTok, Facebook y Pinterest, o desde descripciones de publicaciones, capturas de pantalla y videos."
          }
        ],
        features: [
          {
            "title": "Planifica tu semana",
            "text": "Crea un plan de cenas para cada noche sin pensarlo demasiado."
          },
          {
            "title": "Completa la comida",
            "text": "Agrega acompañamientos y postres opcionales a tu plan."
          },
          {
            "title": "Lista de compras",
            "text": "Manda ingredientes, acompañamientos y postres a una lista limpia."
          },
          {
            "title": "Modo Cocina",
            "text": "Sigue instrucciones paso a paso mientras cocinas."
          },
          {
            "title": "Guarda recetas",
            "text": "Guarda tus recetas favoritas desde enlaces de sitios web o texto pegado."
          },
          {
            "title": "Zach’s Map",
            "text": "Explora restaurantes de las Tri-Cities destacados por ZachBites, mira sus reseñas, obtén indicaciones y agrega una opción para llevar a tu plan semanal."
          },
          {
            "title": "Inglés y español",
            "text": "Cambia de idioma y planifica la cena a tu manera."
          }
        ],
      }
    : {
        eyebrow: "Dinner planning for real life",
        title: "Dinner planning made simple.",
        subtitle:
          "Simple Dinners helps you plan your week, save recipes, build shopping lists, and cook step by step without overcomplicating dinner.",
        primaryCta: "Open the app",
        playStore: "Google Play",
        appStore: "App Store",
        updateTitle: "Now with Zach’s Map and Plus nutrition",
        updateText:
          "Discover restaurants featured by ZachBites in Takeout. With Simple Dinners Plus, you can also explore estimated nutrition per serving for your recipes.",
        socialProof: "Thank you for helping Simple Dinners grow.",
        ratingsTitle: "App ratings",
        ratingsSubtitle:
          "Thanks to the early users helping Simple Dinners grow.",
        socialTitle: "Follow along",
        socialSubtitle:
          "Follow the Simple Dinners journey and see what is coming next.",
        featuredTitle: "Featured on WJHL",
        featuredText:
          "Simple Dinners was featured on In the Kitchen with Kelly, sharing the story behind how the app was created.",
        missionTitle: "Built for busy families",
        missionText:
          "Simple Dinners was built to make dinner feel less stressful. Whether you’re feeding a family, planning around a busy week, or just tired of asking “what’s for dinner?”, the goal is simple: make dinner easier, one night at a time.",
        featuresTitle: "What you can do",
        finalTitle: "Ready to make dinner easier?",
        finalText:
          "Use Simple Dinners on the web or download the app on your phone.",
        plusTitle: "More help with Simple Dinners Plus",
        plusText: "Your everyday planning, cookbook, shopping list, and Cook Mode stay free. Plus adds extra help and household sharing.",
        plusFeatures: [
          {
            "title": "Estimated nutrition",
            "text": "See estimated calories, protein, carbs, fat, fiber, and sodium per serving, based on USDA FoodData Central data."
          },
          {
            "title": "Household sync",
            "text": "Keep your dinner plan, shopping list, and cookbook in sync with your household."
          },
          {
            "title": "Smart Week",
            "text": "Build a personalized dinner week around your schedule, pantry, preferences, and requests."
          },
          {
            "title": "Smart Shopping",
            "text": "Get extra help organizing and cleaning up your shopping list."
          },
          {
            "title": "More ways to save recipes",
            "text": "Import recipes from supported Instagram, TikTok, Facebook, and Pinterest links, or from captions, screenshots, and videos."
          }
        ],
        features: [
          {
            "title": "Plan your week",
            "text": "Create a dinner plan for each night without overthinking it."
          },
          {
            "title": "Complete the meal",
            "text": "Add suggested sides and optional desserts to your dinner plan."
          },
          {
            "title": "Build a shopping list",
            "text": "Send ingredients, sides, and desserts to one clean list."
          },
          {
            "title": "Cook step by step",
            "text": "Use Cook Mode to follow recipes one step at a time."
          },
          {
            "title": "Save recipes",
            "text": "Save favorite recipes from website links or pasted text."
          },
          {
            "title": "Zach’s Map",
            "text": "Explore Tri-Cities restaurants featured by ZachBites, watch his reviews, get directions, and add a takeout pick to your weekly dinner plan."
          },
          {
            "title": "English and Spanish",
            "text": "Switch languages and plan dinner your way."
          }
        ],
      };

  const featureIcons = [
    CalendarDays,
    Utensils,
    ShoppingCart,
    ChefHat,
    Sparkles,
    Globe2,
    Languages,
  ];

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        padding: "24px 20px 120px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 900,
          display: "grid",
          gap: 22,
        }}
      >
        <section
          style={{
            padding: "28px 22px",
            borderRadius: 28,
            border: "1px solid rgba(255,255,255,0.08)",
            background:
              "radial-gradient(circle at top left, rgba(34,197,94,0.18), transparent 34%), rgba(255,255,255,0.04)",
            display: "grid",
            gap: 18,
          }}
        >
          <div
            style={{
              width: "fit-content",
              padding: "7px 11px",
              borderRadius: 999,
              background: "rgba(34,197,94,0.12)",
              border: "1px solid rgba(34,197,94,0.24)",
              color: "#86efac",
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: 0.4,
              textTransform: "uppercase",
            }}
          >
            {copy.eyebrow}
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(38px, 8vw, 70px)",
                lineHeight: 0.95,
                letterSpacing: "-0.06em",
                fontWeight: 1000,
              }}
            >
              {copy.title}
            </h1>

            <p
              style={{
                margin: 0,
                maxWidth: 680,
                fontSize: "clamp(16px, 2.6vw, 20px)",
                lineHeight: 1.5,
                opacity: 0.76,
              }}
            >
              {copy.subtitle}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              alignItems: "center",
            }}
          >
            <button
              type="button"
              onClick={() => navigate("/week")}
              style={{
                border: "1px solid rgba(34,197,94,0.45)",
                background: "rgba(34,197,94,0.16)",
                color: "#86efac",
                borderRadius: 16,
                padding: "13px 16px",
                fontWeight: 1000,
                cursor: "pointer",
              }}
            >
              {copy.primaryCta}
            </button>

            <StoreBadgeLink store="google" isSpanish={isSpanish} />

            <StoreBadgeLink store="apple" isSpanish={isSpanish} />
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "#fde68a",
              fontSize: 13,
              fontWeight: 900,
            }}
          >
            <Heart size={15} />
            {copy.socialProof}
          </div>
        </section>

        <Card title={copy.updateTitle} subtitle="">
          <div
            style={{
              padding: 14,
              borderRadius: 18,
              background: "rgba(250,204,21,0.10)",
              border: "1px solid rgba(250,204,21,0.22)",
              color: "#fde68a",
              fontWeight: 800,
              lineHeight: 1.45,
            }}
          >
            <Sparkles size={16} style={{ marginRight: 6, marginBottom: -3 }} />
            {copy.updateText}
          </div>
        </Card>

        <Card title={copy.ratingsTitle} subtitle={copy.ratingsSubtitle}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            {storeRatings.map((item) => (
              <a
                key={item.platform}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                style={{
                  textDecoration: "none",
                  padding: 16,
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "white",
                  display: "grid",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div style={{ fontWeight: 1000, minWidth: 0, flex: 1 }}>
                    {item.platform === "Google Play" || item.platform === "App Store" ? (
                      <StoreBadgeImage store={item.platform === "Google Play" ? "google" : "apple"} isSpanish={isSpanish} />
                    ) : item.platform}
                  </div>
                  <ExternalLink size={15} style={{ opacity: 0.65 }} />
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#fde68a",
                    fontSize: 24,
                    fontWeight: 1000,
                    letterSpacing: "-0.03em",
                  }}
                >
                  <Star size={22} fill="currentColor" />
                  {item.rating}
                </div>

                <div
                  style={{
                    fontSize: 13,
                    opacity: 0.68,
                    fontWeight: 800,
                  }}
                >
                  {item.count}
                </div>
              </a>
            ))}
          </div>
        </Card>

        {SOCIAL_LINKS.length > 0 && (
          <Card title={copy.socialTitle} subtitle={copy.socialSubtitle}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              {SOCIAL_LINKS.map((link) => {
  const Icon = link.Icon;

  return (
    <a
      key={link.label}
      href={link.href}
      target="_blank"
      rel="noreferrer"
      style={{
        textDecoration: "none",
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.05)",
        color: "white",
        borderRadius: 16,
        padding: "12px 14px",
        fontWeight: 900,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Icon size={16} />
      {link.label}
    </a>
  );
})}
            </div>
          </Card>
        )}

        <section
          style={{
            padding: 22,
            borderRadius: 26,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)",
            display: "grid",
            gap: 14,
          }}
        >
          <div style={{ display: "grid", gap: 6 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 28,
                letterSpacing: "-0.03em",
              }}
            >
              {copy.featuredTitle}
            </h2>

            <p
              style={{
                margin: 0,
                opacity: 0.72,
                lineHeight: 1.5,
              }}
            >
              {copy.featuredText}
            </p>
          </div>

          <div
            style={{
              width: "100%",
              overflow: "hidden",
              borderRadius: 18,
              background: "#000",
            }}
          >
            <iframe
              id="nxs-video-iframe-11"
              title="In the Kitchen with Kelly - Simple Dinners"
              src="https://redir1.wjhl.com/nxs-video/vid-anvato-12190209/embed/?autoplay=0&injected_via=embed&post_id=3142517&aspect_ratio=landscape"
              allowFullScreen
              loading="lazy"
              style={{
                display: "block",
                width: "100%",
                height: "auto",
                aspectRatio: "16 / 9",
                border: 0,
              }}
            />
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gap: 12,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 28,
              letterSpacing: "-0.03em",
            }}
          >
            {copy.featuresTitle}
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: 12,
            }}
          >
            {copy.features.map((feature, index) => {
              const Icon = featureIcons[index] || Sparkles;

              return (
                <div
                  key={feature.title}
                  style={{
                    padding: 18,
                    borderRadius: 22,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "grid",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 14,
                      background: "rgba(34,197,94,0.12)",
                      border: "1px solid rgba(34,197,94,0.24)",
                      color: "#86efac",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={18} />
                  </div>

                  <div style={{ fontWeight: 1000, fontSize: 17 }}>
                    {feature.title}
                  </div>

                  <div
                    style={{
                      opacity: 0.68,
                      fontSize: 14,
                      lineHeight: 1.45,
                    }}
                  >
                    {feature.text}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <Card title={copy.plusTitle} subtitle={copy.plusText}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: 12,
            }}
          >
            {copy.plusFeatures.map((feature) => (
              <div
                key={feature.title}
                style={{
                  padding: 18,
                  borderRadius: 22,
                  background: "rgba(250,204,21,0.06)",
                  border: "1px solid rgba(250,204,21,0.18)",
                  display: "grid",
                  alignContent: "start",
                  gap: 10,
                }}
              >
                <h3 style={{ margin: 0, fontWeight: 1000, fontSize: 17 }}>
                  {feature.title}
                </h3>
                <p style={{ margin: 0, opacity: 0.76, fontSize: 14, lineHeight: 1.45 }}>
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card title={copy.missionTitle} subtitle="">
          <p
            style={{
              margin: 0,
              fontSize: 16,
              lineHeight: 1.6,
              opacity: 0.78,
            }}
          >
            <Globe2 size={17} style={{ marginRight: 8, marginBottom: -3 }} />
            {copy.missionText}
          </p>
        </Card>

        <section
          style={{
            padding: 22,
            borderRadius: 26,
            border: "1px solid rgba(34,197,94,0.22)",
            background: "rgba(34,197,94,0.08)",
            display: "grid",
            gap: 12,
            textAlign: "center",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 30,
              letterSpacing: "-0.04em",
            }}
          >
            {copy.finalTitle}
          </h2>

          <p style={{ margin: 0, opacity: 0.72 }}>{copy.finalText}</p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 4,
                alignItems: "center",
            }}
          >
            <button
              type="button"
              onClick={() => navigate("/week")}
              style={{
                border: "1px solid rgba(34,197,94,0.45)",
                background: "rgba(34,197,94,0.16)",
                color: "#86efac",
                borderRadius: 16,
                padding: "13px 16px",
                fontWeight: 1000,
                cursor: "pointer",
              }}
            >
              {copy.primaryCta}
            </button>

            <StoreBadgeLink store="google" isSpanish={isSpanish} />

            <StoreBadgeLink store="apple" isSpanish={isSpanish} />
          </div>
        </section>
      </div>
    </div>
  );
}