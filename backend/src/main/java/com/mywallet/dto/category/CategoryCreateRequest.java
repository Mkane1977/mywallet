package com.mywallet.dto.category;

import com.mywallet.domain.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CategoryCreateRequest {
    @NotBlank
    @Size(max = 60)
    public String name;

    @Size(max = 120)
    public String description;

    @NotNull
    @Size(max = 20)
    public String type;


}

