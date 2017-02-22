FROM nginx

RUN apt-get update \
  && apt-get install --assume-yes --no-install-recommends curl git \
  && curl -sL https://deb.nodesource.com/setup_7.x | bash - \
  && curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
  && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
  && apt-get update \
  && apt-get install --assume-yes --no-install-recommends nodejs yarn \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN rm -f /var/log/nginx/access.log /var/log/nginx/error.log

WORKDIR /app

COPY package.json /app/
RUN yarn install
COPY . /app
RUN npm run release-build

ADD nginx-sites.conf /etc/nginx/conf.d/default.conf

CMD ["npm", "run", "docker"]
