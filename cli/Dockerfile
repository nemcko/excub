FROM nginx
COPY /dist/ /usr/share/nginx/html
COPY /entrypoint.sh /
COPY /nginx.conf /etc/nginx/nginx.conf

VOLUME /usr/share/nginx/html
VOLUME /etc/nginx
EXPOSE 80

RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]