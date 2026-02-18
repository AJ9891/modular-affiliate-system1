import React, { useState } from 'react'

interface Props {
  explanation: string
  label?: string
}

export function ExplanationToggle({ explanation, label = 'Why this helps' }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button type="button" onClick={() => setOpen(!open)}>
        {label}
      </button>
      {open ? <p>{explanation}</p> : null}
    </div>
  )
}
