#!/usr/bin/env bash
# dispatch-load.sh — words a representative two-skill BUILD dispatch loads: build-agent + § FULL_BUILD template
# + each skill's SKILL.md + every file those Read() (transitively, one level). Skills default to the pair the
# lighten brief measured; pass others as args.
set -euo pipefail
cd "$(dirname "$0")/.."
skills=("${@:-cc-defensive-programming}"); [[ $# -eq 0 ]] && skills=(cc-defensive-programming cc-routine-and-class-design)
total=0; seen=" "
add() { case "$seen" in *" $1 "*) printf '%6d  %s (already counted)\n' 0 "$1"; return;; esac; seen="$seen$1 "; local w; w=$(wc -w < "$1" | tr -d ' '); printf '%6d  %s\n' "$w" "$1"; total=$((total + w)); }
add agents/build-agent.md
awk '/^## § FULL_BUILD/{p=1} /^## § MINIMAL_BUILD/{p=0} p' references/dispatch-templates.md > /tmp/full_build.$$; printf '%6d  %s\n' "$(wc -w < /tmp/full_build.$$ | tr -d ' ')" "references/dispatch-templates.md (§ FULL_BUILD only)"; total=$((total + $(wc -w < /tmp/full_build.$$))); rm -f /tmp/full_build.$$
for s in "${skills[@]}"; do
  add "skills/$s/SKILL.md"
  while read -r f; do [[ -n "$f" && -f "$f" ]] && add "$f"; done < <(grep -oE 'Read\(\$\{CLAUDE_(PLUGIN_ROOT|SKILL_DIR)\}/[^)]+\)' "skills/$s/SKILL.md" | sed -E "s#Read\(\\$\{CLAUDE_PLUGIN_ROOT\}/##; s#Read\(\\$\{CLAUDE_SKILL_DIR\}/#skills/$s/#; s#\)\$##" | sort -u)
done
echo "------"; printf '%6d  TOTAL loaded words for BUILD dispatch with skills: %s\n' "$total" "${skills[*]}"
