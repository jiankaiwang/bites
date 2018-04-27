# bites

[![Build Status](https://travis-ci.org/jiankaiwang/bites.svg?branch=master)](https://travis-ci.org/jiankaiwang/bites)

Bites project is the open source for GIS with AI image recognition for providing residents with information of snake and rabies-infected animals. 



## View



### Desktop View

![](./public/img/desktop_view.png)



### Mobile View

![](./public/img/mobile_view.png)



## Start the service.

### Clone the Reposiroty

```shell
cd ~
git clone https://github.com/jiankaiwang/bites.git
cd ./bites
```

### Preparation

Add and edit the configuration file (named `sysconfig.js`) under path `configure`.

```javascript
/*
 * secret information
 */
var sysconf = {
    "umap_version" : "0.0.1"
    , "availableLang" : "en zh_TW"
    , "defaultLang" : "zh_TW"
    , "site_description" : "Bites project is the open source for GIS with AI image recognition for providing residents with information of snake and rabies-infected animals."
    , "error_emails_to" : "null"
    , "api_allow_host" : "localhost 127.0.0.1"
    , "use-redis": false
    , "redisServer": {
        "host": "",
        "port": 6379,
        "password": "",
        "ttl": 260
    }
};

var recaptcah = {
    sitekey: "",
    secretkey: ""
}


/*
 * export list
 */
exports.sysconf = sysconf;
exports.recaptcah = recaptcah;
```

### Deployment

```shell
npm install --save
sudo npm start
```

### Service

* Establish the service by adding the script to `/etc/systemd/system/bites.service`

```shell
[Unit]
Description=bites project
After=network.target

[Service]
User=root
Group=root
ExecStart=/usr/bin/node /home/cdc/bites/app.js
Restart=always
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production
WorkingDirectory=/home/cdc/bites

[Install]
WantedBy=multi-user.target
```

Check service status: `sudo systemctl status bites.service`, automatically start the service after rebooting `sudo systemctl enable bites.service` and start/stop the service `sudo systemctl start|stop bites.service`.

* Allow nopasswd commands running the service to build in CI/CD tools (using `Jenkins` as ci/cd tool). Edit the file ` /etc/sudoers.d/90-cloud-init-users`.

```ini
# jenkins example
Cmnd_Alias MYAPP_CMNDS = /bin/systemctl start bites.service, /bin/systemctl stop bites.service, /bin/systemctl restart bites.service, /usr/bin/node /home/cdc/bites/app.js
jenkins ALL=(ALL) NOPASSWD:MYAPP_CMNDS
```

* shell script example to activate ci/cd

```shell
#!/bin/bash

# start the CD
cd /home/cdc/bites/cicd/
/bin/bash cd.sh jiankaiwang bites "travis-token" /home/cdc/bites
```

