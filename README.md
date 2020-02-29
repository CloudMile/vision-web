# Vision Demo

This is a demo project for [Google Vision API](https://cloud.google.com/vision/).

# Runtime

* Ruby 2.6.5
* Rails 5.0.7.2

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

In local machine, you need credentials to call API

You can setup with gcloud command

```shell
$ gcloud auth application-default login
```

Then [create a servcie account](https://cloud.google.com/iam/docs/creating-managing-service-accounts#creating) and [download the credentials](https://cloud.google.com/iam/docs/creating-managing-service-account-keys#creating_service_account_keys)

We don't need grant the service account any permission, and keep the credentials out of your git repository.

Before run the server, we export a environment variable for the credentials.

```shell
$ export GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
```

Clone this project

```shell
$ git clone git@github.com:CloudMile/vision-web.git
$ cd vision-web
```

Install dependency gems

```shell
$ bundle install
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
