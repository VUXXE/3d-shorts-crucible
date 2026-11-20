# 3d-shorts (Powered by Crucible Engine)

An AI agent skill and rendering kit to generate vertical (9:16) animated cartoon shorts from voiceover audio.

Built on the **[Crucible 3D Engine](https://github.com/VUXXE/crucible)** (forked from [codepawl/crucible](https://github.com/codepawl/crucible)), replacing legacy browser-automated setups with high-performance headless rendering, native line-art edge detection, toon shading, and depth-of-field.

---

## Key Highlights

- **Vertical 9:16 Format**: Designed specifically for TikTok, YouTube Shorts, and Instagram Reels (1080x1920, 30 fps).
- **Crucible 3D Architecture**: Uses Crucible declarative scene recipes and render pipelines instead of raw Three.js browser loops.
- **Native Toon & Line-Art Shaders**: Built-in edge detection (ID, normal, and depth guides) without needing custom GLSL passes.
- **Audio-Synced Timing**: Aligns character animation and camera actions directly to speech pauses and timestamps.
- **Automated Sound Mix**: Generates synchronized music stems and SFX, automatically balanced against the voice track at 50% RMS.

---

## Directory Structure

```text
3d-shorts/
├── SKILL.md                 # Agent skill instructions and workflow definition
├── README.md                # Project documentation
├── .gitignore               # Ignored build and media files
└── kit/
    ├── README.md            # Kit technical summary
    ├── engine/              # Engine components, shaders, and painters
    │   ├── crucible-scene.js# Crucible recipe builder & scene adapter
    │   ├── motion.js        # Camera interpolation and animation helpers
    │   ├── paint.js         # Canvas texture generators
    │   └── roman.js         # Character card rendering routines
    ├── example/             # Reference implementation
    │   └── soldier/         # Example story setup and audio cue table
    ├── tools/               # Command-line build and rendering scripts
    │   ├── finish.sh        # Video encoding and loudness QA
    │   ├── render-crucible.mjs # Headless Crucible frame renderer
    │   ├── setup.sh         # Project initialisation helper
    │   ├── sheet.py         # Contact sheet generator
    │   └── timing.py        # Voiceover alignment and phrase timing
    └── vendor/
        └── toon.ts          # Pen & character drawing library
```

---

## Prerequisites

- **Node.js**: >= 22.6 (with native TypeScript type stripping)
- **Crucible**: `@codepawlhq/crucible` / [VUXXE/crucible](https://github.com/VUXXE/crucible)
- **Python**: 3.9+ with `numpy` and `Pillow`
- **FFmpeg**: for audio/video assembly and encoding

---

## Quick Start

1. Initialize a new project directory using the setup script:
   ```bash
   bash kit/tools/setup.sh ~/shorts/my-first-short
   cd ~/shorts/my-first-short
   ```

2. Place your voiceover file (`voice.mp3`) and narration script (`script.txt`) in the project directory, then generate phrase timings:
   ```bash
   python3 timing.py voice.mp3 script.txt --out work
   ```

3. Configure your shot list, cameras, and character poses in `web/story.js` and audio cues in `audio.py`.

4. Generate a contact sheet to verify visual staging:
   ```bash
   node render-crucible.mjs stills "10,50,100,150"
   python3 sheet.py stills stills/sheet.jpg
   ```

5. Render all frames and compile the final short:
   ```bash
   node render-crucible.mjs frames "0-591"
   bash finish.sh "My First Short"
   ```

Output video will be saved in `out/`.

---

## Upstream & Credits

- 3D Engine: **[VUXXE/crucible](https://github.com/VUXXE/crucible)** (Upstream: [codepawl/crucible](https://github.com/codepawl/crucible), MIT License)
- 2D Character Pen system: [mromidev/claude-animated-shorts](https://github.com/mromidev/claude-animated-shorts) (MIT License)
