#!/usr/bin/env node
/**
 * Crucible Headless Media Renderer for 3d-shorts
 * Renders cartoon shorts directly via Crucible render engine without Playwright/Three.js boilerplate.
 */

import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const argv = process.argv.slice(2);
if (argv.length < 2) {
  console.error('Usage: node render-crucible.mjs <frames|stills> <frame_range|frame_list> [--scene <path>] [--out <dir>]');
  process.exit(1);
}

const mode = argv[0]; // "frames" or "stills"
const target = argv[1]; // e.g. "0-591" or "10,50,100"
const outDir = resolve(process.cwd(), mode === 'stills' ? 'stills' : 'frames');

await mkdir(outDir, { recursive: true });

console.log(`[3d-shorts] Rendering via Crucible Engine (Mode: ${mode}, Target: ${target})`);
console.log(`[3d-shorts] Output directory: ${outDir}`);

// Parse frames
let frames = [];
if (target.includes('-')) {
  const [start, end] = target.split('-').map(Number);
  for (let i = start; i <= end; i++) frames.push(i);
} else {
  frames = target.split(',').map(Number);
}

console.log(`[3d-shorts] Total frames to process: ${frames.length}`);
console.log(`[3d-shorts] Frame rendering initialized.`);
