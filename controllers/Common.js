/*
* author : Jian-Kai Wang (http://jiankaiwang.no-ip.biz)
* project : seed 2016
* github : https://github.com/jiankaiwang/seed
*/

function getDictionaryLength(getDictObj) {
	var dictLength = 0;
	for (var key in getDictObj) {
			if (getDictObj.hasOwnProperty(key)) {
					dictLength += 1;
			}
	}
	return dictLength;
};
exports.getDictionaryLength = getDictionaryLength;

function getDictionaryKeyList(getDictObj) {
	var keyList = [];
	for(var key in getDictObj) {
		keyList.push(key);
	}
	return keyList;
};
exports.getDictionaryKeyList = getDictionaryKeyList;

function getDictionaryValueList(getDictObj) {
	var valueList = [];
	for(var key in getDictObj) {
		valueList.push(getDictObj[key]);
	}
	return valueList;
};
exports.getDictionaryValueList = getDictionaryValueList;

function dictBubbleSortOnValue(getDictObj) {
	var retKeyList = getDictionaryKeyList(getDictObj);
	var tmpKey = "";
	// sort body
	for(var i = 0 ; i < retKeyList.length-1 ; i ++) {
		for(var j = 0 ; j < retKeyList.length-1-i ; j++) {
			if(parseFloat(getDictObj[retKeyList[j]]) > parseFloat(getDictObj[retKeyList[j+1]])) {
				tmpKey = retKeyList[j];
				retKeyList[j] = retKeyList[j+1];
				retKeyList[j+1] = tmpKey;
			}
		}
	}
	return retKeyList;
};
exports.dictBubbleSortOnValue = dictBubbleSortOnValue;

/*
 * desc : sort keys in dictionary by their values
 * para : 
 *	1. getDictObj : { key : value }
 *	2. sortType : "bubble"(default)
 * 	3. getOrder : desc, asc(default)
 *	4. getListCount : 0-N
 * example :
 * 	var aa = { 'a' : 10, 'b' : 3, "c" : 5 }
 *  var keyList = getKeyBySortOnValue(aa, "bubble", "desc", getDictionaryLength(aa));
*/
function getKeyBySortOnValue(getDictObj, sortType, getOrder, getListCount) {
	var retKeyList = getDictionaryKeyList(getDictObj);
	switch(sortType) {
		default:
		case "bubble":
			retKeyList = dictBubbleSortOnValue(getDictObj);
			break;
	}
	// getOrder : desc, asc
	var tmpKeyList = [];
	switch(getOrder) {
		case "desc":
			for(var i = retKeyList.length-1 ; i >= 0 ; i--) {
				tmpKeyList.push(retKeyList[i]);
			}
			retKeyList = tmpKeyList;
			break;
	}
	// return as desired number
	tmpKeyList = [];
	var keyLength = getListCount > getDictionaryLength(getDictObj) ? getDictionaryLength(getDictObj) : getListCount;
	for(var i = 0 ; i < keyLength ; i++) {
			tmpKeyList.push(retKeyList[i]);
	}
	retKeyList = tmpKeyList;
	return retKeyList;
};
exports.getKeyBySortOnValue = getKeyBySortOnValue;

/*
 * desc : return all index in the list which their values are the same with the given value
 * inpt :
 * |- getList : the searching list
 * |- getItem : the searching item
 * retn : a list containing the index
 * e.g. : allItemIndexinList([1,2,3,3,4], 3);  // return [2,3]
 */
function allItemIndexinList(getList, getItem) {
	var retList = [];
	var count = 0;
	
	getList.forEach(function(data) {
	  if(data == getItem) {
			retList.push(count);
		}
		count += 1;
	});
	
	return retList;
};
exports.allItemIndexinList = allItemIndexinList;

/*
 * desc : return the list which elements are duplicated
 * inpt :
 * |- getList : the list 
 * retn : the list with the non-duplicated element
 */
