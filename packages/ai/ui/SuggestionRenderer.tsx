import React from 'react'

interface Props {
  suggestions: string[]
  onSelect?: (value: string) => void
  title?: string
}

// Minimal placeholder renderer. Replace with real UI.
export function SuggestionRenderer({ suggestions, onSelect, title }: Props) {
  return (
    <div>
      {title ? <h3>{title}</h3> : null}
      <ul>
        {suggestions.map((text, idx) => (
          <li key={idx}>
            <button type="button" onClick={() => onSelect?.(text)}>
              {text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
