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

