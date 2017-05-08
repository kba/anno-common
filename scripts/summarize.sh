#!/bin/bash

for pkg in $(git ls-files|sed 's,/.*,,'|grep anno-|sort -u);do
    summary=$(grep '^>' "$pkg/README.md"|head -n1|sed 's/^>\s*//')
    echo "- [$pkg](./$pkg): $summary"
done
