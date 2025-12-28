import { BRAND_MODES, BrandModeKey } from '@/contexts/BrandModeContext'

export function BrandModeSelect({
  value,
  onChange,
}: {
  value: BrandModeKey
  onChange: (value: BrandModeKey) => void
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold">
        Brand Personality
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value as BrandModeKey)}
        className="w-full p-2 rounded border bg-white"
      >
        {(Object.keys(BRAND_MODES) as BrandModeKey[]).map((key) => (
          <option key={key} value={key}>
            {key.toUpperCase()}
          </option>
        ))}
      </select>

      <p className="text-xs text-gray-500">
        This controls tone, hero copy, visuals, and AI behavior.
      </p>
    </div>
  )
}
