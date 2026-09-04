import { useState } from "react";
import { countryName, flagUrl } from "../lib/format";
import { COUNTRY_META } from "../lib/countryMeta";

interface FlagProps {
  code: string;
  size?: number;
}

/** Locally bundled flag image. Falls back to a neutral flag emoji. */
export default function Flag({ code, size = 22 }: FlagProps) {
  const [failed, setFailed] = useState(false);
  const url = flagUrl(code);
  if (!url || failed || !COUNTRY_META[code]) {
    return (
      <span style={{ fontSize: size }} role="img" aria-label={countryName(code)}>
        🏳️
      </span>
    );
  }
  return (
    <img
      src={url}
      alt={countryName(code)}
      width={Math.round(size * 1.33)}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      style={{ borderRadius: 4, objectFit: "cover", display: "block" }}
    />
  );
}
