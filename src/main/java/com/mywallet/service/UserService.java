package com.mywallet.service;



import com.mywallet.model.User;

public interface UserService {
    User createOrGet(String email, String username);
    User getByEmail(String email);
}
