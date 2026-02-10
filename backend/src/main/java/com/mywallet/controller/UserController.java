package com.mywallet.controller;



import com.mywallet.domain.User;
import com.mywallet.service.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @PostMapping("/upsert")
    public User upsert(
            @RequestParam String email,
            @RequestParam String username
    ) {
        return service.createOrGet(email, username);
    }

    @GetMapping("/by-email")
    public User getByEmail(@RequestParam String email) {
        return service.getByEmail(email);
    }




}
