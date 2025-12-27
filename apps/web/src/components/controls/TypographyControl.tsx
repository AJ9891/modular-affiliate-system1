import { DESIGN_SYSTEM } from "@/config/designTokens";

export const TYPOGRAPHY_OPTIONS = [
  "heroXL",
  "heroL",
  "section",
  "body",
  "small",
] as const;

interface TypographyControlProps {
  value: string;
  onChange: (value: string) => void;
}

export const TypographyControl = ({ value, onChange }: TypographyControlProps) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full px-3 py-2 border rounded-lg"
  >
    {TYPOGRAPHY_OPTIONS.map((opt) => (
      <option key={opt} value={opt}>
        {opt}
      </option>
    ))}
  </select>
);
