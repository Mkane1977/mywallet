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
                .map(c -> new CategoryResponse(c.getId(), c.getName(), c.getDescription(),c.getType()))
                .toList();
    }

    public CategoryResponse getMine(Long userId, Long id) {
        User me = currentUser.requireUser(userId);
        Category c = categories.findByIdAndUserId(id, me.getId())
                .orElseThrow(() -> new ApiException(404, "Category not found"));
        return new CategoryResponse(c.getId(), c.getName(), c.getDescription(),c.getType());
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
        c.setType("EXPENSE");
        c.setArchived(false);
        Category saved = categories.save(c);
        return new CategoryResponse(saved.getId(), saved.getName(), saved.getDescription(),saved.getType());
    }

    @Transactional
    public CategoryResponse updateMine(Long userId, Long id, CategoryUpdateRequest req) {
        User me = currentUser.requireUser(userId);

        Category c = categories.findByIdAndUserId(id, me.getId())
                .orElseThrow(() -> new ApiException(404, "Category not found"));

        String newName = req.name.trim();

        // optional uniqueness check that excludes current row
        if (!c.getName().equalsIgnoreCase(newName)
                && categories.existsByUserIdAndNameIgnoreCase(me.getId(), newName)) {
            throw new ApiException(409, "Category already exists: " + newName);
        }

        c.setName(newName);
        c.setDescription(req.description);
        c.setType(req.type.trim().toUpperCase());
        // archived unchanged unless you support it

        Category saved = categories.save(c);
        return new CategoryResponse(saved.getId(), saved.getName(), saved.getDescription(), saved.getType());
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