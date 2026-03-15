import Link from 'next/link'
import { COCKPIT_MODULES } from '@/config/cockpitModules'

export function CockpitModules() {
  return (
    <>
      {COCKPIT_MODULES.map((mod) => (
        <Link
          key={mod.id}
          href={mod.route}
          className={`module ${mod.isVision ? 'vision vision-module' : ''}`}
          style={{
            left: mod.position.x,
            top: mod.position.y,
            width: mod.shape.width,
            height: mod.shape.height,
            clipPath: mod.shape.clipPath
          }}
        >
          <span>{mod.name}</span>
        </Link>
      ))}
    </>
  )
}
