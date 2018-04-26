/*
 * secret information
 */
var sysconf = {
    "umap_version" : "0.0.1"
    , "availableLang" : "en zh_TW"
    , "defaultLang" : "zh_TW"
    , "site_description" : "Bites project is the open source for GIS with AI image recognition for providing residents with information of snake and rabies-infected animals. "
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