FROM node:latest

RUN apt-get update
RUN apt-get install -y  build-essential \
                        libcairo2-dev \
                        libpango1.0-dev \
                        libjpeg-dev \
                        libgif-dev \
                        librsvg2-dev
RUN rm -rf /var/lib/apt/lists/*

WORKDIR /bot
COPY package*.json ./
RUN npm install
COPY . .

CMD ["npm", "run", "start"]