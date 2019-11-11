require "google/cloud/vision"

class VisionController < ApplicationController
  def index

  end

  def detect
    #convert imageBase64Data to image
    data = params[:data_uri]
    image_data = Base64.decode64(data['data:image/png;base64,'.length .. -1])
    image = { content: image_data }

    features = [{ type: :FACE_DETECTION }, { type: :LABEL_DETECTION }, { type: :WEB_DETECTION }]
    
    requests_element = { image: image, features: features }
    requests = [requests_element]

    image_annotator = Google::Cloud::Vision::ImageAnnotator.new
    response = image_annotator.batch_annotate_images(requests)

    @result = response.responses[0]
  end
end
