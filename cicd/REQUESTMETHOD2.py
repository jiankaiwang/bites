#
# author : jiankaiwang (https://welcome-jiankaiwang.rhcloud.com/)
# project : seed (https://github.com/jiankaiwang/seed)
# reference : seed (https://www.gitbook.com/book/jiankaiwang/seed/details)
#

# coding: utf-8

import json
import requests
import TEXTCODING

#
# desc : request as GET/POST/PUT/DELETE
# retn : the json data passed to the server and returned as json data
#

class SENDREQUEST:

    # -------------------------------
    # private
    # __state : 0 (success) or 1 (failure)
    # -------------------------------
    __url = ""
    __addHeader = ""
    __jsonData = ""
    __response = ""
    __method = ""
    __state = ""

    #
    # desc : GET method
    #
    def __get(self):
        try:
            # prepare get url
            ttlUrl = self.__url

            if len(self.__jsonData) > 0:
                ttlUrl = self.__url + '?'
                allPairs = []
                for key, value in self.__jsonData.iteritems():
                    allPairs.append(str(key) + '=' + str(value))
                ttlUrl = ttlUrl + '&'.join(allPairs)

            # begin get request
            req = requests.get(ttlUrl, headers = self.__addHeader)
            self.__response = req.text
            self.__state = 0
        except requests.exceptions.HTTPError as e:
            self.__response = e
            self.__state = 1
        except:
            self.__response = "uncatchable"
            self.__state = 1
        return

    #
    # desc : POST method
    #
    def __post(self):
        try:
            # begin post request
            req = requests.post(self.__url, json = TEXTCODING.unicode2utf8FromDict(self.__jsonData), headers = self.__addHeader)
            self.__response = req.text
            self.__state = 0
        except requests.exceptions.HTTPError as e:
            self.__response = e
            self.__state = 1
        except:
            self.__response = "uncatchable"
            self.__state = 1
        return

    #
    # desc : PUT or Delete method
    # param@jsonUrlecnoding : url encoding or not
    # param@methodPUT : request as PUT or DELETE method
    #
    def __PutOrDelete(self):
        try:
            # begin put or delete request
            if self.__method == "put":
                req = requests.put(self.__url, json = TEXTCODING.unicode2utf8FromDict(self.__jsonData), headers = self.__addHeader) 
                self.__response = req.text
            elif self.__method == "delete":
                req = requests.delete(self.__url, headers = self.__addHeader)
                self.__response = req.text
            self.__state = 0
        except requests.exceptions.HTTPError as e:
            self.__response = e
            self.__state = 1
        except:
            self.__response = "uncatchable"
            self.__state = 1
        return
    
    # -------------------------------
    # public
    # -------------------------------

    #
    # desc : constructor
    # param@getURL : e.g. 192.168.2.5/test/index.php
    # param@getHeaderSetting : e.g. { "Authorization" : "abcdefg-hijk-lmnop-qrstuv-wxyz" }
    # param@getData : e.g. { "method" : "post" }
    # param@getMtd : one of ["GET", "POST", "PUT", "DELETE"]
    #
    def __init__(self, getURL, getHeaderSetting, getData, getMtd="GET"):
        self.__url = getURL
        self.__addHeader = getHeaderSetting
        self.__jsonData = getData
        self.__response = ""
        self.__method = getMtd.lower()

        if self.__method == "get":
            self.__get()
        elif self.__method == "post":
            self.__post()
        elif self.__method == "put":
            self.__PutOrDelete()
        elif self.__method == "delete":
            self.__PutOrDelete()

    #
    # desc : show response
    #
    def response(self):
        return { "state" : self.__state, "response" : self.__response }

