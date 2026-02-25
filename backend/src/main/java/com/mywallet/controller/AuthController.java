package com.mywallet.controller;

import com.mywallet.domain.User;
import com.mywallet.dto.auth.*;
import com.mywallet.service.auth.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    private final AuthService auth;

    public AuthController(AuthService auth) {
        this.auth = auth;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        User u = auth.register(req.email, req.name, req.password);
        return new AuthResponse(u.getId(), u.getEmail(), u.getName());
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        User u = auth.login(req.email, req.password);
        return new AuthResponse(u.getId(), u.getEmail(), u.getName());
    }
}
