var icTaskInfo = {"sessname":"", "key":""};

function ic_change_origin_url() {
    $('.classifyorigin').css({'display':'block'});
    var base = "https://bites.cdc.gov.tw:5001/imageclassification/imgclassres/iciptimg"
      , sessUrl = "?task=" + icTaskInfo['sessname'] + "&key=" + icTaskInfo['key'];
    $('#classifyoriginbody').attr('src',base + sessUrl);
}

function ic_change_result_notify(message) {
    $('.icres').html(message); 
}

function wait_for_ic_complete() {
    var base = "https://bites.cdc.gov.tw:5001/imageclassification/imgclassres"
      , sessUrl = "?task=" + icTaskInfo['sessname'] + "&key=" + icTaskInfo['key'];
      
    $.ajax({
		url: base + sessUrl,
		type: 'get',
		data: {},
		error: function (xhr, ajaxOptions, thrownError) {
			callback(xhr.status + " " + thrownError + ". Cannot connect to " + base + ".");
		},
		success: function (response) {
			//console.log(response['state']);
            if(['failure','complete'].indexOf(response['state']) < 0) {
                ic_change_result_notify("state: " + response['state']);
                setTimeout(function(){ 
                    wait_for_ic_complete(); 
                    setNotiftBtn("processing", "辨識中");
                    console.log("Keep waiting for the calculation complete.");
                }, 2000);
            } else if (response['state'] == "complete") {
                //ic_change_result_notify("finish");
                //console.log(JSON.parse(response['result']));
                var allres = JSON.parse(response['result']);
                var keyList = getDictionaryKeyList(allres);
                var showResMsg = '';
                for(var i = 0 ; i < keyList.length; i++) {
                    showResMsg += keyList[i] + ": " + allres[keyList[i]] + "<br>";
                }
                ic_change_result_notify(showResMsg);
                setNotiftBtn("reupload", "上傳圖片");
            } else if (response['state'] == "failure") {
                ic_change_result_notify("failure to classify the image");
                setNotiftBtn("tryupload", "重新圖片");
            }
		}
	});
}

function setNotiftBtn(status, value) {
  var content = "";
  var icstatue = false;
  var btnStatue = 'btn-primary';
  switch(status) {
    case "uploading":
      icstatue = true;
      content = '<i class="fa fa-cloud-upload" aria-hidden="true"></i> ' + value;
      if($('.uploadscai').hasClass('btn-primary')) {
        $('.uploadscai').removeClass('btn-primary');
        $('.uploadscai').addClass('btn-default');
      }
      break;
    case "processing":
      icstatue = true;
      content = "<i class='fa fa-spinner fa-spin'></i> " + value;
      if($('.uploadscai').hasClass('btn-primary')) {
        $('.uploadscai').removeClass('btn-primary');
        $('.uploadscai').addClass('btn-default');
      }
      break;    
    case "reupload":
      icstatue = false;
      content = value;
      if($('.uploadscai').hasClass('btn-default')) {
        $('.uploadscai').removeClass('btn-default');
        $('.uploadscai').addClass('btn-primary');
      }
      break;     
    case "tryupload":
      icstatue = false;
      content = '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i> ' + value;
      if($('.uploadscai').hasClass('btn-default')) {
        $('.uploadscai').removeClass('btn-default');
        $('.uploadscai').addClass('btn-primary');
      }
      break;            
  }
  $('.uploadscai').html(content);
  on_uploading_flag["image_classification"] = icstatue;
  
}

$(function(){
  $('#icupload').on('click', function() {
    if(on_uploading_flag["image_classification"]) {
      return;
    }

    $.ajax({
      url: 'https://bites.cdc.gov.tw:5001/imageclassification',
      type: 'POST',

      // Form data
      data: new FormData($('#imageclassification')[0]),

      // Tell jQuery not to process data or worry about content-type
      // You *must* include these options!
      cache: false,
      contentType: false,
      processData: false,

      // Custom XMLHttpRequest
      xhr: function() {
        myXhr = $.ajaxSettings.xhr();
        if (myXhr.upload) {
          // For handling the progress of the upload
          myXhr.upload.addEventListener('progress', function(e) {
          if (e.lengthComputable) {
            //$('progress').attr({value: e.loaded, max: e.total});
            //console.log(e.loaded, e.total);
            setNotiftBtn("uploading", 
              '上傳 ' + Math.round(e.loaded / e.total * 100) + ' %');
          }} , false);
          myXhr.upload.addEventListener('loadend', function(e) {
            console.log("Uploading image is complete.");
          });
        }
        myXhr.onreadystatechange = function() {
          if (myXhr.readyState == 4 && myXhr.status == 200) {
            //console.log(myXhr.response);
            if(myXhr.response.length > 0) {
                var response = JSON.parse(myXhr.response);
                if(response['status'] == "success") {
                    icTaskInfo = {"sessname":response['sessname'], "key":response['sesskey']};
                    // change origin image url
                    ic_change_origin_url();
                    ic_change_result_notify('Initialize image classification.');
                    // wait for object detection calculation complete
                    wait_for_ic_complete();
                }
            }
          }
        }
        return myXhr;
       }
    });
  });
});