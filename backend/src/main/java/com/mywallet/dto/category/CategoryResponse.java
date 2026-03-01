package com.mywallet.dto.category;

public class CategoryResponse {
    public Long id;
    public String name;
    public String description;
    public String type;

    public CategoryResponse(Long id, String name, String description, String type) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.type = type;

    }
}