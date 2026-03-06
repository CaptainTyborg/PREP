## Packages
zustand | State management for the CBT exam session (handles time, answers, subject navigation seamlessly)
framer-motion | Smooth layout animations, page transitions, and micro-interactions
recharts | Beautiful data visualization for the user dashboard and progress charts
canvas-confetti | Celebration effects when completing an exam
@types/canvas-confetti | Types for canvas-confetti
mathjs | Robust mathematical evaluation for the in-exam scientific calculator

## Notes
- Wouter is used for routing. Links are correctly rendered directly without nested `<a>` tags.
- Exam state is managed via Zustand and persisted to localStorage so accidental refreshes don't lose exam progress.
- API requests use the shared Zod schemas from `@shared/routes` and are mapped to TanStack Query hooks.
- Mock authentication relies on `/api/users/login` with just an email.
- The UI defaults to a Nigerian-inspired deep green and gold dark mode theme.
