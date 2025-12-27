import { DESIGN_SYSTEM } from "@/config/designTokens";

interface SpacingControlProps {
  value: string;
  onChange: (value: string) => void;
}

export const SpacingControl = ({ value, onChange }: SpacingControlProps) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border rounded-lg"
    >
      {Object.entries(DESIGN_SYSTEM.spacing).map(([k, v]) => (
        <option key={k} value={v}>
          {v}
        </option>
      ))}
    </select>
  );
};
