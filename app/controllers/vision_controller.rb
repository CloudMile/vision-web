require "google/cloud/vision"

class VisionController < ApplicationController
  PROJECT_ID = "cloudmile-vision"

  def index

  end

  def detect
    #convert imageBase64Data to image
    data = params[:data_uri]
    image_data = Base64.decode64(data['data:image/png;base64,'.length .. -1])
    File.open("#{Rails.root}/public/uploads/temp.png", 'wb') do |f|
      f.write image_data
    end

    vision = Google::Cloud::Vision.new project: PROJECT_ID
    image  = vision.image "#{Rails.root}/public/uploads/temp.png"
    #face = image.face
    annotation = vision.annotate image, labels: true, faces: true, web: true
    render json: { responses: annotation }
  end
end
