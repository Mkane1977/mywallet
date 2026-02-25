package com.mywallet.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CategoryCreateRequest {
    @NotBlank
    @Size(max = 60)
    public String name;

    @Size(max = 120)
    public String description;
}