
/*
 * GET home page.
 */

var sysconf = require('../configure/sysconfig')
  , url = require('url')
  , querystring = require('querystring');

function translater(lang, obj) {
  switch(lang) {
    default:
    case "/":
      return obj[sysconf.sysconf.defaultLang];
    case "/zh_TW":
      return obj["zh_TW"];
    case "/en":
      return obj["en"];
  }
}

exports.index = function(req, res){
  var query = url.parse(req.url).query;
  var allQueries = querystring.parse(query);
  var lang = url.parse(req.url).pathname;

  res.render('index', { 
    title: translater(lang, {'en':'Bites | Snake & Rabies Animals', "zh_TW":'Bites | 毒蛇, 狂犬病動物'}),
    searchingtext: translater(lang, {'en':'Question & Answering', "zh_TW":'輸入問題關鍵字'}),
    login: translater(lang, {'en':'Login Dropbox or Google Drive', "zh_TW":'一般使用者或醫護人員'}),
    report: translater(lang, {'en':'Report', "zh_TW":'通報毒蛇或狂犬病資訊'}),
    positioning: translater(lang, {'en':'Positioning', "zh_TW":'精確定位'}),
    enablePositioning: translater(lang, {'en':'Enable High Positioning', "zh_TW":'啟用精確定位'}),
    searchrange: translater(lang, {'en':'Range', "zh_TW":'搜尋範圍'}),
    r0: translater(lang, {'en':'No Searching', "zh_TW":'不搜尋'}),
    r500: translater(lang, {'en':'500 M', "zh_TW":'500 公尺'}),
    r1000: translater(lang, {'en':'1 KM', "zh_TW":'1 公里'}),
    asksnakebite: translater(lang, {'en':'Snake Bites', "zh_TW":'蛇 咬傷'}),
    asksnake: translater(lang, {'en':'Anti-snake-serum Hospital', "zh_TW":'抗血清醫院'}),
    askrabies: translater(lang, {'en':'Radies Vaccine Hospital', "zh_TW":'狂犬病疫苗醫院'}),
    askrabiesbite: translater(lang, {'en':'Radies Animal Bites', "zh_TW":'狂犬病 咬傷'}),
    basemapstyle: translater(lang, {'en':'Map Style', "zh_TW":'地圖樣式'}),
    outdoorlayer: translater(lang, {'en':'Outdoor', "zh_TW":'戶外地圖'}),
    graylayer: translater(lang, {'en':'Gray', "zh_TW":'灰階地圖'}),
    messaging: translater(lang, {'en':'Message', "zh_TW":'推播訊息'}),
    enableMessaging: translater(lang, {'en':'Receiving Messages', "zh_TW":'是否接收推播訊息'}),
    enableLegend: translater(lang, {'en':'Show Legend', "zh_TW":'顯示圖例'}),
    hideLegend: translater(lang, {'en':'Whether to show the legend?', "zh_TW":'是否開啟圖例說明'}),
    rabiesnotify: translater(lang, {'en':"Rabies Vaccine Notify", "zh_TW":'狂犬病接種疫苗提醒'}),
    vacnotify: translater(lang, {'en':"Did you have a rabies vaccine before?", "zh_TW":'第幾次接種疫苗'}),
    vac1: translater(lang, {'en':"First Dose", "zh_TW":'第一次接種'}),
    vac2: translater(lang, {'en':"Second Dose", "zh_TW":'第二次接種'}),
    vac3: translater(lang, {'en':"Third Dose", "zh_TW":'第三次接種'}),
    vac4: translater(lang, {'en':"Fourth Dose", "zh_TW":'第四次接種'}),
    vac5: translater(lang, {'en':"Final Dose", "zh_TW":'第五次接種'}),
    reportSystem: translater(lang, {'en':"Reporting System", "zh_TW":'通報系統'}),
    reportDate: translater(lang, {'en':"Date", "zh_TW":'通報日期'}),
    reportLocation: translater(lang, {'en':"Location", "zh_TW":'通報地點'}),
    reportLocationDesc: translater(lang, {'en':"Press positioning button or enter a location.", "zh_TW":'請按定位(或輸入地址)'}),
    reportArea: translater(lang, {'en':'Area Type', "zh_TW":'地區分類'}),
    reportArea1: translater(lang, {'en':'Mountain Area', "zh_TW":'山區'}),
    reportArea2: translater(lang, {'en':'Residential Area', "zh_TW":'住宅區'}),
    reportArea3: translater(lang, {'en':'Roadside', "zh_TW":'路邊'}),
    reportArea4: translater(lang, {'en':'School Area', "zh_TW":'校區'}),
    reportArea5: translater(lang, {'en':'Other', "zh_TW":'其他'}),
    reportman_email: translater(lang, {'en':'Report Man Email', "zh_TW":'通報人電子郵件'}),
    uploadimg: translater(lang, {'en':'Upload the photo', "zh_TW":'上傳圖片'}),
    reportsend: translater(lang, {'en':'Send', "zh_TW":'通報'}),
    reportclose: translater(lang, {'en':'Close', "zh_TW":'關閉'}),
    vaccineTitle: translater(lang, {'en':'Rabies Vaccine Taking Peroid', "zh_TW":'狂犬病疫苗接種期程'}),
    firstVaccine: translater(lang, {'en':'First Dose', "zh_TW":'第一劑'}),
    secondVaccine: translater(lang, {'en':'Second Dose', "zh_TW":'第二劑'}),
    thirdVaccine: translater(lang, {'en':'Third Dose', "zh_TW":'第三劑'}),
    fourthVaccine: translater(lang, {'en':'Fourth Dose', "zh_TW":'第四劑'}),
    fifthVaccine: translater(lang, {'en':'Fifth Dose', "zh_TW":'第五劑'}),
    vaccnotify_email: translater(lang, {'en':'Notified Email', "zh_TW":'接受通知的 Email'}),
    vaccnotifysend: translater(lang, {'en':'Notify me via email.', "zh_TW":'以 Email 通知我'}),
    vaccnotifyclose: translater(lang, {'en':'Close', "zh_TW":'關閉'}),
    sourcecode: translater(lang, {'en':'Source Code', "zh_TW":'開放原始碼'}),
    changelang: translater(lang, {'en':'中文', "zh_TW":'English'}),
    changelangurl: translater(lang, {'en':'/zh_TW', "zh_TW":'/en'}),
    opinion: translater(lang, {'en':'Opinion', "zh_TW":'提供意見'}),
    legendTip: translater(lang, {'en':'Legend', "zh_TW":'圖例'}),
    routeSnakeHosp: translater(lang, {'en':'Sanke Anti-Serum Hospital', "zh_TW":'抗毒蛇血清醫院'}),
    routeRabiesVaccHosp: translater(lang, {'en':'Rabies Vaccine Hospital', "zh_TW":'狂犬病疫苗醫院'}),
    routeRabiesAbHosp: translater(lang, {'en':'Rabies Anti-Serum Hospital', "zh_TW":'狂犬病免疫球蛋白醫院'}),
    imageRecognition: translater(lang, {'en':'Ai for Image Recognition', "zh_TW":'人工智慧辨識毒蛇種類'}),
    imageRecognitionResult: translater(lang, {'en':'Image Recognition Result', "zh_TW":'辨識結果'}),
    imagesend: translater(lang, {'en':'Upload', "zh_TW":'上傳圖片'}),
    loginTitle: translater(lang, {'en':'Select a service to login.', "zh_TW":'選擇一個服務登入'}),
    closeLogin: translater(lang, {'en':'Close', "zh_TW":'關閉'}),
    recaptchaSiteKey: "6LcB61QUAAAAAK_0DjgGG1qEXi59cAFOSYboWTf7"
  });
};