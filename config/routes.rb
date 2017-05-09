Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root 'vision#index'
  post 'vision/detect', to: 'vision#detect'
end
