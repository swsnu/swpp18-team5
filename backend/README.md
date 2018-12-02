# Moyobob Backend

## Using Docker Compose

```bash
$ sudo mkdir -p /srv/moyobob/backend/db
$ sudo nano /srv/moyobob/backend/env

REDIS_HOST=redis
REDIS_PORT=6379
DEBUG=True
ALLOWED_HOSTS=localhost

$ docker-compose run backend python manage.py migrate
$ docker-compose up -d
```
