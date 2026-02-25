package com.mywallet.service;

import com.mywallet.domain.User;
import com.mywallet.exception.ApiException;
import com.mywallet.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    private final UserRepository users;

    public CurrentUserService(UserRepository users) {
        this.users = users;
    }

    public User requireUser(Long userId) {
        if (userId == null) throw new ApiException(400, "Missing X-USER-ID header");
        return users.findById(userId)
                .orElseThrow(() -> new ApiException(401, "User not found: " + userId));
    }
}