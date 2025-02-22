FROM node:18

WORKDIR /app

# Copy package files from root
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy backend files
COPY backend ./backend

WORKDIR /app/backend

EXPOSE 5000

CMD ["node", "src/server.js"]
