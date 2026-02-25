package com.mywallet.service;

import com.mywallet.domain.Category;
import com.mywallet.domain.User;
import com.mywallet.dto.category.*;
import com.mywallet.exception.ApiException;
import com.mywallet.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categories;
    private final CurrentUserService currentUser;

    public CategoryService(CategoryRepository categories, CurrentUserService currentUser) {
        this.categories = categories;
        this.currentUser = currentUser;
    }

    public List<CategoryResponse> listMine(Long userId) {
        User me = currentUser.requireUser(userId);
        return categories.findAllByUserIdOrderByNameAsc(me.getId()).stream()
                .map(c -> new CategoryResponse(c.getId(), c.getName(), c.getDescription()))
                .toList();
    }

    public CategoryResponse getMine(Long userId, Long id) {
        User me = currentUser.requireUser(userId);
        Category c = categories.findByIdAndUserId(id, me.getId())
                .orElseThrow(() -> new ApiException(404, "Category not found"));
        return new CategoryResponse(c.getId(), c.getName(), c.getDescription());
    }

    @Transactional
    public CategoryResponse createMine(Long userId, CategoryCreateRequest req) {
        User me = currentUser.requireUser(userId);

        if (categories.existsByUserIdAndNameIgnoreCase(me.getId(), req.name)) {
            throw new ApiException(409, "Category already exists: " + req.name);
        }

        Category c = new Category();
        c.setName(req.name.trim());
        c.setDescription(req.description);
        c.setUser(me);

        Category saved = categories.save(c);
        return new CategoryResponse(saved.getId(), saved.getName(), saved.getDescription());
    }

    @Transactional
    public CategoryResponse updateMine(Long userId, Long id, CategoryUpdateRequest req) {
        User me = currentUser.requireUser(userId);

        Category c = categories.findByIdAndUserId(id, me.getId())
                .orElseThrow(() -> new ApiException(404, "Category not found"));

        // name uniqueness per user
        categories.findByUserIdAndNameIgnoreCase(me.getId(), req.name)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> { throw new ApiException(409, "Category already exists: " + req.name); });

        c.setName(req.name.trim());
        c.setDescription(req.description);

        return new CategoryResponse(c.getId(), c.getName(), c.getDescription());
    }

    @Transactional
    public void deleteMine(Long userId, Long id) {
        User me = currentUser.requireUser(userId);
        Category c = categories.findByIdAndUserId(id, me.getId())
                .orElseThrow(() -> new ApiException(404, "Category not found"));
        categories.delete(c);
    }

    public Category requireMyCategory(Long userId, Long categoryId) {
        User me = currentUser.requireUser(userId);
        return categories.findByIdAndUserId(categoryId, me.getId())
                .orElseThrow(() -> new ApiException(404, "Category not found"));
    }
}