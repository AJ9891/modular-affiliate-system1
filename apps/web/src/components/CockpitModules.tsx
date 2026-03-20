'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { COCKPIT_MODULES } from '@/config/cockpitModules'
import styles from './CockpitModules.module.css'

interface Point {
  x: number
  y: number
}

type CornerIndex = 0 | 1 | 2 | 3
type ModuleCorners = [Point, Point, Point, Point]
type ModulePointMap = Record<string, ModuleCorners>

type DragState =
  | { type: 'corner'; moduleId: string; corner: CornerIndex }
  | { type: 'module'; moduleId: string; start: Point; origin: ModuleCorners }

const STORAGE_KEY = 'lp_cockpit_hotspot_points_v2'

const clampPercent = (value: number) => Math.min(100, Math.max(0, value))

const cloneCorners = (corners: ModuleCorners): ModuleCorners => [
  { ...corners[0] },
  { ...corners[1] },
  { ...corners[2] },
  { ...corners[3] }
]

const clonePointMap = (pointMap: ModulePointMap): ModulePointMap =>
  Object.fromEntries(Object.entries(pointMap).map(([moduleId, corners]) => [moduleId, cloneCorners(corners)]))

const moduleToCorners = (module: (typeof COCKPIT_MODULES)[number]): ModuleCorners => {
  return [
    { x: clampPercent(module.corners[0].x), y: clampPercent(module.corners[0].y) },
    { x: clampPercent(module.corners[1].x), y: clampPercent(module.corners[1].y) },
    { x: clampPercent(module.corners[2].x), y: clampPercent(module.corners[2].y) },
    { x: clampPercent(module.corners[3].x), y: clampPercent(module.corners[3].y) }
  ]
}

const isPoint = (value: unknown): value is Point => {
  if (!value || typeof value !== 'object') return false
  const point = value as Partial<Point>
  return typeof point.x === 'number' && Number.isFinite(point.x) && typeof point.y === 'number' && Number.isFinite(point.y)
}

const isCornerTuple = (value: unknown): value is ModuleCorners => {
  if (!Array.isArray(value) || value.length !== 4) return false
  return value.every((entry) => isPoint(entry))
}

const normalizeStoredPoints = (value: unknown, defaults: ModulePointMap): ModulePointMap => {
  if (!value || typeof value !== 'object') {
    return clonePointMap(defaults)
  }

  const stored = value as Record<string, unknown>
  const merged: ModulePointMap = {}

  for (const module of COCKPIT_MODULES) {
    const rawCorners = stored[module.id]
    if (isCornerTuple(rawCorners)) {
      merged[module.id] = [
        { x: clampPercent(rawCorners[0].x), y: clampPercent(rawCorners[0].y) },
        { x: clampPercent(rawCorners[1].x), y: clampPercent(rawCorners[1].y) },
        { x: clampPercent(rawCorners[2].x), y: clampPercent(rawCorners[2].y) },
        { x: clampPercent(rawCorners[3].x), y: clampPercent(rawCorners[3].y) }
      ]
    } else {
      merged[module.id] = cloneCorners(defaults[module.id])
    }
  }

  return merged
}

const geometryFromCorners = (corners: ModuleCorners) => {
  const xs = corners.map((point) => point.x)
  const ys = corners.map((point) => point.y)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const maxX = Math.max(...xs)
  const maxY = Math.max(...ys)

  const width = Math.max(maxX - minX, 0.1)
  const height = Math.max(maxY - minY, 0.1)

  const clipPoints = corners
    .map((point) => {
      const localX = ((point.x - minX) / width) * 100
      const localY = ((point.y - minY) / height) * 100
      return `${localX}% ${localY}%`
    })
    .join(', ')

  return {
    left: minX,
    top: minY,
    width,
    height,
    clipPath: `polygon(${clipPoints})`
  }
}

