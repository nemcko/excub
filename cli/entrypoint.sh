#!/bin/bash

echo '{"instname":"'$EVN_INSTANCE_NAME'","apiUri":"'$EVN_INSTANCE_URL'"}' > /usr/share/nginx/html/cfg.json
nginx -g "daemon off;"