#!/usr/bin/env bash
# wordcount.sh — per-file word counts for the plugin's core markdown, with delta vs evals/wc-baseline.tsv.
# Usage: evals/wordcount.sh            (table of changed files + totals)
#        evals/wordcount.sh --all      (every file)
#        evals/wordcount.sh --snapshot (rewrite the baseline — only when re-baselining on purpose)
set -euo pipefail
cd "$(dirname "$0")/.."
BASE=evals/wc-baseline.tsv
now() { git ls-files skills commands agents references docs CLAUDE.md README.md | grep '\.md$' | sort | while read -r f; do printf '%s\t%s\n' "$(wc -w < "$f" | tr -d ' ')" "$f"; done; }
if [[ "${1:-}" == "--snapshot" ]]; then now > "$BASE"; echo "baseline written: $BASE"; exit 0; fi
TMP=$(mktemp); now > "$TMP"
printf '%8s %8s %7s  %s\n' before after delta file
join -t $'\t' -1 2 -2 2 -a 1 -a 2 -e 0 -o '0,1.1,2.1' <(sort -t $'\t' -k2 "$BASE") <(sort -t $'\t' -k2 "$TMP") \
 | awk -F'\t' -v all="${1:-}" '{d=$3-$2; b+=$2; a+=$3; if (all=="--all" || d!=0) printf "%8d %8d %+7d  %s\n", $2, $3, d, $1} END{printf "%8d %8d %+7d  TOTAL (%.1f%%)\n", b, a, a-b, (a-b)*100/b}'
rm -f "$TMP"