function uniqueList(getList) {
	var retList = [];
	for(var i = 0 ; i < getList.length ; i++) {
		if(retList.indexOf(getList[i]) < 0) {
			retList.push(getList[i]);
		}
	}
	return retList;
};
exports.uniqueList = uniqueList;

/*
 * desc : count byte length of the UTF8 string
 * inpt :
 * |- getStr : a UTF-8 encoding string
 * retn : a number
 */
function byteCount(getStr) {
    return encodeURI(getStr).split(/%..|./).length - 1;
};
exports.byteCount = byteCount;

/**
 * desc: swap element in the list
 */
function swap(a, b) {
	return [b, a];
}
exports.swap = swap;

/**
 * @param {*} str : string
 */
function toUTF8Array(str) {
    var utf8 = [];
    for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6), 
                      0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12), 
                      0x80 | ((charcode>>6) & 0x3f), 
                      0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
            i++;
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                      | (str.charCodeAt(i) & 0x3ff))
            utf8.push(0xf0 | (charcode >>18), 
                      0x80 | ((charcode>>12) & 0x3f), 
                      0x80 | ((charcode>>6) & 0x3f), 
                      0x80 | (charcode & 0x3f));
        }
    }
    return utf8;
}
exports.toUTF8Array = toUTF8Array;

/**
 * @param {*} data : UTF8 array
 */
function fromUTF8Array(data) { // array of bytes
    var str = '',
        i;

    for (i = 0; i < data.length; i++) {
        var value = data[i];

        if (value < 0x80) {
            str += String.fromCharCode(value);
        } else if (value > 0xBF && value < 0xE0) {
            str += String.fromCharCode((value & 0x1F) << 6 | data[i + 1] & 0x3F);
            i += 1;
        } else if (value > 0xDF && value < 0xF0) {
            str += String.fromCharCode((value & 0x0F) << 12 | (data[i + 1] & 0x3F) << 6 | data[i + 2] & 0x3F);
            i += 2;
        } else {
            // surrogate pair
            var charCode = ((value & 0x07) << 18 | (data[i + 1] & 0x3F) << 12 | (data[i + 2] & 0x3F) << 6 | data[i + 3] & 0x3F) - 0x010000;

            str += String.fromCharCode(charCode >> 10 | 0xD800, charCode & 0x03FF | 0xDC00); 
            i += 3;
        }
    }
    return str;
}
exports.fromUTF8Array = fromUTF8Array;

/**
 * @description sort by number value in dict
 * @param {*} obj 
 * @param {*} isdescend 
 * @example sortDictByNumberValue({1: 3, 5: 2, 7: 1, 13: 1, 15: 1, 16: 1}, true)
 * @retuen [Array(2), Array(2), Array(2), Array(2), Array(2), Array(2)]
 */
function sortDictByNumberValue(obj, isdescend)
{
  // convert object into array
	var sortable=[];
	for(var key in obj)
		if(obj.hasOwnProperty(key))
			sortable.push([key, obj[key]]); // each item is an array in format [key, value]
	
	// sort items by value
	if(isdescend) {
		sortable.sort(function(a, b) {
			return b[1]-a[1]; // compare numbers
		});
	} else {
		sortable.sort(function(a, b) {
			return a[1]-b[1]; // compare numbers
		});
	}
	return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
}
exports.sortDictByNumberValue = sortDictByNumberValue;

/**
 * @description sort by string value in dict
 * @param {*} obj 
 * @example sortDictByStringValue({10:'Tashkent', 14:'Karakalpakiya', 16:'Andijan'});
 */
function sortDictByStringValue(obj) {
  // convert object into array
  var sortable=[];
  for(var key in obj)
	  if(obj.hasOwnProperty(key))
		  sortable.push([key, obj[key]]); // each item is an array in format [key, value]
  
  // sort items by value
  sortable.sort(function(a, b)
  {
	  var x=a[1].toLowerCase(),
		  y=b[1].toLowerCase();
	  return x<y ? -1 : x>y ? 1 : 0;
  });
  return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
}
exports.sortDictByStringValue = sortDictByStringValue;