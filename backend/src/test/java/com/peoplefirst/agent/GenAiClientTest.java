package com.peoplefirst.agent;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.peoplefirst.agent.client.GenAiClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class GenAiClientTest {

    private HttpClient mockHttpClient;
    private HttpResponse<String> mockHttpResponse;
    private GenAiClient client;
    private String stubBody = "{\"choices\": [{\"message\": {\"content\": \"hello\"}}]}";

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() throws Exception {
        mockHttpClient = mock(HttpClient.class);
        mockHttpResponse = (HttpResponse<String>) mock(HttpResponse.class);
        when(mockHttpResponse.statusCode()).thenReturn(200);
        when(mockHttpResponse.body()).thenReturn(stubBody);
        when(mockHttpClient.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class)))
                .thenReturn(mockHttpResponse);

        client = new GenAiClient(new ObjectMapper(), mockHttpClient);
        client.setEnabled(true);
        client.setApiKey("test-key-not-sk");
        client.setProvider("openai_compatible");
        client.setModel("test-model");
        client.setBaseUrl("http://localhost:8080");
    }

    @Test
    @SuppressWarnings("unchecked")
    void postsToConfiguredBaseUrlChatCompletions() throws Exception {
        Optional<String> reply = client.generateContent("sys", "hi");
        assertTrue(reply.isPresent());
        assertEquals("hello", reply.get());

        ArgumentCaptor<HttpRequest> requestCaptor = ArgumentCaptor.forClass(HttpRequest.class);
        verify(mockHttpClient, atLeastOnce()).send(requestCaptor.capture(), any(HttpResponse.BodyHandler.class));
        HttpRequest req = requestCaptor.getValue();
        assertEquals("http://localhost:8080/chat/completions", req.uri().toString());

        // Trailing slash on base URL must still post to /chat/completions
        client.setBaseUrl("http://localhost:8080/");
        Optional<String> reply2 = client.generateContent("sys", "hi");
        assertTrue(reply2.isPresent());
    }

    @Test
    @SuppressWarnings("unchecked")
    void baseUrlAlreadyContainingChatCompletionsIsNotDoubled() throws Exception {
        client.setBaseUrl("http://localhost:8080/some/path/chat/completions");
        Optional<String> reply = client.generateContent("sys", "hi");
        assertTrue(reply.isPresent());

        ArgumentCaptor<HttpRequest> requestCaptor = ArgumentCaptor.forClass(HttpRequest.class);
        verify(mockHttpClient).send(requestCaptor.capture(), any(HttpResponse.BodyHandler.class));
        HttpRequest req = requestCaptor.getValue();
        assertEquals("http://localhost:8080/some/path/chat/completions", req.uri().toString());
    }
}
