# Vision Demo

This is a demo project for [Google Vision API](https://cloud.google.com/vision/).

# Runtime

* Ruby 2.4.1
* Rails 5.0.2

# Setup Google Vision API

Login [Google Cloud Platform Cloud Console](https://console.cloud.google.com).

Create a new project and enable billing.

Enable the vision API in `APIs & Services` page.

# Setup Development

Install [Cloud SDK](https://cloud.google.com/sdk/downloads) and login.

Setup working project.

```shell
$ gcloud config set core/project <YOUR_PROJECT_ID>
```

Replace `<YOUR_PROJECT_ID>` to the project id which enabled the vision API.

Clone this project

```shell
$ git clone git@github.com:CloudMile/vision-web.git
$ cd vision-web
```

Install dependency gems

```shell
$ bundle install
```

Edit the project ID in `app/controllers/vision_controller.rb`

```ruby
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
```

Replace `PROJECT_ID = "cloudmile-vision"` to your project.

Run development environment, default listen port is `3000`

```shell
$ bundle exec rails server
```

Use [ngrok](https://ngrok.com/) to provide `https` endpoint in another terminal session.

```shell
$ ngrok http 3000
```

Open the https url in browser, enable the using camera permission.
