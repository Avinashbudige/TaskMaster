package com.taskmaster.service;

import com.taskmaster.dto.AuthDTO;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    public AuthDTO login(AuthDTO request) {
        AuthDTO response = new AuthDTO();
        response.setEmail(request.getEmail());
        response.setToken("demo-token");
        return response;
    }
}
