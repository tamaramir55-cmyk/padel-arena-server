# Padel Arena Server (Nest + Prisma)

Quick start instructions (PowerShell):

# Install

npm install

# Generate Prisma client

npx prisma generate

# Run migration (SQLite example)

npx prisma migrate dev --name init

# Start dev server

npm run dev

Notes:

- Edit .env to change DATABASE_URL
- For production, build with `npm run build` and run `npm start`
