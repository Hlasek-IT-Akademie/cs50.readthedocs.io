# `cs50/server`

`cs50/server` ist ein [Docker](../../docker) Abbild auf [Docker Hub](https://hub.docker.com/r/cs50/server/) mit dem Sie Websites (einfach!) mit optional in JavaScript, PHP, Python oder Ruby implementierten Backends bedienen können. (Wir verwenden es für CS50s eigene Apps auf [AWS Elastic Beanstalk](https://aws.amazon.com/elasticbeanstalk/)!) !) Im Wesentlichen handelt es sich um eine leicht angepasste Installation von [Passenger](https://www.phusionpassenger.com/library/), einem App-Server, zu dem wir Unterstützung für PHP hinzugefügt haben (für einige der älteren Web-Apps von CS50). Es erleichtert auch die Konfiguration von Nginx, dem Webserver, der von Passenger im   [Standalone mode](https://www.phusionpassenger.com/library/config/standalone/intro.html) verwendet wird, über zwei Dateien, `httpd.conf` und `server.conf`. Das Abbild selbst basiert auf [`cs50/cli`](cli),das wiederrum auf [Ubuntu 18.04](https://hub.docker.com/_/ubuntu/) basiert, einer beliebten Linux-Distribution.
## Verwendung

Angenommen, Sie haben [Docker](../docker) bereits installiert, basieren Sie Ihren eigenen  `Dockerfile` wie folgt auf  `cs50/server` und machen Sie TCP-Port 8080, den Standardport des Servers, verfügbar:

```
FROM cs50/server
EXPOSE 8080
```

Stellen Sie dann sicher, dass Ihre App wie folgt strukturiert ist.

-  Wenn das Back-End Ihrer App in **Meteor** implementiert ist
    - Stellen Sie im gebündelten/gepackten Modus sicher, dass sich eine Datei mit dem Namen `app.js` (die Einstiegspunktdatei Ihrer App) im selben Verzeichnis wie Ihr  `Dockerfile` befindet.
    - Stellen Sie im nicht gebündelten/gepackten Modus sicher, dass sich eine Datei namens `.meteor` im selben Verzeichnis wie Ihr  `Dockerfile` befindet.
- Wenn das Back-End Ihrer App in  **Node.js** implementiert ist, stellen Sie sicher, dass sich eine Datei namens `app.js`  (die Einstiegspunktdatei Ihrer App) im selben Verzeichnis wie Ihr `Dockerfile` befindet.
- Wenn das Back-End Ihrer Website in  **PHP** stellen Sie sicher, dass Sie ein Verzeichnis namens  `public` im selben Verzeichnis wie Ihren  `Dockerfile` haben, in dem sich alle PHP-Dateien befinden, die öffentlich bereitgestellt werden sollen.
- Wenn das Back-End Ihrer Website in  **Python** implementiert ist, tellen Sie sicher, dass Sie eine (WSGI) Datei namens `passenger_wsgi.py`, formatiert wie [vorgeschrieben](https://www.phusionpassenger.com/library/walkthroughs/start/python.html#the-passenger-wsgi-file), im selben Verzeichnis wie Ihren `Dockerfile`haben.
- Wenn das Back-End Ihrer Website in  **Ruby** (or **Ruby on Rails**)implementiert ist, stellen Sie sicher, dass Sie eine Datei namens `config.ru`, formatiert wie [vorgeschrieben](https://www.phusionpassenger.com/library/deploy/config_ru.html), im selben Verzeichnis wie Ihren `Dockerfile`haben.
- Wenn Ihre Website kein Back-End hat, nur ein in **HTML** implementiertes Frontend (vermutlich mit CSS und/oder JavaScript), stellen Sie sicher, dass Sie ein Verzeichnis namens `public` im selben Verzeichnis wie Ihren `Dockerfile`haben, in dem sich alle HTML- (und CSS- und / oder JavaScript-) Dateien befinden, die öffentlich bereitgestellt werden sollen.

### `APPLICATION_ENV`

Wenn Sie eine Umgebung namens  `APPLICATION_ENV` auf den Wert `dev` festlegen, wie über eine `docker-compose.yml` Datei, startet `cs50/server` (und damit Passenger) das Back-End Ihrer Anwendung nach jeder HTTP-Anforderung neu (indem Sie eine temporäre Datei namens (`tmp/always_restart.txt`[erstellen](https://github.com/cs50/server/blob/master/bin/passenger) ), wodurch sichergestellt wird, dass alle Änderungen, die Sie an Dateien vornehmen, bemerkt (und nicht zwischengespeichert) werden.

### Einstiegspunkt

Standardmäßig sucht `cs50/server` nach einer Datei namens `app.js`, `config.ru`, `.meteor`, or `passenger_wsgi.py` nach ihrer [Verwendung](#usage). Um`cs50/server` so zu konfigurieren,, dass eine andere Datei als Einstiegspunkt einer App verwendet wird, passen Sie Ihren`Dockerfile` wie folgt an, wobei `app_type` [wie vorgeschrieben](https://www.phusionpassenger.com/library/config/standalone/reference/#--app-type-app_type) und `startup_file` der relative Pfad der zu verwendenden Datei ist.

```
FROM cs50/server
EXPOSE ####
...
CMD passenger start --app-type app_type --startup-file startup_file
```

### Nginx

Sie können `cs50/server`'s Installation von Nginx durch hinzufügen von [Direktiven](http://nginx.org/en/docs/dirindex.html) wie folgt anpassen.

- To add directives to Nginix's `http` context, put them in a file called `http.conf` in the same directory as your `Dockerfile`.
 Do not surround them with `http {` and `}`.
- To add directives to Nginix's `server` context, put them in a file called `server.conf` in the same directory as your `Dockerfile`. Do not surround them with `server {` and `}`.

#### `rewrite`

To redirect, say, `/surprise` (and `/surprise/`) to `https://youtu.be/dQw4w9WgXcQ`, create a file called `server.conf` in the same directory as your `Dockerfile`, the contents of which are as follows.

```
rewrite ^/surprise/?$ https://youtu.be/dQw4w9WgXcQ redirect;
```

To redirect one domain to another (e.g., `www.cs50.harvard.edu` to `cs50.harvard.edu`), create a file called `server.conf` in the same directory as your `Dockerfile`, the contents of which are as follows.

```
if ($http_host = www.cs50.harvard.edu) {
    rewrite (.*) https://cs50.harvard.edu$1;
}
```

#### `try_files`

To route all requests (that aren't for actual files or directories) to `public/index.php`, create a file called `server.conf` in the same directory as your `Dockerfile`, the contents of which are as follows.

```
location / {
    try_files $uri $uri/ /index.php?$query_string;
}
```

To route all requests (that aren't for actual files or directories) to `public/index.html` (as you might for a JavaScript-based single-page app), create a file called `server.conf` in the same directory as your `Dockerfile`, the contents of which are as follows.

```
location / {
    try_files $uri $uri/ /index.html;
}
```

### Port

By default, `cs50/server` uses TCP port 8080. To configure `cs50/server` to use some other port, adjust your `Dockerfile` as follows, where `####` is your choice of ports:

```
FROM cs50/server
EXPOSE ####
...
CMD passenger start --port ####
```

### Static Files

By default, `cs50/server` assumes that your app's static files are in `public`, which is assumed to be in the same directory as your `Dockerfile`. To configure `cs50/server` to look in some other directory, configure your `Dockerfile` as follows, where `path/to/directory` is the relative path to that directory:

```
FROM cs50/server
...
CMD passenger start --static-files-dir path/to/directory
```

## Notes

### Caching

By default, HTTP responses from apps served by `cs50/server` are not cached by browsers (or proxies) because the image adds

```
Cache-Control: no-cache, no-store, must-revalidate
Expires: 0
Pragma: no-cache
```

to those responses.

To allow responses to be cached, create a file called `server.conf` in the app's root containing the below, which will remove those headers:

```
more_clear_headers 'Cache-Control' 'Expires' 'Pragma';
```

### HTTPS

If `cs50/server` detects that it's running behind a load balancer, whereby `X-Forwarded-Proto` (an HTTP header) is set, and the value of that header is `http` (the implication of which is that a client's request used HTTP instead of HTTPS), `cs50/server` will redirect the request to use HTTPS.

### Inline Frames

By default, apps based on `cs50/server` cannot be iframed in other sites, as the image adds

```
Content-Security-Policy: frame-ancestors 'self'
```

to HTTP responses. To allow an app to be iframed by another site, create a file called `server.conf` in the app's root containing the below, which will remove that header:

```
more_clear_headers 'Content-Security-Policy';
```
