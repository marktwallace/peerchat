#!/bin/bash
find . \( -name "*.js" -o -name "*.ts" \) -type f -not -path "*/node_modules/*" -not -path "*/dist/*" | xargs wc -l
