package com.extention.demo.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class EmailGeneratorService {

    private final WebClient webClient;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;
    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public EmailGeneratorService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String generateEmailReply(EmailRequest emailRequest){
        //Build the prompt
        String prompt = buildPrompt(emailRequest);


        //Craft a request(Map the request with suitable pattern)
        Map<String,Object> requestBody = Map.of(
                "contents", new Object[]{
                       Map.of("parts", new Object[]{
                            Map.of("text",prompt)
                       })
                }
        );



        //Do request and get Response
        String response = webClient.post()
                .uri(geminiApiUrl + geminiApiKey)
                .header("Content-Type","application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();



        //Return reBuild Response
        return extractResponseContent(response);


    }

    private String extractResponseContent(String response) {
        try{
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(response);
            return rootNode.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();
        }catch(Exception e){
            return "Error Occur When Processing";
        }

    }

    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Generate a professional email reply for the following email content. ");
        prompt.append("The reply must start with 'Hi [receiver name]' and end with 'Thank you, [sender name]'. ");
        prompt.append("Replace '[receiver name]' with an appropriate name inferred from the context of the original email or use a generic name like 'Team' or 'Colleague' if no context is available. ");
        prompt.append("Replace '[sender name]' with a professional name like 'Alex' or 'Sarah' to represent the responder. ");
        prompt.append("The body of the email (excluding 'Hi [receiver name]' and 'Thank you, [sender name]') must contain at least 20 words. ");
        prompt.append("Ensure the reply is concise yet detailed, matches the tone specified, and directly responds to the original email content. act as a good email writer more humanlize don't look like it a full AI");
        prompt.append("Do not include a subject line or any extra explanations outside the email body.\n");
        if (emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()) {
            prompt.append("Use a ").append(emailRequest.getTone()).append(" tone.\n");
        }
        prompt.append("Original email:\n").append(emailRequest.getEmailContent());
        return prompt.toString();
    }
}
