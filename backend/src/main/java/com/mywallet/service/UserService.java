package com.mywallet.service;



import com.mywallet.domain.User;

public interface UserService {
    User createOrGet(String email, String username);
    User getByEmail(String email);
}
