FROM nginx

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update \
  && apt-get install --assume-yes --no-install-recommends ca-certificates curl git \
  && curl -sL https://deb.nodesource.com/setup_12.x | bash - \
  && curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
  && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
  && apt-get update \
  && apt-get install --assume-yes --no-install-recommends nodejs yarn \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN rm -f /var/log/nginx/access.log /var/log/nginx/error.log

WORKDIR /app

RUN npm install -g foreman

COPY package.json yarn.lock /app/
RUN yarn install
COPY . /app
RUN npm run release-build

ADD nginx-sites.conf /etc/nginx/conf.d/default.conf

CMD ["nf", "start"]
