FROM nginx:1.10

RUN apt-get update \
  && apt-get install --assume-yes --no-install-recommends curl git \
  && curl -sL https://deb.nodesource.com/setup_7.x | bash - \
  && apt-get install --assume-yes --no-install-recommends nodejs \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN rm -f /var/log/nginx/access.log /var/log/nginx/error.log

WORKDIR /app

COPY package.json /app/
RUN npm install
COPY . /app
RUN npm run release-build

ADD nginx-sites.conf /etc/nginx/conf.d/default.conf

CMD ["npm", "run", "docker"]
