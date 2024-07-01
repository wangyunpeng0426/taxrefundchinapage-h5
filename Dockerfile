# author liuxuefengb
# The Dockerfile use from nginx container build.
FROM nginx:stable-alpine3.17-slim
ARG TAG
ENV APP_TAG=$TAG
ADD ./dist /usr/share/nginx/html
ADD ./default.conf /etc/nginx/conf.d
COPY ./dist/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 80
EXPOSE 443
STOPSIGNAL SIGTERM
# CMD ["nginx","-g","daemon off;"]

CMD ["/entrypoint.sh"]