import Link from 'next/link'
import { COCKPIT_MODULES } from '@/config/cockpitModules'
import styles from './CockpitModules.module.css'

export function CockpitModules() {
  return (
    <div className={styles.map}>
      {COCKPIT_MODULES.map((mod) => (
        <Link
          key={mod.id}
          href={mod.route}
          className={`${styles.hotspot} ${mod.isVision ? styles.vision : ''}`}
          style={{
            left: mod.position.x,
            top: mod.position.y,
            width: mod.shape.width,
            height: mod.shape.height,
            clipPath: mod.shape.clipPath
          }}
          aria-label={mod.name}
        >
          <span className={styles.label}>{mod.name}</span>
        </Link>
      ))}
    </div>
  )
}
