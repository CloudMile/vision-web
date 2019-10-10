json.responses do
  json.grpc do 
    json.face_annotations @result.face_annotations do |face_annotation|
      json.extract! face_annotation, :joy_likelihood, :sorrow_likelihood, :anger_likelihood, :surprise_likelihood, :under_exposed_likelihood, :blurred_likelihood, :headwear_likelihood, :detection_confidence
      json.bounding_poly do 
        json.vertices face_annotation.bounding_poly.vertices do |vertice|
          json.extract! vertice, :x, :y
        end
      end
    end

    json.label_annotations @result.label_annotations do |label_annotation|
      json.extract! label_annotation, :mid, :locale, :description, :score, :confidence, :topicality
    end

    json.web_detection do
      json.web_entities @result.web_detection.web_entities do |entity|
        json.entity_id entity.entity_id
		json.score entity.score
		json.description entity.description
      end
    end
  end
end