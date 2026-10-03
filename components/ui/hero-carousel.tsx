"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface HeroCarouselItem {
  id?: string | number
  title: string
  image: string
  credit?: string
  meta?: string[]
  accent?: string
  description?: string
  tags?: string[]
  liveUrl?: string
  githubUrl?: string
}

export interface HeroCarouselProps {
  items: HeroCarouselItem[]
  index?: number
  defaultIndex?: number
  onIndexChange?: (index: number) => void
  brand?: React.ReactNode
  onBack?: () => void
  onMenu?: () => void
  autoplay?: boolean
  autoplayDelay?: number
  className?: string
}

/* Layout Ratios */
const CARD_H = 0.28 // card height ÷ stage height
const CARD_AR = 0.75 // 3:4 aspect ratio
const GAP = 0.04 // gap ÷ card width
const STRIP_TOP = 0.52 // strip's shared top edge
const TITLE_RATIO = 0.082 // headline cap size ÷ stage height
const LABEL_RATIO = 0.011 // label size ÷ stage height
const PAD_RATIO = 0.028 // gutter ÷ stage width
const RAIL_RATIO = 0.22 // rail width ÷ stage width

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

export function HeroCarousel({
  items,
  index: controlled,
  defaultIndex = 0,
  onIndexChange,
  brand,
  onBack,
  onMenu,
  className,
}: HeroCarouselProps) {
  const stageRef = React.useRef<HTMLDivElement>(null)
  const trackRef = React.useRef<HTMLDivElement>(null)
  const [box, setBox] = React.useState({ w: 0, h: 0 })
  const [uncontrolled, setUncontrolled] = React.useState(defaultIndex)
  const [isDragging, setIsDragging] = React.useState(false)

  const isControlled = controlled !== undefined
  const activeIndex = Math.min(items.length - 1, Math.max(0, isControlled ? controlled : uncontrolled))

  // User interaction refs to prevent programmatic smooth-scroll from interrupting native swipe momentum
  const isUserInteractingRef = React.useRef(false)
  const isProgrammaticScrollRef = React.useRef(false)
  const interactionTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // 1. Preload all project images into memory so swiping has 0 loading lag
  React.useEffect(() => {
    if (!items || items.length === 0) return
    items.forEach((item) => {
      if (item.image) {
        const img = new Image()
        img.src = item.image
      }
    })
  }, [items])

  // 2. ResizeObserver to dynamically adapt dimensions
  React.useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const read = () => {
      setBox({ w: stage.clientWidth, h: stage.clientHeight })
    }
    read()
    const ro = new ResizeObserver(read)
    ro.observe(stage)
    return () => ro.disconnect()
  }, [])

  const fullH = Math.min(360, Math.max(120, box.h * CARD_H))
  const halfH = Math.round(fullH * 0.58)
  const cardW = Math.round(fullH * CARD_AR)
  const gap = Math.max(8, Math.round(cardW * GAP))
  const step = cardW + gap
  const pad = Math.max(20, Math.round(box.w * PAD_RATIO))
  const label = Math.max(10, Math.round(box.h * LABEL_RATIO))

  const setIndex = React.useCallback(
    (next: number) => {
      const clamped = Math.min(items.length - 1, Math.max(0, next))
      if (!isControlled) setUncontrolled(clamped)
      if (clamped !== activeIndex) onIndexChange?.(clamped)
    },
    [activeIndex, isControlled, items.length, onIndexChange]
  )

  // Smooth scroll to a specific card target
  const scrollToCard = React.useCallback(
    (targetIndex: number, smooth = true) => {
      const track = trackRef.current
      if (!track || step <= 0) return
      const clamped = Math.min(items.length - 1, Math.max(0, targetIndex))
      const targetScroll = clamped * step

      isProgrammaticScrollRef.current = true
      track.scrollTo({
        left: targetScroll,
        behavior: smooth ? "smooth" : "auto",
      })

      setTimeout(() => {
        isProgrammaticScrollRef.current = false
      }, 400)
    },
    [items.length, step]
  )

  // Smooth native track scroll listener: keeps track of active card without interrupting swiping
  React.useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let rafId: number
    const onScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        if (step <= 0) return
        const currentScroll = track.scrollLeft
        const nearest = Math.round(currentScroll / step)
        const clamped = Math.min(items.length - 1, Math.max(0, nearest))
        if (clamped !== activeIndex) {
          setIndex(clamped)
        }
      })
    }

    const onUserInteractionStart = () => {
      isUserInteractingRef.current = true
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current)
      }
    }

    const onUserInteractionEnd = () => {
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current)
      }
      interactionTimeoutRef.current = setTimeout(() => {
        isUserInteractingRef.current = false
      }, 150)
    }

    track.addEventListener("scroll", onScroll, { passive: true })
    track.addEventListener("touchstart", onUserInteractionStart, { passive: true })
    track.addEventListener("touchend", onUserInteractionEnd, { passive: true })
    track.addEventListener("wheel", onUserInteractionStart, { passive: true })
    window.addEventListener("wheel", onUserInteractionEnd, { passive: true })

    return () => {
      track.removeEventListener("scroll", onScroll)
      track.removeEventListener("touchstart", onUserInteractionStart)
      track.removeEventListener("touchend", onUserInteractionEnd)
      track.removeEventListener("wheel", onUserInteractionStart)
      window.removeEventListener("wheel", onUserInteractionEnd)
      cancelAnimationFrame(rafId)
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current)
      }
    }
  }, [activeIndex, items.length, setIndex, step])

  // Mouse drag support with smooth kinetic release
  React.useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let startX = 0
    let startScroll = 0
    let dragging = false
    let moved = false

    const onMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a, button")) return
      dragging = true
      moved = false
      startX = e.pageX
      startScroll = track.scrollLeft
      track.style.scrollBehavior = "auto"
      track.style.cursor = "grabbing"
      track.style.userSelect = "none"
      isUserInteractingRef.current = true
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return
      const delta = e.pageX - startX
      if (Math.abs(delta) > 3) moved = true
      track.scrollLeft = startScroll - delta
    }

    const onMouseUp = () => {
      if (!dragging) return
      dragging = false
      track.style.scrollBehavior = "smooth"
      track.style.cursor = "grab"
      track.style.removeProperty("user-select")
      if (moved) {
        setIsDragging(true)
        const nearest = Math.round(track.scrollLeft / step)
        scrollToCard(nearest, true)
        setTimeout(() => setIsDragging(false), 50)
      }
      setTimeout(() => {
        isUserInteractingRef.current = false
      }, 100)
    }

    track.addEventListener("mousedown", onMouseDown)
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)

    return () => {
      track.removeEventListener("mousedown", onMouseDown)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
  }, [scrollToCard, step])

  const active = items[activeIndex] ?? items[0]
  const accent = active?.accent ?? "#4285F4"

  const handlePrev = () => {
    const nextIdx = Math.max(0, activeIndex - 1)
    setIndex(nextIdx)
    scrollToCard(nextIdx, true)
  }

  const handleNext = () => {
    const nextIdx = Math.min(items.length - 1, activeIndex + 1)
    setIndex(nextIdx)
    scrollToCard(nextIdx, true)
  }

  return (
    <div
      ref={stageRef}
      tabIndex={0}
      role="region"
      aria-label="Featured Works Carousel"
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault()
          handlePrev()
        } else if (e.key === "ArrowRight") {
          e.preventDefault()
          handleNext()
        } else if (e.key === "Home") {
          e.preventDefault()
          setIndex(0)
          scrollToCard(0, true)
        } else if (e.key === "End") {
          e.preventDefault()
          setIndex(items.length - 1)
          scrollToCard(items.length - 1, true)
        }
      }}
      className={cn(
        "relative h-full w-full overflow-hidden text-white select-none outline-none",
        className
      )}
      style={{
        background: "#0c0e12",
      }}
    >
      {/* ── Background: Persistently pre-rendered layers for instantaneous, silky 0ms GPU crossfade ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {items.map((item, i) => {
          const isActive = i === activeIndex
          return (
            <div
              key={item.id ?? i}
              className="absolute inset-0 transition-opacity duration-500 ease-out"
              style={{
                opacity: isActive ? 1 : 0,
                visibility: Math.abs(i - activeIndex) <= 2 ? "visible" : "hidden",
                willChange: "opacity",
              }}
            >
              <img
                src={item.image}
                alt=""
                aria-hidden
                loading="eager"
                decoding="async"
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  filter: "brightness(0.34) contrast(1.12) saturate(0.85)",
                  transform: isActive ? "scale(1.02)" : "scale(1.06)",
                  transition: "transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
              {/* Refined ambient colored glow matching the project accent */}
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(circle at 65% 35%, ${item.accent ?? "#4285F4"}22 0%, transparent 65%)`,
                }}
              />
            </div>
          )
        })}
      </div>

      {/* ── Architectural Grid Overlay matching portfolio theme ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* ── Vignette and legibility gradients that blend smoothly with portfolio ── */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(12,14,18,0.75) 0%, rgba(12,14,18,0.2) 30%, rgba(12,14,18,0.7) 75%, #0c0e12 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(12,14,18,0.85) 0%, transparent 12%, transparent 88%, rgba(12,14,18,0.85) 100%)",
        }}
      />

      {/* Subtle cinematic grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-overlay"
        style={{ backgroundImage: GRAIN, backgroundSize: "180px 180px" }}
      />

      {/* ── Top Bar Controls ── */}
      {(onBack || active.credit) ? (
        <div
          className="absolute inset-x-0 flex items-center justify-between z-20 pointer-events-auto"
          style={{
            top: Math.max(18, box.h * 0.032),
            paddingLeft: pad,
            paddingRight: pad,
          }}
        >
          <div className="flex items-center gap-3">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="opacity-80 hover:opacity-100 text-xs font-mono tracking-wider transition-opacity cursor-pointer px-3 py-1 rounded-full bg-white/5 border border-white/10"
              >
                ← BACK
              </button>
            ) : null}
            {active.credit ? (
              <div className="font-mono text-xs uppercase tracking-[0.16em] text-white/70 font-medium px-3.5 py-1.2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                {active.credit}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* ── Headline Block: Clean Project Title, Description & Action Buttons ── */}
      <div
        className="absolute inset-x-0 top-0 flex flex-col justify-end z-10 pointer-events-none"
        style={{
          height: `${STRIP_TOP * 100}%`,
          paddingLeft: pad,
          paddingRight: pad,
          paddingBottom: Math.round(box.h * 0.028),
        }}
      >
        <div className="flex w-full flex-wrap items-end gap-x-[4vw] gap-y-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-2 max-w-2xl"
            >
              {/* Project title */}
              <h2
                className="font-extrabold uppercase leading-[0.92] tracking-[-0.035em] text-white"
                style={{
                  fontSize: Math.max(30, Math.round(box.h * TITLE_RATIO)),
                  fontFamily: "'TASA Orbiter', 'TASA Explorer', sans-serif",
                }}
              >
                {active.title}
              </h2>

              {/* Clear description */}
              {active.description ? (
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal max-w-xl line-clamp-3 sm:line-clamp-none">
                  {active.description}
                </p>
              ) : null}

              {/* Direct interactive links */}
              {active.liveUrl || active.githubUrl ? (
                <div className="flex items-center gap-2.5 pt-1 pointer-events-auto">
                  {active.liveUrl ? (
                    <a
                      href={active.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-mono tracking-wider bg-white text-black font-semibold hover:bg-white/90 active:scale-95 transition-all shadow-md"
                    >
                      Live ↗
                    </a>
                  ) : null}
                  {active.githubUrl ? (
                    <a
                      href={active.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-mono tracking-wider bg-white/10 text-white border border-white/20 hover:bg-white/25 active:scale-95 transition-all backdrop-blur-sm"
                    >
                      GitHub ↗
                    </a>
                  ) : null}
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>

          {/* Right-aligned meta facts */}
          {active.meta?.length ? (
            <div
              className="ml-auto hidden sm:flex items-end pointer-events-none"
              style={{ gap: `${Math.max(10, box.w * 0.028)}px` }}
            >
              {active.meta.map((fact) => (
                <span
                  key={`${activeIndex}-${fact}`}
                  className="font-mono text-xs whitespace-nowrap uppercase tracking-[0.14em] text-white/60 px-2 py-0.5 rounded bg-white/5 border border-white/10"
                  style={{ fontSize: label }}
                >
                  {fact}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* ── Native Smooth Horizontal Filmstrip (cards with hardware snap and hover glow) ── */}
      <div
        ref={trackRef}
        data-lenis-prevent="true"
        tabIndex={-1}
        className="absolute inset-x-0 flex items-start overflow-x-auto no-scrollbar"
        style={{
          top: `${STRIP_TOP * 100}%`,
          height: fullH + 28,
          gap,
          paddingLeft: Math.max(pad, Math.round(box.w / 2 - cardW / 2)),
          paddingRight: Math.max(pad, Math.round(box.w / 2 - cardW / 2)),
          cursor: "grab",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
          scrollSnapType: "x mandatory",
          contain: "paint layout",
        }}
      >
        {items.map((item, i) => {
          const isFocused = i === activeIndex
          return (
            <button
              key={item.id ?? i}
              type="button"
              aria-label={item.title}
              aria-current={isFocused}
              onClick={() => {
                setIndex(i)
                scrollToCard(i, true)
              }}
              className="relative shrink-0 overflow-hidden rounded-xl bg-white/5 cursor-pointer outline-none transition-all duration-300 ease-out"
              style={{
                width: cardW,
                height: fullH,
                scrollSnapAlign: "center",
                border: isFocused ? `1.5px solid rgba(255,255,255,0.85)` : "1px solid rgba(255,255,255,0.12)",
                boxShadow: isFocused ? `0 14px 32px -6px ${item.accent ?? "#4285F4"}55` : "none",
                transform: isFocused ? "translate3d(0, 0, 0) scale(1)" : "translate3d(0, 10px, 0) scale(0.92)",
                opacity: isFocused ? 1 : 0.55,
                willChange: "transform, opacity",
              }}
            >
              <img
                src={item.image}
                alt={item.title}
                loading="eager"
                decoding="async"
                draggable={false}
                className="h-full w-full object-cover"
                style={{ objectPosition: "50% 26%" }}
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-black transition-opacity duration-300"
                style={{ opacity: isFocused ? 0 : 0.3 }}
              />
              {/* Card Title Label Pill */}
              <div
                className="absolute bottom-2 inset-x-2 px-2 py-1 rounded bg-black/75 backdrop-blur-sm text-[11px] font-mono text-white/90 truncate text-left"
                style={{ opacity: isFocused ? 1 : 0.85 }}
              >
                {item.title}
              </div>
            </button>
          )
        })}
      </div>

      {/* ── Position Rail: Numeric Counter & Slider Indicator ── */}
      <div
        className="absolute z-10 pointer-events-none"
        style={{
          left: pad,
          bottom: Math.max(16, box.h * 0.024),
          width: Math.max(140, box.w * RAIL_RATIO),
        }}
      >
        <div
          className="flex justify-between font-mono tabular-nums opacity-80"
          style={{ fontSize: label }}
        >
          <span>{String(activeIndex + 1).padStart(2, "0")}</span>
          <span className="text-white/40">/</span>
          <span>{String(items.length).padStart(2, "0")}</span>
        </div>
        <div className="relative mt-2 h-[2px] w-full bg-white/15 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 bg-white transition-all duration-300 ease-out"
            style={{
              width: `${100 / items.length}%`,
              left: `${(activeIndex / items.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
