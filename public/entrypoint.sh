#!/bin/sh

# 遍历 HTML 文件并替换占位符
for file in /usr/share/nginx/html/*.html
do
  sed -i "s|APP_PUBLIC_KEY_PLACEHOLDER|${APP_PUBLIC_KEY}|g" $file
  sed -i "s|APP_PRIVATE_KEY_PLACEHOLDER|${APP_PRIVATE_KEY}|g" $file
  sed -i "s|APP_SHOW_CONSOLE_PLACEHOLDER|${APP_SHOW_CONSOLE}|g" $file
  sed -i "s|APP_WEB_SOCKET_URL_PLACEHOLDER|${APP_WEB_SOCKET_URL}|g" $file
done

# 启动 nginx
exec nginx -g 'daemon off;'
# CMD ["nginx","-g","daemon off;"]
