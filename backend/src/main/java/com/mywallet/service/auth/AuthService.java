package com.mywallet.service.auth;

import com.mywallet.domain.User;

public interface AuthService {
    User register(String email, String name, String rawPassword);




    User login(String email, String rawPassword);
}
