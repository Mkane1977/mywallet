package com.mywallet.controller;

import com.mywallet.dto.category.*;
import com.mywallet.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService service;

    public CategoryController(CategoryService service) {
        this.service = service;
    }

    @GetMapping
    public List<CategoryResponse> listMine(@RequestHeader("X-USER-ID") Long userId) {
        return service.listMine(userId);
    }

    @GetMapping("/{id}")
    public CategoryResponse getMine(@RequestHeader("X-USER-ID") Long userId, @PathVariable Long id) {
        return service.getMine(userId, id);
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> createMine(
            @RequestHeader("X-USER-ID") Long userId,
            @Valid @RequestBody CategoryCreateRequest req
    ) {
        CategoryResponse created = service.createMine(userId, req);
        return ResponseEntity.created(URI.create("/api/categories/" + created.id)).body(created);
    }

    @PutMapping("/{id}")
    public CategoryResponse updateMine(
            @RequestHeader("X-USER-ID") Long userId,
            @PathVariable Long id,
            @Valid @RequestBody CategoryUpdateRequest req
    ) {
        return service.updateMine(userId, id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMine(@RequestHeader("X-USER-ID") Long userId, @PathVariable Long id) {
        service.deleteMine(userId, id);
        return ResponseEntity.noContent().build();
    }
}