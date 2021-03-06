

var LINE_COLOR = "rgb(255, 0, 0)";
var STRATEGIES = {
  face_detection: {
    result_id: 'face_result',
    result_type: 1,
    resultAttrName: 'face_annotations',
    outputAttrNames: ['joy_likelihood', 'sorrow_likelihood', 'anger_likelihood', 'surprise_likelihood', 'under_exposed_likelihood', 'blurred_likelihood', 'headwear_likelihood','bounding_poly', 'detection_confidence'],
    mapAttrNAmes : {'joy_likelihood':'喜悅', 'sorrow_likelihood':'悲傷', 'anger_likelihood': '憤怒', 'surprise_likelihood': '驚訝', 'under_exposed_likelihood':'曝光', 'blurred_likelihood':'模糊', 'headwear_likelihood':'頭飾', 'detection_confidence':'信心指數'},
    drawImage: true
  },
  label_detection: {
    result_id: 'label_result',
    result_type: 2,
    resultAttrName: 'label_annotations',
    outputAttrNames: ['mid', 'locale', 'description', 'score', 'confidence', 'topicality'],
    drawImage: false
  },
  web_detection_entities: {
    result_id: 'web_result',
    result_type: 3,
    resultAttrName: 'web_detection',
    subResultAttrName: 'web_entities',
    outputAttrNames: ['entity_id', 'score', 'description'],
    drawImage: false
  }
};
var escapeHtml = (function (String) {
  var escapeMap = {
    '&': '&amp;',
    "'": '&#x27;',
    '`': '&#x60;',
    '"': '&quot;',
    '<': '&lt;',
    '>': '&gt;'
  };
  var escapeReg = '[';
  var reg;
  for (var p in escapeMap) {
    if (escapeMap.hasOwnProperty(p)) {
      escapeReg += p;
    }
  }
  escapeReg += ']';
  reg = new RegExp(escapeReg, 'g');
  return function escapeHtml (str) {
    str = (str === null || str === undefined) ? '' : '' + str;
    return str.replace(reg, function (match) {
      return escapeMap[match];
    });
  };
}(String));

function showResult(results, vision_type)  {
  var attrNames = vision_type.outputAttrNames;
  switch(vision_type.result_type) {
    case 1:
      $('#' + vision_type.result_id).html('');
      var mapAttrNAmes = vision_type.mapAttrNAmes;
      results.forEach(function(elem, i) {
        var content = '<p><div>人臉' + (i + 1) + '</div>';
        attrNames.forEach(function(name) {
          var attrVal = elem[name];
          if ((typeof attrVal) === 'object') {
            //content += '<td>' + escapeHtml(JSON.stringify(attrVal)) + '</td>'
            // bounding_poly
          } else if ((typeof attrVal) === 'string'){
            content += '<div>' + mapAttrNAmes[name] + ' ';
            if (attrVal === 'VERY_UNLIKELY') {
              content += '✚ </div>';
            } else if (attrVal === 'UNLIKELY') {
              content += '✚✚ </div>';
            } else if (attrVal === 'POSSIBLE') {
              content += '<font color="#ffd800">✚✚✚</font></div>';
            } else if (attrVal === 'LIKELY') {
              content += '<font color="#ffd800">✚✚✚✚</font></div>';
            } else {
              content += '<font color="#ffd800">✚✚✚✚✚</font></div>';
            }
          } else {
            content += '<div>' + mapAttrNAmes[name] + ' ';
            content += (attrVal * 100).toFixed(0) + '% </div>';
          }
        });
        content += '</p>';
        $('#' + vision_type.result_id).append(content);
      });
      break;
    case 2:
      var array = [];
      var data = '';
      results.forEach(function(elem, i) {
        data += elem['description'] + ' - ' + (elem['score']* 100).toFixed(0) + '%';
        if (i % 3 === 2) {
          array.push(data);
          data = '';
        } else if (i === (results.length-1)) {
          array.push(data);
          data = '';
        } else {
          data += ' | ';
        }
      });

      var content = '<p>';
      array.forEach(function(elem, i) {
        if (i === 0) {
          content += '<font color="#ffd800">' + elem + '</font><br>';
        } else {
          content += elem + '<br>';
        }
      });
      $('#' + vision_type.result_id).html('');
      $('#' + vision_type.result_id).append(content);
      break;
    case 3:
      var content = '<p>';
      results.forEach(function(elem, i) {
        content += elem['description'];
        if (i !== (results.length-1)) {
          content += '、'
        }
      });
      $('#' + vision_type.result_id).html('');
      $('#' + vision_type.result_id).append(content);
      break;
    default:
      break;
  }
  results.forEach(function(elem, i) {

  });
}

