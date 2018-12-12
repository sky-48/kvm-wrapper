FROM python:3.7

RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get install -y aria2 && \
    pip install --upgrade pip && \
    pip install caterpillar-hls && \
    pip install KVM48 && \
    curl -sL https://deb.nodesource.com/setup_8.x | bash - && \
    apt-get install -y nodejs

WORKDIR /home

COPY package*.json /home/
RUN npm install

COPY config.yml /root/.config/kvm48/config.yml
RUN mkdir -p /home/PERSISTENT_STORAGE && \
    mkdir -p /home/PERSISTENT_STORAGE/downloads && \
    touch /home/PERSISTENT_STORAGE/downloads/test.txt

COPY src src
EXPOSE 8048
CMD node src/server.js

# docker run -v /host/path/PERSISTENT_STORAGE:/home/PERSISTENT_STORAGE -p 8048:8048 <image-name>