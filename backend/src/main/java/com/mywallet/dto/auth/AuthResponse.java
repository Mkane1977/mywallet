package com.mywallet.dto.auth;

public class AuthResponse {
    public Long userId;
    public String email;
    public String name;

    public AuthResponse(Long userId, String email, String name) {
        this.userId = userId;
        this.email = email;
        this.name = name;
    }
}