# get example
# ret : 
# {
#    'state': 0, \
#    'response': \
#        u'{\
#        "host":"192.168.2.5", \
#        "uri":"\\/test\\/REQUESTMETHOD.php?1=2&%E4%B8%AD%E6%96%87=%E6%96%B0%E5%A2%9E&method=getData",\
#        "method":"GET",
#        "header":{\
#            "Host":"192.168.2.5",\
#            "Connection":"keep-alive",\
#            "Accept-Encoding":"gzip, deflate",\
#            "Accept":"*\\/*",\
#            "User-Agent":"python-requests\\/2.8.0"},\
#            "response":{"1":"2","\\u4e2d\\u6587":"\\u65b0\\u589e","method":"getData"}
#        }'\
# }
#
#a = SENDREQUEST(\
#    "http://192.168.2.5/test/REQUESTMETHOD.php", \
#    {}, \
#    {"method" : "getData", '\xE4\xB8\xAD\xE6\x96\x87' : '\xE6\x96\xB0\xE5\xA2\x9E', 1 : 2}, 
#    "GET"\
#    )
#print a.response()
#print

# post example
# ret :
# {
#    'state': 0, \
#    'response': \
#        u'{"\
#            host":"192.168.2.5",\
#            uri":"\\/test\\/REQUESTMETHOD.php",\
#            "method":"POST",\
#            "header":{\
#                "Host":"192.168.2.5",\
#                "Content-Length":"53",\
#                "Accept-Encoding":"gzip, deflate",\
#                "Accept":"*\\/*",\
#                "User-Agent":"python-requests\\/2.8.0",\
#                "Connection":"keep-alive",\
#                "Content-Type":"application\\/x-www-form-urlencoded",\
#                "Authorization":"api-key"},\
#            "response":{"\\u4e2d\\u6587":"\\u65b0\\u589e","method":"postData"}
#        }'
# }
#
#b = SENDREQUEST(\
#    "http://192.168.2.5/test/REQUESTMETHOD.php", \
#    {u'Authorization': u'api-key'}, \
#    {"method" : "postData", '\xE4\xB8\xAD\xE6\x96\x87' : '\xE6\x96\xB0\xE5\xA2\x9E'}, \
#    "POST"\
#    )
#print b.response()
#print 

# put example
# ret : 
# {\
#    'state': 0, \
#    'response': \
#        u'{\
#            "host":"192.168.2.5",\
#            "uri":"\\/test\\/REQUESTMETHOD.php",\
#            "method":"PUT",\
#            "header":{\
#                "Host":"192.168.2.5",\
#                "Content-Length":"10",\
#                "Accept-Encoding":"gzip, deflate",\
#                "Accept":"*\\/*",\
#                "User-Agent":"python-requests\\/2.8.0",\
#                "Connection":"keep-alive",\
#                "Content-Type":"application\\/x-www-form-urlencoded",\
#                "Authorization":"api-key"},
#            "response":"method=put"
#        }'
# }
#
#c = SENDREQUEST(\
#    "http://192.168.2.5/test/REQUESTMETHOD.php", \
#    {"Authorization" : "api-key"}, \
#    {"method" : "put"}, \
#    "PUT"\
#    )
#print c.response()
#print 

# delete example
# ret :
# {\
#    'state': 0, \
#    'response': \
#        u'{\
#            "host":"192.168.2.5",\
#            "uri":"\\/test\\/REQUESTMETHOD.php",\
#            "method":"DELETE",\
#            "header":{
#                "Host":"192.168.2.5",\
#                "Content-Length":"13",\
#                "Accept-Encoding":"gzip, deflate",\
#                "Accept":"*\\/*",\
#                "User-Agent":"python-requests\\/2.8.0",\
#                "Connection":"keep-alive",\
#                "Content-Type":"application\\/x-www-form-urlencoded"},
#            "response":"method=delete"
#        }'
# }
# 
#d = SENDREQUEST(\
#    "http://192.168.2.5/test/REQUESTMETHOD.php", \
#    {}, \
#    {"method" : "delete"}, \
#    "DELETE"\
#    )
#print d.response()
#print







