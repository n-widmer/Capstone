# Beautify: design spec

**Date:** 2026-09-04
**Branch:** `beautify`
**Goal:** make campbellquinnwedding.com feel like a gorgeous, expensive wedding site while keeping every guest flow exactly as simple as it is today.

## Design read

Wedding invitation site for family and friends of all ages, mostly on phones. Editorial-romantic language. Dials: variance 6, motion 6, density 3.

## Decisions

- **Type:** Cormorant Garamond (existing brand font) for display and headings. Jost (light geometric sans) for body, labels, inputs and buttons so forms stay legible for older guests.
- **Palette:** the wedding's tulip colors, softened. Ivory base, one dusty slate-blue accent (also the text color), butter yellow only where the tulips and the countdown carry it. No raw Tailwind `sky-200` / `amber-200` slabs.
- **Hero photo:** stays black and white (Nick's call, 9/04). Rendered as a warm-toned monochrome with an ivory scrim, not a flat `grayscale(100%)` filter.
- **Motion:** framer-motion only (already installed). No GSAP. Tulips drift via `useScroll` motion values, not a raw scroll listener. Scroll reveals via `whileInView`. Everything honors `prefers-reduced-motion`.
- **Shared UI:** one `PageHeader`, `Card`, `Field`, `Button`, `Footer` set used by all eight guest pages so the site reads as one piece.
- **Nav:** floating pill, one line on desktop, full-screen staggered menu on mobile. Hidden admin link on the names stays.
- **Removed:** emoji headers, double borders and corner brackets, hard black shadows, `alert()` on RSVP submit (becomes inline confirmation).

## Untouched

Admin pages, every API route, the database, URL slugs, nav labels, form field names, middleware, tests.

## Pages in scope

Access, Home, RSVP, Menu, Registry, Photos, Things To Do, Lodging, Playlist.

## Ship path

Commits on `beautify`, PR to `main`, Nick merges, Vercel deploys. No Claude co-author on commits (HANDOFF.md rule).

## Follow-up for Tori

Only one photo of the couple exists. Four to six more (engagement shoot, candids) would lift the Home and Photos pages significantly.
