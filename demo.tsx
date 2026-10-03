// This is a file with a demo for your component
// That's what users will see in the preview
// Create new files in this directory to add more demos
"use client"

import * as React from "react"
import {
  HeroCarousel,
  type HeroCarouselItem,
} from "@/components/ui/hero-carousel"

// Placeholder art served straight off the crafterui CDN / Unsplash so the demo works the
// moment it is installed. Each item's `accent` is the hue the whole backdrop grades to.
const ART = (name: string) =>
  `https://pub-45c4a3d9611041d08fe82d52599b72b0.r2.dev/primary-showcase-assets/${name}.jpg`

export const ORIGINAL_LOOKS: HeroCarouselItem[] = [
  {
    title: "Prismatic\nRift",
    image: ART("prismatic-rift-anime"),
    credit: "BY AURELIA STUDIO.",
    meta: ["SAT NOV 15", "5-10 PM", "MIAMI"],
    accent: "#7b61ff",
  },
  {
    title: "Ember\nClouds",
    image: ART("black-hole-ember-clouds"),
    credit: "BY MAISON DELACROIX.",
    meta: ["SUN NOV 16", "2-6 PM", "PARIS"],
    accent: "#ff4114",
  },
  {
    title: "Neon\nPortal",
    image: ART("neon-cave-portal-silhouette"),
    credit: "BY STUDIO VANTA.",
    meta: ["THU NOV 20", "8-11 PM", "BERLIN"],
    accent: "#00c8ff",
  },
  {
    title: "Red\nRibbon",
    image: ART("red-ribbon-typography"),
    credit: "BY CASA SOLARA.",
    meta: ["FRI NOV 21", "6-9 PM", "LISBON"],
    accent: "#e5231b",
  },
  {
    title: "Celestial\nLight",
    image: ART("celestial-light-figure"),
    credit: "BY AURELIA STUDIO.",
    meta: ["SAT NOV 22", "5-10 PM", "MIAMI"],
    accent: "#2f7bff",
  },
  {
    title: "Neon\nUplight",
    image: ART("neon-portrait-uplight"),
    credit: "BY ATELIER SUD.",
    meta: ["SUN NOV 23", "4-8 PM", "MARRAKECH"],
    accent: "#ff2f9c",
  },
  {
    title: "Indigo\nMarble",
    image: ART("indigo-liquid-marble"),
    credit: "BY OCHRE COLLECTIVE.",
    meta: ["WED NOV 26", "7-11 PM", "LAGOS"],
    accent: "#4356c8",
  },
  {
    title: "Launch\nWindow",
    image: ART("rocket-launch-gradient"),
    credit: "BY STUDIO NORTE.",
    meta: ["FRI NOV 28", "9 PM-2 AM", "SÃO PAULO"],
    accent: "#14307a",
  },
  {
    title: "Cosmic\nWave",
    image: ART("astronaut-cosmic-wave"),
    credit: "BY NOIR ET CIE.",
    meta: ["SAT NOV 29", "10 PM-4 AM", "TOKYO"],
    accent: "#ff3b6b",
  },
]

/**
 * Rahul Achari YC - Production AI/ML Engineer Projects
 * Complete with descriptive overviews, live demo deployments, and GitHub repositories.
 */
