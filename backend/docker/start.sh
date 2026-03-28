#!/bin/sh
set -eu

node scripts/migrate.js
node scripts/seed-admin.js
node src/server.js
