#!/bin/bash
# Upload all tracks to Supabase Storage and insert metadata
SB_URL="https://rcpvlkanqwoayajqlytj.supabase.co"
SB_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjcHZsa2FucXdvYXlhanFseXRqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjk1NjgwNiwiZXhwIjoyMDg4NTMyODA2fQ.YeAGXnSFxrAmnsS7yRiNFHTdaqOMS1AtEUqsRefOOZk"
BUCKET="catalog-audio"
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

uploaded=0
failed=0

upload_track() {
  local file_path="$1"
  local storage_path="$2"

  local http_code
  http_code=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$SB_URL/storage/v1/object/$BUCKET/$storage_path" \
    -H "apikey: $SB_KEY" \
    -H "Authorization: Bearer $SB_KEY" \
    -H "Content-Type: audio/mpeg" \
    -H "x-upsert: true" \
    --data-binary "@$file_path")

  echo "$http_code"
}

echo "=== Uploading tracks to Supabase Storage ==="
echo ""

# Find all mp3 files
for mp3 in "$BASE_DIR"/jazz/*.mp3 "$BASE_DIR"/lofi/*.mp3 "$BASE_DIR"/ambient/*.mp3 "$BASE_DIR"/electronica/*.mp3 "$BASE_DIR"/latin/*.mp3 "$BASE_DIR"/funk/*.mp3 "$BASE_DIR"/world/*.mp3 "$BASE_DIR"/acoustic/*.mp3 "$BASE_DIR"/pop/*.mp3 "$BASE_DIR"/indie/*.mp3 "$BASE_DIR"/blues/*.mp3; do
  [ -f "$mp3" ] || continue

  # Get relative path from BASE_DIR
  rel_path="${mp3#$BASE_DIR/}"
  genre_dir=$(dirname "$rel_path")
  filename=$(basename "$rel_path")
  storage_path="tracks/$genre_dir/$filename"

  printf "  %-40s → " "$filename"

  code=$(upload_track "$mp3" "$storage_path")

  if [ "$code" = "200" ] || [ "$code" = "201" ]; then
    echo "OK ($code)"
    uploaded=$((uploaded + 1))
  else
    echo "FAIL ($code)"
    failed=$((failed + 1))
  fi
done

echo ""
echo "=== Storage upload done: $uploaded OK, $failed failed ==="
