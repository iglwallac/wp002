FROM node:14.16.1 as builder

# WORKDIR /usr/src/app
# COPY package.json ./

WORKDIR /usr/src/app 
COPY . ./

RUN rm -rf tap  && mkdir -p /webapp tap && chown node /webapp tap

ENV NODE_ENV production \
    NODE_PATH ./node_modules/:./lib/:./lib/web-app/ \
    NODE_CONFIG_ENV test 

# # RUN npm i  --only=production && \
# RUN npm i --legacy-peer-dep && \
#     npm run test-tap > tap/test.tap && \
#     npm run build && \
#     npm run build-webpack

RUN npm i --legacy-peer-dep
RUN npm run build

FROM nginx:latest
WORKDIR /webapp
COPY --from=builder /usr/src/app/dist/server/ ./ 
COPY --from=builder /usr/src/app/dist/browser/ ./

RUN /bin/ls -lFa
EXPOSE 8080
USER nodejs
CMD ["node", "."]
