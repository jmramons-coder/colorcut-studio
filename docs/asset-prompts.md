# ColorCut Asset Prompts

## Free Animal Baseline

Use this prompt family for new free animal puzzle assets so they stay aligned with the original red panda, sea turtle, tiger, and deer set.

```text
Create one full-body animal character for ColorCut, a kids puzzle-coloring app.

Subject:
- Animal: <animal name>
- Friendly, expressive, child-safe pose.
- Big warm eyes, simple readable face, clear silhouette.
- Full body visible with generous padding around the subject.

Style:
- Premium 2D hand-painted sticker illustration.
- Soft watercolor and gouache texture with visible brush grain.
- Light inked detail lines and crisp readable edges.
- Playful, polished, warm, and tactile.
- Match the original ColorCut animals: red panda, sea turtle, tiger, deer.

Color and texture:
- Rich natural colors with a few tasteful accent colors when appropriate.
- Interesting internal texture and pattern, but not noisy.
- Slight storybook feel, not flat vector.

Avoid:
- No 3D render, no plush toy, no glossy plastic, no photorealism.
- No heavy black cartoon outline.
- No props unless requested.
- No text, watermark, shadow, floor, background scene, or frame.

Background for removal:
- Place the animal on a perfectly flat solid #ff00ff chroma-key background.
- The background must be one uniform color with no shadows, gradients, texture, floor, or lighting variation.
- Do not use #ff00ff anywhere in the animal.
```

Post-process with chroma-key removal, resize onto a transparent 980x980 canvas, and export WebP with alpha.
