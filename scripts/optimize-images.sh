#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/web/public"
ICON_SRC="${1:-$ROOT/../.cursor/projects/Users-earth-Downloads-Tron-Light-Cycles/assets/app-icon-source.png}"
THUMB_SRC="${2:-$ROOT/../.cursor/projects/Users-earth-Downloads-Tron-Light-Cycles/assets/app-thumbnail-source.png}"

mkdir -p "$OUT"

# Icon: square crop on short side, then 1024x1024 JPEG
W=$(sips -g pixelWidth "$ICON_SRC" | tail -1 | awk '{print $2}')
H=$(sips -g pixelHeight "$ICON_SRC" | tail -1 | awk '{print $2}')
S=$(( W < H ? W : H ))
sips --cropToHeightWidth "$S" "$S" "$ICON_SRC" --out "$OUT/app-icon-tmp.png"
sips -z 1024 1024 "$OUT/app-icon-tmp.png" --out "$OUT/app-icon-tmp2.png"
sips -s format jpeg -s formatOptions 85 "$OUT/app-icon-tmp2.png" --out "$OUT/app-icon.jpg"

# Thumbnail: center crop to 1.91:1, then 1200x628 JPEG
W=$(sips -g pixelWidth "$THUMB_SRC" | tail -1 | awk '{print $2}')
H=$(sips -g pixelHeight "$THUMB_SRC" | tail -1 | awk '{print $2}')
CROP_H=$H
CROP_W=$(echo "$H * 1200 / 628" | bc)
if [ "$CROP_W" -gt "$W" ]; then
  CROP_W=$W
  CROP_H=$(echo "$W * 628 / 1200" | bc)
fi
sips --cropToHeightWidth "$CROP_H" "$CROP_W" "$THUMB_SRC" --out "$OUT/thumb-tmp.png"
sips -z 628 1200 "$OUT/thumb-tmp.png" --out "$OUT/thumb-tmp2.png"
sips -s format jpeg -s formatOptions 82 "$OUT/thumb-tmp2.png" --out "$OUT/app-thumbnail.jpg"

rm -f "$OUT/app-icon-tmp.png" "$OUT/app-icon-tmp2.png" "$OUT/thumb-tmp.png" "$OUT/thumb-tmp2.png"

echo "Icon:" && sips -g pixelWidth -g pixelHeight "$OUT/app-icon.jpg"
echo "Thumbnail:" && sips -g pixelWidth -g pixelHeight "$OUT/app-thumbnail.jpg"
ls -la "$OUT"/*.jpg