export const PORTFOLIO_PROJECTS: HeroCarouselItem[] = [
  {
    id: "propcast",
    title: "PropCast\nAI Valuation",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=80",
    credit: "MACHINE LEARNING • 92% R² ACCURACY",
    meta: ["PYTHON", "DJANGO", "GRADIENT BOOSTING"],
    accent: "#2563eb",
    description:
      "Predictive machine learning real estate valuation engine achieving 92% R² accuracy. Integrated with Groq LLaMA for natural language market analysis, interactive Plotly visualization dashboards, and multi-parameter property comparison tools.",
    tags: ["Python", "Scikit-Learn", "Groq LLaMA", "Docker"],
    liveUrl: "https://propcast-oyan.onrender.com/",
    githubUrl: "https://github.com/rahulachari/PropCast",
  },
  {
    id: "akshara",
    title: "Akshara\nMasterplans",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
    credit: "PLOTTED LAND • ARCHITECTURAL CAD",
    meta: ["REACT", "TYPESCRIPT", "TAILWIND"],
    accent: "#059669",
    description:
      "Architectural plotted land development and masterplanning platform featuring subterranean infrastructure grids, wide asphalt avenues, DTCP and RERA compliance documentation, and interactive spatial layout mapping.",
    tags: ["React", "TypeScript", "Tailwind CSS", "Architecture"],
    liveUrl: "https://akshara-three.vercel.app/",
    githubUrl: "https://github.com/rahulachari/Akshara",
  },
  {
    id: "controld",
    title: "Control-D\nHealth AI",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=80",
    credit: "CLINICAL AI • NEURAL NETWORKS",
    meta: ["CNN", "TRANSFORMERS", "SUPABASE"],
    accent: "#dc2626",
    description:
      "Unified digital health assistant powered by Convolutional Neural Networks and Transformers. Dynamically optimizes nutrition and clinical workout protocols based on biometric indicators, real-time glucose metrics, and BMI tracking.",
    tags: ["React", "TypeScript", "Supabase", "Transformers"],
    liveUrl: "https://controld-three.vercel.app/",
    githubUrl: "https://github.com/rahulachari/control-d",
  },
  {
    id: "uniml",
    title: "UniML\nATS Screener",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1400&q=80",
    credit: "DOCUMENT AI • OPENCV & TESSERACT",
    meta: ["FLASK", "RANDOM FOREST", "TESSERACT"],
    accent: "#7c3aed",
    description:
      "Enterprise ATS resume parsing and automated applicant evaluation engine. Uses OpenCV and Tesseract OCR for dense optical text extraction paired with Random Forest scoring across Banking, Education, and Healthcare candidate profiles.",
    tags: ["Flask", "OpenCV", "Tesseract OCR", "SQLite"],
    liveUrl: "https://uniml.onrender.com/",
    githubUrl: "https://github.com/rahulachari/UniML",
  },
  {
    id: "gscms",
    title: "GSCMS\nJewelry Atelier",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1400&q=80",
    credit: "FINTECH ERP • LEDGER ACCOUNTING",
    meta: ["NEXT.JS", "POSTGRESQL", "SUPABASE"],
    accent: "#d97706",
    description:
      "Production atelier customer and inventory management platform featuring custom jewellery order lifecycle tracking, real-time gold/silver purity bullion calculations, automated GST invoicing, and customer accounting ledgers.",
    tags: ["Next.js", "PostgreSQL", "Supabase", "Tailwind CSS"],
    liveUrl: "https://gscms.vercel.app/",
    githubUrl: "https://github.com/rahulachari/GSCMS",
  },
  {
    id: "voiceos",
    title: "VoiceOS\nSpeech Agent",
    image: "https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&w=1400&q=80",
    credit: "VOICE AI • REAL-TIME WEBSOCKETS",
    meta: ["WHISPER", "GROQ LLAMA", "KOKORO TTS"],
    accent: "#0891b2",
    description:
      "Autonomous conversational AI voice agent engineered with ultra-low latency speech-to-speech processing, real-time intent recognition, Groq LLaMA reasoning, and seamless function calling for hands-free task automation.",
    tags: ["Python", "Fastify", "Whisper", "WebSockets"],
    githubUrl: "https://github.com/rahulachari/MAXI_VOICE-AGENT",
  },
  {
    id: "adhikar",
    title: "Adhikar\nLand Doc AI",
    image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1400&q=80",
    credit: "LEGAL TECH • DEED EXTRACTION",
    meta: ["PYTHON", "NLP", "OCR"],
    accent: "#db2777",
    description:
      "AI-powered land document intelligence platform designed to extract, analyze, and verify legal deeds and land records effortlessly using machine learning models and OCR analysis.",
    tags: ["Python", "Document AI", "OCR", "Vercel"],
    liveUrl: "https://adhikar-azure.vercel.app/",
    githubUrl: "https://github.com/rahulachari/Adhikar-LandDocAI-",
  },
  {
    id: "precast",
    title: "Precast Walls\nCrack AI",
    image: "https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=1400&q=80",
    credit: "COMPUTER VISION • STRUCTURAL AUDIT",
    meta: ["CANVAS 3D", "OPENCV", "NETLIFY"],
    accent: "#0d9488",
    description:
      "Computer vision structural defect inspection and 3D precast wall construction simulator with interactive real-time cost estimation and concrete fracture detection.",
    tags: ["HTML5", "CSS3", "JavaScript", "Canvas API"],
    liveUrl: "https://glittery-selkie-dcfb25.netlify.app/",
    githubUrl: "https://github.com/rahulachari/Precast-Wall-Crack-Detection",
  },
  {
    id: "beatsync",
    title: "Beat Sync\nAudio Network",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1400&q=80",
    credit: "DISTRIBUTED AUDIO • LOCAL NETWORKING",
    meta: ["NETWORKING", "SUB-MS LATENCY", "PYTHON"],
    accent: "#4f46e5",
    description:
      "Sub-millisecond multi-device acoustic synchronization system streaming multi-speaker distributed audio playback seamlessly over local peer networks.",
    tags: ["Python", "Networking", "Audio Sync"],
    githubUrl: "https://github.com/rahulachari/Beat-sync-",
  },
  {
    id: "reminderremix",
    title: "Reminder Remix\nAutomation",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80",
    credit: "DESKTOP VISION • PYGAME ENGINE",
    meta: ["PYTHON", "OPENCV", "AUTOMATION"],
    accent: "#e11d48",
    description:
      "Context-aware desktop automation assistant with OpenCV visual trigger detection, smart notification queueing, and reactive workspace alerts.",
    tags: ["Python", "OpenCV", "Pygame"],
    githubUrl: "https://github.com/rahulachari/Reminder-Remix",
  },
]

// ONLY DEFAULT EXPORT WILL BE TREATED AS A DEMO
export default function DemoOne() {
  const [viewMode, setViewMode] = React.useState<"portfolio" | "curated">("portfolio")

  return (
    <div className="relative h-screen w-full bg-black">
      {/* Switcher bar to toggle between Portfolio Projects and Curated Lookbook */}
      <div className="absolute top-4 left-6 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-mono">
        <button
          type="button"
          onClick={() => setViewMode("portfolio")}
          className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
            viewMode === "portfolio" ? "bg-white text-black font-semibold" : "text-white/60 hover:text-white"
          }`}
        >
          Rahul's Projects ({PORTFOLIO_PROJECTS.length})
        </button>
        <button
          type="button"
          onClick={() => setViewMode("curated")}
          className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
            viewMode === "curated" ? "bg-white text-black font-semibold" : "text-white/60 hover:text-white"
          }`}
        >
          Curated Looks ({ORIGINAL_LOOKS.length})
        </button>
      </div>

      <HeroCarousel
        items={viewMode === "portfolio" ? PORTFOLIO_PROJECTS : ORIGINAL_LOOKS}
        defaultIndex={0}
        brand="RAHUL ACHARI"
        onBack={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        onMenu={() => {}}
        autoplay={false}
      />
    </div>
  )
}
