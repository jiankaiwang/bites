#
# author : jiankaiwang (https://jiankaiwang.no-ip.biz/)
# project : seed (https://github.com/jiankaiwang/seed)
# reference : seed (https://www.gitbook.com/book/jiankaiwang/seed/details)
# resource: TEXTCODING
#

# coding: utf-8

#
# desc : unicode to utf8 from list
# retn : a utf8-encoding list
# e.g. : unicode2utf8FromList([ u'\u4e3b\u8981' : u'\u4e3b\u8981' ])
#
def unicode2utf8FromList(getList):
    newList = []
    for item in getList:
        if isinstance(item,list):
            newList.append(unicode2utf8FromList(item))
        elif isinstance(item,dict):
            newList.append(unicode2utf8FromDict(item))
        else:
            newList.append(unicode2utf8FromStr(item))
    return newList

#
# desc : unicode to utf8 from dictionary
# retn : a utf8-encoding dictionary
# e.g. : unicode2utf8FromDict({ u'\u4e3b\u8981' : u'\u4e3b\u8981' })
#
def unicode2utf8FromDict(getDict):
    newData = {}
    for k, v in getDict.iteritems():
        if isinstance(v,list):
            newData[unicode2utf8FromStr(k)] = unicode2utf8FromList(v)
        elif isinstance(v,dict):
            newData[unicode2utf8FromStr(k)] = unicode2utf8FromDict(v)
        else:
            newData[k] = unicode2utf8FromStr(v)
    return newData

#
# desc : unicode to utf8 from string
# retn : a utf8-encoding string
# e.g. : unicode2utf8FromStr(u'\u4e3b\u8981')
#
def unicode2utf8FromStr(getStr):
    try:
        # deal with \\u....
        return unicode(getStr,'unicode-escape').encode('utf-8')
    except TypeError:
        return unicode(getStr).encode('utf-8')
        