# LIVE DEPLOY STATUS — BIFA Web Prototype

## Status
- Live: YES
- Public URL: https://h-town.duckdns.org/bifa/
- Last verified HTTP status: 200

## Runtime routing
- Nginx config: `/etc/nginx/conf.d/000-h-town-force.conf`
- Route:
  - `/bifa` -> 301 to `/bifa/`
  - `/bifa/` -> alias `/var/www/h-town-duckdns/bifa/`

## Current release artifact
- `dist/index.html`
- `dist/assets/index-BFtVJ9ys.js`
- `dist/assets/index-HVGNezqL.css`

## Fast redeploy
```bash
cd /home/kevin/.hermes/hermes-agent/bifa-reboot-migration-web-prototype
npm run build
ssh htown 'mkdir -p ~/deploy/bifa'
scp -r dist/* htown:~/deploy/bifa/
ssh htown 'sudo -n rsync -a --delete ~/deploy/bifa/ /var/www/h-town-duckdns/bifa/'
curl -I https://h-town.duckdns.org/bifa/
```

## Important
- If the URL returns non-200, first re-sync `/var/www/h-town-duckdns/bifa/`, then check nginx health on server:
```bash
ssh htown 'sudo -n nginx -t && sudo -n systemctl status nginx --no-pager -l | head -n 40'
```
