# BIFA Web Deployment (htown)

## Live URL
- https://h-town.duckdns.org/bifa/

## Current deployment layout
- Host alias: `htown` (from `~/.ssh/config`)
- Nginx active vhost: `/etc/nginx/conf.d/000-h-town-force.conf`
- Served path for this app: `/bifa/`
- Server filesystem target: `/var/www/h-town-duckdns/bifa/`

## Deploy procedure (manual)

1) Build locally
```bash
cd /home/kevin/.hermes/hermes-agent/bifa-reboot-migration-web-prototype
npm run build
```

2) Upload build to server staging
```bash
ssh htown 'mkdir -p ~/deploy/bifa'
scp -r dist/* htown:~/deploy/bifa/
```

3) Publish to Nginx web root
```bash
ssh htown 'sudo -n mkdir -p /var/www/h-town-duckdns/bifa && sudo -n rsync -a --delete ~/deploy/bifa/ /var/www/h-town-duckdns/bifa/'
```

4) Verify
```bash
curl -I https://h-town.duckdns.org/bifa/
```
Expected: `HTTP/1.1 200 OK`

## Notes
- Old references to `/var/www/bifa` and default nginx site are obsolete for this target.
- The `/bifa/` location already exists in `000-h-town-force.conf` and points to `/var/www/h-town-duckdns/bifa/`.
