package com.mywallet.service.impl;

import com.mywallet.domain.User;
import com.mywallet.repository.UserRepository;
import com.mywallet.service.auth.AuthService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository repo;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthServiceImpl(UserRepository repo) {
        this.repo = repo;
    }

    @Override
    public User register(String email, String name, String rawPassword) {
        repo.findByEmail(email).ifPresent(u -> {
            throw new IllegalArgumentException("Email already registered");
        });

        User u = new User();
        u.setEmail(email);
        u.setName(name);
        u.setPasswordHash(encoder.encode(rawPassword));
        return repo.save(u);
    }



    @Override
    public User login(String email, String rawPassword) {
        User u = repo.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!encoder.matches(rawPassword, u.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        return u;
    }
}
