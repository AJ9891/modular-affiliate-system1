import { RocketHero } from "./heroes/RocketHero";
import { AntiGuruHero } from "./heroes/AntiGuruHero";
import { MeltdownHero } from "./heroes/MeltdownHero";
import {
  RocketProblem,
  AntiGuruProblem,
  MeltdownProblem,
} from "./steps/problem";

export const STEP_COMPONENTS = {
  hero: {
    rocket: RocketHero,
    antiguru: AntiGuruHero,
    meltdown: MeltdownHero,
  },
  problem: {
    rocket: RocketProblem,
    antiguru: AntiGuruProblem,
    meltdown: MeltdownProblem,
  },
  mechanism: {
    rocket: () => <div>Rocket Mechanism</div>,
    antiguru: () => <div>Anti-Guru Mechanism</div>,
    meltdown: () => <div>AI Explains the System (Reluctantly)</div>,
  },
  credibility: {
    rocket: () => <div>Logos & Proof</div>,
    antiguru: () => <div>No Fake Testimonials</div>,
    meltdown: () => <div>AI Simulations & Math</div>,
  },
  cta: {
    rocket: () => <div>Launch Now</div>,
    antiguru: () => <div>Fine. Show Me.</div>,
    meltdown: () => <div>Click It. Please Stop Asking.</div>,
  },
  footer: {
    rocket: () => <div>Footer</div>,
    antiguru: () => <div>Legal + Honesty</div>,
    meltdown: () => <div>AI Disclaimer</div>,
  },
};
