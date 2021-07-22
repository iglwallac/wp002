FROM node:14.16.1 as builder

# WORKDIR /usr/src/app
# COPY package.json ./

WORKDIR /usr/src/app 
COPY . ./

RUN rm -rf tap  && mkdir -p tap

ENV NODE_ENV production \
    NODE_PATH ./node_modules/:./lib/:./lib/web-app/ \
    NODE_CONFIG_ENV test 

# # RUN npm i  --only=production && \
# RUN npm i --legacy-peer-dep && \
#     npm run test-tap > tap/test.tap && \
#     npm run build && \
#     npm run build-webpack

RUN npm i --legacy-peer-dep
#####  THIS WORKS PERFECTLY __ MINIMAL FEEDBACK
#####RUN npm run build

# each phase of the 'build' script - broken down
RUN npm run build_prep 
RUN npm run build_install
# skipping the 'test' phases - lint-tap and test-tap
# # # RUN npm run lint-tap > tap/lint.tap 
# # # RUN npm run test-tap > tap/test.tap
# # RUN npm run build_all 
# # -- breaking the above out.
RUN npm run build_gulp
RUN npm run build_package

# the above calls this 
# RUN webpack --colors --mode=production; /bin/ls -lFa . ./dist ./dist/server/*

# FROM nginx:latest

WORKDIR /app
COPY --from=builder /usr/src/app/dist/server/ /app 
COPY --from=builder /usr/src/app/dist/browser/ /app
COPY  nginx.conf /etc/nginx 
COPY  server-default.conf /etc/nginx/conf.d/default.conf


RUN /bin/ls -lFa
EXPOSE 5000
CMD ["node", "."]
###  CMD ["node", "index.js"]
