"use client"

import * as React from "react"
import {
  HeroCarousel,
  type HeroCarouselItem,
} from "./hero-carousel"

export const PORTFOLIO_PROJECTS: HeroCarouselItem[] = [
  {
    id: "propcast",
    title: "PropCast",
    image: "assets/images/propcast.jpg",
    accent: "#2563eb",
    meta: ["PYTHON", "DJANGO", "GRADIENT BOOSTING"],
    description:
      "Predictive machine learning real estate valuation engine achieving 92% R² accuracy. Integrated with Groq LLaMA for natural language market analysis, interactive Plotly visualization dashboards, and multi-parameter property comparison tools.",
    tags: ["Python", "Scikit-Learn", "Groq LLaMA", "Docker"],
    liveUrl: "https://propcast-oyan.onrender.com/",
    githubUrl: "https://github.com/rahulachari/PropCast",
  },
  {
    id: "akshara",
    title: "Akshara",
    image: "assets/images/Akshara.jpg",
    accent: "#059669",
    meta: ["REACT", "TYPESCRIPT", "TAILWIND"],
    description:
      "Architectural plotted land development and masterplanning platform featuring subterranean infrastructure grids, wide asphalt avenues, DTCP and RERA compliance documentation, and interactive spatial layout mapping.",
    tags: ["React", "TypeScript", "Tailwind CSS", "Architecture"],
    liveUrl: "https://akshara-three.vercel.app/",
    githubUrl: "https://github.com/rahulachari/Akshara",
  },
  {
    id: "controld",
    title: "Control-D",
    image: "assets/images/ContoL-D.jpg",
    accent: "#dc2626",
    meta: ["CNN", "TRANSFORMERS", "SUPABASE"],
    description:
      "Unified digital health assistant powered by Convolutional Neural Networks and Transformers. Dynamically optimizes nutrition and clinical workout protocols based on biometric indicators, real-time glucose metrics, and BMI tracking.",
    tags: ["React", "TypeScript", "Supabase", "Transformers"],
    liveUrl: "https://controld-three.vercel.app/",
    githubUrl: "https://github.com/rahulachari/control-d",
  },
  {
    id: "uniml",
    title: "UniML",
    image: "assets/images/UnimL.jpg",
    accent: "#7c3aed",
    meta: ["FLASK", "RANDOM FOREST", "TESSERACT"],
    description:
      "Enterprise ATS resume parsing and automated applicant evaluation engine. Uses OpenCV and Tesseract OCR for dense optical text extraction paired with Random Forest scoring across Banking, Education, and Healthcare candidate profiles.",
    tags: ["Flask", "OpenCV", "Tesseract OCR", "SQLite"],
    liveUrl: "https://uniml.onrender.com/",
    githubUrl: "https://github.com/rahulachari/UniML",
  },
  {
    id: "gscms",
    title: "GSCMS",
    image: "assets/images/GSCMS.jpg",
    accent: "#d97706",
    meta: ["NEXT.JS", "POSTGRESQL", "SUPABASE"],
    description:
      "Production atelier customer and inventory management platform featuring custom jewellery order lifecycle tracking, real-time gold/silver purity bullion calculations, automated GST invoicing, and customer accounting ledgers.",
    tags: ["Next.js", "PostgreSQL", "Supabase", "Tailwind CSS"],
    liveUrl: "https://gscms.vercel.app/",
    githubUrl: "https://github.com/rahulachari/GSCMS",
  },
  {
    id: "voiceos",
    title: "VoiceOS",
    image: "assets/images/VoiceOS.jpg",
    accent: "#0891b2",
    meta: ["WHISPER", "GROQ LLAMA", "KOKORO TTS"],
    description:
      "Autonomous conversational AI voice agent engineered with ultra-low latency speech-to-speech processing, real-time intent recognition, Groq LLaMA reasoning, and seamless function calling for hands-free task automation.",
    tags: ["Python", "Fastify", "Whisper", "WebSockets"],
    githubUrl: "https://github.com/rahulachari/MAXI_VOICE-AGENT",
  },
  {
    id: "adhikar",
    title: "Adhikar",
    image: "assets/images/Adhikar.jpg",
    accent: "#db2777",
    meta: ["PYTHON", "NLP", "OCR"],
    description:
      "AI-powered land document intelligence platform designed to extract, analyze, and verify legal deeds and land records effortlessly using machine learning models and OCR analysis.",
    tags: ["Python", "Document AI", "OCR", "Vercel"],
    liveUrl: "https://adhikar-azure.vercel.app/",
    githubUrl: "https://github.com/rahulachari/Adhikar-LandDocAI-",
  },
  {
    id: "precast",
    title: "Precast Walls",
    image: "assets/images/precast walls.jpg",
    accent: "#0d9488",
    meta: ["CANVAS 3D", "OPENCV", "NETLIFY"],
    description:
      "Computer vision structural defect inspection and 3D precast wall construction simulator with interactive real-time cost estimation and concrete fracture detection.",
    tags: ["HTML5", "CSS3", "JavaScript", "Canvas API"],
    liveUrl: "https://glittery-selkie-dcfb25.netlify.app/",
    githubUrl: "https://github.com/rahulachari/Precast-Wall-Crack-Detection",
  },
  {
    id: "beatsync",
    title: "Beat Sync",
    image: "assets/images/Beat-sync.jpg",
    accent: "#4f46e5",
    meta: ["NETWORKING", "SUB-MS LATENCY", "PYTHON"],
    description:
      "Sub-millisecond multi-device acoustic synchronization system streaming multi-speaker distributed audio playback seamlessly over local peer networks.",
    tags: ["Python", "Networking", "Audio Sync"],
    githubUrl: "https://github.com/rahulachari/Beat-sync-",
  },
  {
    id: "reminderremix",
    title: "Reminder Remix",
    image: "assets/images/reminder remix.jpg",
    accent: "#e11d48",
    meta: ["PYTHON", "OPENCV", "AUTOMATION"],
    description:
      "Context-aware desktop automation assistant with OpenCV visual trigger detection, smart notification queueing, and reactive workspace alerts.",
    tags: ["Python", "OpenCV", "Pygame"],
    githubUrl: "https://github.com/rahulachari/Reminder-Remix",
  },
]

export default function HeroCarouselProjectsDemo() {
  return (
    <div className="relative h-screen w-full bg-black">
      <HeroCarousel
        items={PORTFOLIO_PROJECTS}
        defaultIndex={0}
        brand="FEATURED WORK"
      />
    </div>
  )
}
