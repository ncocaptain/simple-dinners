import {
  useEffect,
  useState,
  type CSSProperties,
} from "react";
import { Utensils } from "lucide-react";

type SafeRecipeImageProps = {
  src?: string;
  fallbackSrc?: string;
  alt?: string;
  style?: CSSProperties;
  fallbackStyle?: CSSProperties;
  iconSize?: number;
  onClick?: () => void;
};

export default function SafeRecipeImage({
  src,
  fallbackSrc,
  alt = "Recipe",
  style,
  fallbackStyle,
  iconSize = 22,
  onClick,
}: SafeRecipeImageProps) {
  const primary = String(src || "").trim();
  const fallback = String(fallbackSrc || "").trim();

  const [activeSrc, setActiveSrc] = useState(
    primary || fallback
  );
  const [failed, setFailed] = useState(
    !(primary || fallback)
  );

  useEffect(() => {
    setActiveSrc(primary || fallback);
    setFailed(!(primary || fallback));
  }, [primary, fallback]);

  const handleError = () => {
    if (
      fallback &&
      activeSrc !== fallback
    ) {
      setActiveSrc(fallback);
      return;
    }

    setFailed(true);
  };

  if (!failed && activeSrc) {
    return (
      <img
        src={activeSrc}
        alt={alt}
        style={style}
        onClick={onClick}
        onError={handleError}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      onClick={onClick}
      style={{
        ...style,
        ...fallbackStyle,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Utensils
        size={iconSize}
        style={{
          opacity: 0.4,
        }}
      />
    </div>
  );
}