function drawImageWithDetectedArea(canvas, results) {
  if (!results) {
    return;
  }
  var ctx = canvas.getContext('2d');
  results.forEach(function(elem, index) {
    var vertices = elem.bounding_poly.vertices;
    ctx.beginPath();
    x = vertices[0].x || 0;
    y = vertices[0].y || 0;
    ctx.moveTo(x, y)
    for (var i = 1; i < vertices.length; i++) {
      x = vertices[i].x || 0;
      y = vertices[i].y || 0;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = LINE_COLOR;
    ctx.stroke();
    ctx.fillStyle = LINE_COLOR;
    ctx.font = "24px Arial";

    index_x = ((vertices[vertices.length-2].x || 0) + (vertices[vertices.length-1].x || 0)) / 2;
    index_y = ((vertices[vertices.length-2].y || 0) + (vertices[vertices.length-1].y || 0)) / 2;
    ctx.fillText(index + 1, index_x, index_y);
  })
}

function drawImageScaled(img, ctx) {
   var canvas = ctx.canvas;
   var hRatio = canvas.width  / img.width;
   var vRatio =  canvas.height / img.height;
   var ratio  = Math.min ( hRatio, vRatio );
   var centerShift_x = ( canvas.width - img.width*ratio ) / 2;
   var centerShift_y = ( canvas.height - img.height*ratio ) / 2;
   ctx.clearRect(0,0,canvas.width, canvas.height);
   ctx.drawImage(img, 0,0, img.width, img.height,
                 centerShift_x,centerShift_y,img.width*ratio, img.height*ratio);
}

$(document).ajaxStart(function () {
  $.blockUI({ message: '請稍後' });
}).ajaxStop($.unblockUI);

// Put event listeners into place
window.addEventListener("DOMContentLoaded", function() {
  // Grab elements, create settings, etc.
  var canvas = document.getElementById('canvas');
  var context = canvas.getContext('2d');

  var background = new Image();
  background.src = 'assets/Face.png';
  // Make sure the image is loaded first otherwise nothing will draw.
  background.onload = function() {
    context.drawImage(background, 0, 0, 560, 420);
  }

  var canvas2 = document.getElementById('canvas2');
  var context2 = canvas2.getContext('2d');
  var background2 = new Image();
  background2.src = 'assets/Label.png';
  background2.onload = function() {
    context2.drawImage(background2, 0, 0, 560, 420);
  }

  var canvas3 = document.getElementById('canvas3');
  var context3 = canvas3.getContext('2d');
  var background3 = new Image();
  background3.src = 'assets/Web.png';
  background3.onload = function() {
    context3.drawImage(background3, 0, 0, 560, 420);
  }


  var video = document.getElementById('video');
  var mediaConfig =  { video: true };
  var errBack = function(e) {
    console.log('An error has occurred!', e)
  };

  // Put video listeners into place
  if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia(mediaConfig).then(function(stream) {
          video.srcObject = stream;
          video.play();
      });
  }

  /* Legacy code below! */
  else if(navigator.getUserMedia) { // Standard
    navigator.getUserMedia(mediaConfig, function(stream) {
      video.src = stream;
      video.play();
    }, errBack);
  } else if(navigator.webkitGetUserMedia) { // WebKit-prefixed
    navigator.webkitGetUserMedia(mediaConfig, function(stream){
      video.src = window.webkitURL.createObjectURL(stream);
      video.play();
    }, errBack);
  } else if(navigator.mozGetUserMedia) { // Mozilla-prefixed
    navigator.mozGetUserMedia(mediaConfig, function(stream){
      video.srcObject = stream;
      video.play();
    }, errBack);
  }

  $('#imageLoader').on("change", function(e) {
    var reader = new FileReader();
    reader.onload = function(event){
        var img = new Image();
        img.onload = function(){

          var hRatio = canvas.width / img.width;
          var vRatio = canvas.height / img.height;
          var ratio  = Math.min ( hRatio, vRatio );

          context.fillStyle = "#2b343d";
          context.fillRect(0, 0, canvas.width, canvas.height);
          //canvas.width = width;
          //canvas.height = height;
          //context.drawImage(img, 0, 0);
          drawImageScaled(img, context);

          context2.fillStyle = "#2b343d";
          context2.fillRect(0, 0, canvas2.width, canvas2.height);
          //canvas2.width = width;
          //canvas2.height = height;
          //context2.drawImage(img, 0, 0);
          drawImageScaled(img, context2);

          context3.fillStyle = "#2b343d";
          context3.fillRect(0, 0, canvas3.width, canvas3.height);
          //canvas3.width = width;
          //canvas3.height = height;
          //context3.drawImage(img, 0, 0);
          drawImageScaled(img, context3);

          $('#submit-btn').click();
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
  });

  $('#submit-btn').click(function() {
    var canvas = document.getElementById('canvas');
    var data_uri = {
      "data_uri": canvas.toDataURL("image/png")
    };
    $.ajax({
         method: 'POST',
         url: '/vision/detect',
         contentType: 'application/json',
         data: JSON.stringify(data_uri),
         async: true,
         processData: false,
         success: function(data){
           var apiResponse = data.responses.grpc;
           if (apiResponse.error) {
             return;
           }
           for(var k in STRATEGIES) {
              var vision_type = STRATEGIES[k];
              var results = apiResponse[vision_type.resultAttrName];
              if (typeof results === 'undefined') {
                continue;
              }
              if (!$.isArray(results)) {
                results = results[vision_type.subResultAttrName];
              }
              showResult(results, vision_type);

              if (vision_type.drawImage) {
                drawImageWithDetectedArea(canvas, results);
              }
           }
           $('html, body').animate({scrollTop:$('#one').position().top}, 2000);
        },

        error:function(xhr, ajaxOptions, thrownError){
        }
    });
    return false;
  });

  // Trigger photo take
  document.getElementById('snap').addEventListener('click', function() {
    context.fillStyle = "#2b343d";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(video, 0, 0, 560, 420);
    context2.fillStyle = "#2b343d";
    context2.fillRect(0, 0, canvas2.width, canvas2.height);
    context2.drawImage(video, 0, 0, 560, 420);
    context3.fillStyle = "#2b343d";
    context3.fillRect(0, 0, canvas3.width, canvas3.height);
    context3.drawImage(video, 0, 0, 560, 420);
    var data_uri = {
      "data_uri": canvas.toDataURL("image/png")
    };
    $.ajax({
         method: 'POST',
         url: '/vision/detect',
         contentType: 'application/json',
         data: JSON.stringify(data_uri),
         async: true,
         processData: false,
         success: function(data){
           var apiResponse = data.responses.grpc;
           if (apiResponse.error) {
             return;
           }
           for(var k in STRATEGIES) {
              var vision_type = STRATEGIES[k];
              var results = apiResponse[vision_type.resultAttrName];
              if (typeof results === 'undefined') {
                continue;
              }
              if (!$.isArray(results)) {
                results = results[vision_type.subResultAttrName];
              }
              showResult(results, vision_type);

              if (vision_type.drawImage) {
                drawImageWithDetectedArea(canvas, results);
              }
           }
           $('html, body').animate({scrollTop:$('#one').position().top}, 2000);
        },

        error:function(xhr, ajaxOptions, thrownError){
        }
    });
  });
  document.getElementById('upload').addEventListener('click', function() {
    document.getElementById('imageLoader').click();
  });
}, false);
