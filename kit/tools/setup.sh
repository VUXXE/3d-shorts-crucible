#!/usr/bin/env bash
# Creates a new short project:  bash tools/setup.sh <project_dir>
# Uses Crucible engine (@codepawlhq/crucible) for headless rendering, line-art toon shading, and compositing.
# Needs: node >= 22.6, python3 + numpy + Pillow, ffmpeg.
set -e
KIT="$(cd "$(dirname "$0")/.." && pwd)"; P="${1:?project dir}"
mkdir -p "$P/web/lib" "$P/work" "$P/stills" "$P/out" "$P/scenes"
cp "$KIT"/engine/*.js "$KIT"/engine/index.html "$P/web/" 2>/dev/null || true
cp "$KIT"/example/soldier/story.js "$P/web/story.js"        # starting point: rewrite for the new story
cp "$KIT"/example/soldier/audio.py "$P/audio.py"            # starting point: rewrite the cue table
cp "$KIT"/tools/*.mjs "$KIT"/tools/*.py "$KIT"/tools/*.sh "$P/" 2>/dev/null || true

# toon base: the Pen / head / face library from mromidev/claude-animated-shorts, types stripped
if [ ! -f "$KIT/vendor/toon.ts" ]; then
  mkdir -p "$KIT/vendor"
  git clone -q --depth 1 https://github.com/mromidev/claude-animated-shorts /tmp/_cas && cp /tmp/_cas/templates/bridge/toon.ts "$KIT/vendor/toon.ts"
fi
node -e "const m=require('node:module'),fs=require('fs');fs.writeFileSync('$P/web/toonbase.js',m.stripTypeScriptTypes(fs.readFileSync('$KIT/vendor/toon.ts','utf8'),{mode:'transform'}))" 2>/dev/null
cat "$P/web/toonbase.js" "$P/web/roman.js" > "$P/web/toon.js"

# Link Crucible engine runner
echo "Crucible Engine integrated: $P"
echo "Ready: $P (Use render-crucible.mjs or render.mjs for frame generation)"
