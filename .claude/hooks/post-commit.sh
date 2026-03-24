#!/usr/bin/env bash
# ruflo post-commit analysis — runs automatically after every git commit
# Checks complexity and flags regressions

PROJECT="/Users/mikel/PycharmProjects/Gefuehle-Memory"

echo ""
echo "┌─────────────────────────────────────────┐"
echo "│  ruflo — post-commit analysis           │"
echo "└─────────────────────────────────────────┘"

cd "$PROJECT" || exit 0

# Complexity check (only JS source files, threshold 50 to flag real problems)
echo ""
echo "▸ Complexity check (threshold: 50)"
npx ruflo@latest analyze complexity js/ --threshold 50 2>&1 | grep -v "^\[INFO\]" | grep -v "^$" || true

# Circular dependency check
echo ""
echo "▸ Circular dependency check"
npx ruflo@latest analyze circular js/ 2>&1 | grep -v "^\[INFO\]" | tail -1 || true

echo ""