export function CockpitModules() {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [copied, setCopied] = useState(false)
  const [readyToPersist, setReadyToPersist] = useState(false)

  const defaultPoints = useMemo<ModulePointMap>(() => {
    const entries = COCKPIT_MODULES.map((module) => [module.id, moduleToCorners(module)] as const)
    return Object.fromEntries(entries)
  }, [])

  const [modulePoints, setModulePoints] = useState<ModulePointMap>(() => clonePointMap(defaultPoints))

  const getPointerPoint = useCallback((clientX: number, clientY: number): Point | null => {
    const map = mapRef.current
    if (!map) return null

    const rect = map.getBoundingClientRect()
    if (!rect.width || !rect.height) return null

    const x = ((clientX - rect.left) / rect.width) * 100
    const y = ((clientY - rect.top) / rect.height) * 100

    return { x: clampPercent(x), y: clampPercent(y) }
  }, [])

  const endDrag = useCallback(() => {
    dragRef.current = null
    document.body.style.userSelect = ''
  }, [])

  const onWindowPointerMove = useCallback(
    (event: PointerEvent) => {
      const drag = dragRef.current
      if (!drag) return

      const pointerPoint = getPointerPoint(event.clientX, event.clientY)
      if (!pointerPoint) return

      event.preventDefault()

      if (drag.type === 'corner') {
        setModulePoints((prev) => {
          const current = prev[drag.moduleId]
          if (!current) return prev

          const nextCorners = cloneCorners(current)
          nextCorners[drag.corner] = pointerPoint
          return { ...prev, [drag.moduleId]: nextCorners }
        })
        return
      }

      setModulePoints((prev) => {
        const originCorners = drag.origin
        const deltaX = pointerPoint.x - drag.start.x
        const deltaY = pointerPoint.y - drag.start.y

        const nextCorners: ModuleCorners = [
          { x: clampPercent(originCorners[0].x + deltaX), y: clampPercent(originCorners[0].y + deltaY) },
          { x: clampPercent(originCorners[1].x + deltaX), y: clampPercent(originCorners[1].y + deltaY) },
          { x: clampPercent(originCorners[2].x + deltaX), y: clampPercent(originCorners[2].y + deltaY) },
          { x: clampPercent(originCorners[3].x + deltaX), y: clampPercent(originCorners[3].y + deltaY) }
        ]

        return { ...prev, [drag.moduleId]: nextCorners }
      })
    },
    [getPointerPoint]
  )

  const onWindowPointerUp = useCallback(() => {
    endDrag()
  }, [endDrag])

  useEffect(() => {
    window.addEventListener('pointermove', onWindowPointerMove)
    window.addEventListener('pointerup', onWindowPointerUp)
    window.addEventListener('pointercancel', onWindowPointerUp)

    return () => {
      window.removeEventListener('pointermove', onWindowPointerMove)
      window.removeEventListener('pointerup', onWindowPointerUp)
      window.removeEventListener('pointercancel', onWindowPointerUp)
    }
  }, [onWindowPointerMove, onWindowPointerUp])

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        setReadyToPersist(true)
        return
      }

      const parsed = JSON.parse(raw) as unknown
      setModulePoints(normalizeStoredPoints(parsed, defaultPoints))
    } catch {
      setModulePoints(clonePointMap(defaultPoints))
    } finally {
      setReadyToPersist(true)
    }
  }, [defaultPoints])

  useEffect(() => {
    if (typeof window === 'undefined' || !readyToPersist) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(modulePoints))
  }, [modulePoints, readyToPersist])

  const startCornerDrag = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>, moduleId: string, corner: CornerIndex) => {
      if (!editMode) return

      event.preventDefault()
      event.stopPropagation()

      const pointerPoint = getPointerPoint(event.clientX, event.clientY)
      if (!pointerPoint) return

      dragRef.current = { type: 'corner', moduleId, corner }
      document.body.style.userSelect = 'none'
    },
    [editMode, getPointerPoint]
  )

  const startModuleDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, moduleId: string) => {
      if (!editMode) return

      event.preventDefault()
      event.stopPropagation()

      const pointerPoint = getPointerPoint(event.clientX, event.clientY)
      const currentCorners = modulePoints[moduleId]
      if (!pointerPoint || !currentCorners) return

      dragRef.current = { type: 'module', moduleId, start: pointerPoint, origin: cloneCorners(currentCorners) }
      document.body.style.userSelect = 'none'
    },
    [editMode, getPointerPoint, modulePoints]
  )

  const handleReset = useCallback(() => {
    const resetPoints = clonePointMap(defaultPoints)
    setModulePoints(resetPoints)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(resetPoints))
    }
  }, [defaultPoints])

  const handleCopyJson = useCallback(async () => {
    const payload = COCKPIT_MODULES.map((module) => ({
      id: module.id,
      name: module.name,
      route: module.route,
      corners: modulePoints[module.id]
    }))

    const text = JSON.stringify(payload, null, 2)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      setCopied(false)
    }
  }, [modulePoints])

  return (
    <div ref={mapRef} className={styles.map}>
      <div className={styles.editorControls}>
        <button
          type="button"
          className={styles.editorButton}
          onClick={() => setEditMode((current) => !current)}
          aria-pressed={editMode}
        >
          {editMode ? 'Finish Edit' : 'Edit Hotspots'}
        </button>
        <button type="button" className={styles.editorButton} onClick={handleReset}>
          Reset
        </button>
        <button type="button" className={styles.editorButton} onClick={handleCopyJson}>
          {copied ? 'Copied' : 'Copy JSON'}
        </button>
      </div>

      {COCKPIT_MODULES.map((module) => {
        const corners = modulePoints[module.id] ?? defaultPoints[module.id]
        const geometry = geometryFromCorners(corners)

        return (
          <div key={module.id}>
            {editMode && (
              <div
                className={styles.editorBox}
                style={{
                  left: `${geometry.left}%`,
                  top: `${geometry.top}%`,
                  width: `${geometry.width}%`,
                  height: `${geometry.height}%`,
                  clipPath: geometry.clipPath
                }}
                onPointerDown={(event) => startModuleDrag(event, module.id)}
              />
            )}

            <div
              className={styles.moduleLayer}
              style={{
                left: `${geometry.left}%`,
                top: `${geometry.top}%`,
                width: `${geometry.width}%`,
                height: `${geometry.height}%`
              }}
            >
              <Link
                href={module.route}
                className={`${styles.hotspot} ${module.isVision ? styles.vision : ''}`}
                style={{
                  clipPath: geometry.clipPath,
                  pointerEvents: editMode ? 'none' : 'auto'
                }}
                aria-label={module.name}
                tabIndex={editMode ? -1 : 0}
              />
              <span className={styles.label}>{module.name}</span>
            </div>

            {editMode &&
              corners.map((point, cornerIndex) => (
                <button
                  key={`${module.id}-corner-${cornerIndex}`}
                  type="button"
                  className={styles.cornerHandle}
                  style={{ left: `${point.x}%`, top: `${point.y}%` }}
                  onPointerDown={(event) => startCornerDrag(event, module.id, cornerIndex as CornerIndex)}
                  aria-label={`${module.name} corner ${cornerIndex + 1}`}
                />
              ))}
          </div>
        )
      })}
    </div>
  )
}
