#!/bin/bash
set -euo pipefail

ADDIN_ID="33ec7928-1204-5bb3-88e6-d778413e9234"

remove_from() {
  local target="$1"
  local candidate

  [[ -d "$target" ]] || return 0

  for candidate in "$target"/*.xml; do
    [[ -f "$candidate" ]] || continue

    if grep -Fq "$ADDIN_ID" "$candidate"; then
      rm -f "$candidate"
      printf '%s\n' "Removed: $candidate"
    fi
  done
}

remove_from "$HOME/Library/Containers/com.microsoft.Word/Data/Documents/wef"
remove_from "$HOME/Library/Containers/com.microsoft.Excel/Data/Documents/wef"
remove_from "$HOME/Library/Containers/com.microsoft.Powerpoint/Data/Documents/wef"

printf '%s\n' ""
printf '%s\n' "Braille Hub Office add-in manifests were removed for the current user."
printf '%s\n' "Restart Word, Excel, and PowerPoint."