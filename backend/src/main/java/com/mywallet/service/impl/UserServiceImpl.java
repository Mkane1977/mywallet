package com.mywallet.service.impl;



import com.mywallet.model.User;
import com.mywallet.repository.UserRepository;
import com.mywallet.service.UserService;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository repo;

    public UserServiceImpl(UserRepository repo) {
        this.repo = repo;
    }

    @Override
    public User createOrGet(String email, String username) {
        return repo.findByEmail(email)
                .orElseGet(() -> repo.save(new User(email, username)));
    }

    @Override
    public User getByEmail(String email) {
        return repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
