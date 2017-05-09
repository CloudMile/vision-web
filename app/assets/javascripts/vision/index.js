var LINE_COLOR = "rgb(255, 0, 0)";
var STRATEGIES = {
  face_detection: {
    resultAttrName: 'face_annotations',
    outputAttrNames: ['bounding_poly', 'detection_confidence', 'anger_likelihood', 'blurred_likelihood', 'headwear_likelihood', 'joy_likelihood', 'sorrow_likelihood', 'surprise_likelihood', 'under_exposed_likelihood'],
    drawImage: true
  },
  label_detection: {
    resultAttrName: 'label_annotations',
    outputAttrNames: ['mid', 'locale', 'description', 'score', 'condidence', 'topicality'],
    drawImage: false
  },
  web_detection_entities: {
    resultAttrName: 'web_detection',
    subResultAttrName: 'web_entities',
    outputAttrNames: ['entity_id', 'score', 'description'],
    drawImage: false
  },
  web_detection_pages: {
    resultAttrName: 'web_detection',
    subResultAttrName: 'partial_matching_images',
    outputAttrNames: ['url', 'score'],
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

function showResult(results, attrNames, div_path) {
  var content = "<table class=\"table table-striped\">";

  content += '<thead><tr><th>#</th>';
  attrNames.forEach(function(name) {
    content += '<th>' + escapeHtml(name) + '</th>'
  });
  content += '</tr></thead>';

  if (!results) {
    content += '</table>';
    $(div_path).append(content);
    return;
  }

  content += '<tbody>';
  results.forEach(function(elem, i) {
    content += '<tr><td>' + (i + 1) + '</td>';
    attrNames.forEach(function(name) {
      var attrVal = elem[name];
      if ((typeof attrVal) === 'object') {
        content += '<td>' + escapeHtml(JSON.stringify(attrVal)) + '</td>'
      } else {
        content += '<td>' + escapeHtml(attrVal) + '</td>'
      }
    });
    content += '</tr>';
  });
  content += '</tbody></table>';
  $(div_path).append(content);
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

// Put event listeners into place
window.addEventListener("DOMContentLoaded", function() {
  $('#result').hide();
  $('#result2').hide();
  // Grab elements, create settings, etc.
  var canvas = document.getElementById('canvas');
  var context = canvas.getContext('2d');
  var video = document.getElementById('video');
  var mediaConfig =  { video: true };
  var errBack = function(e) {
    console.log('An error has occurred!', e)
  };

  // Put video listeners into place
  if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia(mediaConfig).then(function(stream) {
          video.src = window.URL.createObjectURL(stream);
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
      video.src = window.URL.createObjectURL(stream);
      video.play();
    }, errBack);
  }

  $('#imageLoader').on("change", function(e) {
    var canvas = document.getElementById('canvas2');
    var context = canvas.getContext('2d');
    var reader = new FileReader();
    reader.onload = function(event){
        var img = new Image();
        img.onload = function(){
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
  });

  $('#submit-btn').click(function() {
    var canvas = document.getElementById('canvas2');
    var data_uri = {
      "data_uri": canvas.toDataURL("image/png")
    };
    $.ajax({
         method: 'POST',
         url: '/vision/detect',
         contentType: 'application/json',
         data: JSON.stringify(data_uri),
         processData: false,
         success: function(data){
           var apiResponse = data.responses.grpc;
           if (apiResponse.error) {
             return;
           }
           $('#result2').show();
           for(var k in STRATEGIES) {
              var div_path = '#result2 .' + k;
              $(div_path).html('');
              results = apiResponse[STRATEGIES[k].resultAttrName];
              if (!$.isArray(results)) {
                results = results[STRATEGIES[k].subResultAttrName];
              }
              console.log(results);
              showResult(results, STRATEGIES[k].outputAttrNames, div_path);

              if (STRATEGIES[k].drawImage) {
                drawImageWithDetectedArea(canvas, results);
              }
           }
        },

        error:function(xhr, ajaxOptions, thrownError){
        }
    });
    return false;
  });

  // Trigger photo take
  document.getElementById('snap').addEventListener('click', function() {
    context.drawImage(video, 0, 0, 560, 420);
    var data_uri = {
      "data_uri": canvas.toDataURL("image/png")
    };
    $.ajax({
         method: 'POST',
         url: '/vision/detect',
         contentType: 'application/json',
         data: JSON.stringify(data_uri),
         processData: false,
         success: function(data){
           var apiResponse = data.responses.grpc;
           if (apiResponse.error) {
             return;
           }
           $('#result').show();
           for(var k in STRATEGIES) {
              var div_path = '#result .' + k;
              $(div_path).html('');
              results = apiResponse[STRATEGIES[k].resultAttrName];
              if (!$.isArray(results)) {
                results = results[STRATEGIES[k].subResultAttrName];
              }
              console.log(results);
              showResult(results, STRATEGIES[k].outputAttrNames, div_path);

              if (STRATEGIES[k].drawImage) {
                drawImageWithDetectedArea(canvas, results);
              }
           }
        },

        error:function(xhr, ajaxOptions, thrownError){
        }
    });
  });
}, false);
