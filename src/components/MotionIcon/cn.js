// Minimal className joiner used by the downloaded icons (replaces their `cn` helper).
export default function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}
