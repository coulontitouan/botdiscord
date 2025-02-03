FROM node:latest

RUN apt-get update && apt-get install -y \
    openssh-server \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir /var/run/sshd

RUN echo 'root:password' | chpasswd
RUN passwd -d root
RUN echo "PermitEmptyPasswords yes" >> /etc/ssh/sshd_config
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config

WORKDIR /app

COPY package*.json ./
COPY . .

RUN npm install

EXPOSE 2222

CMD service ssh start && npm run start