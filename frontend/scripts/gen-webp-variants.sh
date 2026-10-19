#!/usr/bin/env bash
# Generate the missing WebP ladder for images srcSet() serves.
#
# Why: src/lib/types.ts srcSet() used to hard-code 400/800/1200/1600 for every
# image, but most sources only had 400/800/1200. On a wide/high-DPR viewport the
# browser picks the 1600w candidate, which does not exist, and the SPA fallback
# answers with index.html (200 text/html) — so the photo silently renders blank.
#
# This generates every rung up to the source's own width (never upscaling) so the
# browser's choice always resolves. Idempotent: existing files are left alone.
set -uo pipefail

IMG_DIR="$(cd "$(dirname "$0")/../public/images" && pwd)"
SIZES=(400 800 1200 1600)
made=0
skipped=0

# partners/ is served by webpLogo() (slugified -400 only) — not part of the srcSet ladder
while IFS= read -r -d '' src; do
  rel="${src#"$IMG_DIR"/}"
  case "$rel" in webp/*|partners/*) continue ;; esac
  stem="${rel%.*}"
  srcw=$(identify -format "%w" "$src" 2>/dev/null) || continue
  [ -z "$srcw" ] && continue
  for s in "${SIZES[@]}"; do
    # never upscale: a rung wider than the source would only blur
    [ "$s" -gt "$srcw" ] && continue
    out="$IMG_DIR/webp/${stem}-${s}.webp"
    if [ -f "$out" ]; then skipped=$((skipped+1)); continue; fi
    mkdir -p "$(dirname "$out")"
    if magick "$src" -resize "${s}x${s}>" -strip -quality 82 "$out" 2>/dev/null; then
      made=$((made+1))
      echo "  + webp/${stem}-${s}.webp   (from ${srcw}px source)"
    else
      echo "  ! FAILED webp/${stem}-${s}.webp" >&2
    fi
  done
done < <(find "$IMG_DIR" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) -print0)

echo
echo "generated: $made    already present: $skipped"
