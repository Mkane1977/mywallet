package com.mywallet.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
    @NotBlank @Email
    public String email;

    @NotBlank @Size(min = 2, max = 50)
    public String name;

    @NotBlank @Size(min = 8, max = 72)
    public String password;
}
