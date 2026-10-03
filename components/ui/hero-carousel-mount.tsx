import * as React from "react"
import { createRoot } from "react-dom/client"
import { HeroCarousel } from "./hero-carousel"
import { PORTFOLIO_PROJECTS } from "./hero-carousel-demo"

function PortfolioHeroCarouselApp() {
  return (
    <div className="w-full h-full relative" style={{ minHeight: "680px", height: "100%" }}>
      <HeroCarousel
        items={PORTFOLIO_PROJECTS}
        defaultIndex={0}
        autoplay={false}
      />
    </div>
  )
}

function init() {
  const mountEl = document.getElementById("hero-carousel-root")
  if (mountEl && !mountEl.dataset.mounted) {
    mountEl.dataset.mounted = "true"
    const root = createRoot(mountEl)
    root.render(<PortfolioHeroCarouselApp />)
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init)
} else {
  init()
}
