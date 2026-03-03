package com.mywallet.service;

import com.mywallet.domain.Category;
import com.mywallet.domain.TransactionType;
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
                .map(c -> new CategoryResponse(c.getId(), c.getName(), c.getDescription(), c.getType()))
                .toList();
    }

    public CategoryResponse getMine(Long userId, Long id) {
        User me = currentUser.requireUser(userId);
        Category c = categories.findByIdAndUserId(id, me.getId())
                .orElseThrow(() -> new ApiException(404, "Category not found"));
        return new CategoryResponse(c.getId(), c.getName(), c.getDescription(), c.getType());
    }

    @Transactional
    public CategoryResponse createMine(Long userId, CategoryCreateRequest req) {
        User me = currentUser.requireUser(userId);

        String name = req.name == null ? "" : req.name.trim();
        if (name.isEmpty()) throw new ApiException(400, "Category name is required.");

        String type = normalizeType(req.type);

        // uniqueness type (Income "Salary" and Expense "Salary" could exist )
        if (categories.existsByUserIdAndNameIgnoreCaseAndTypeIgnoreCase(me.getId(), name, type)) {
            throw new ApiException(409, "Category already exists: " + name);
        }

        Category c = new Category();
        c.setName(name);
        c.setDescription(cleanOptional(req.description));
        c.setUser(me);
        c.setType(type);
        c.setArchived(false);

        Category saved = categories.save(c);
        return new CategoryResponse(saved.getId(), saved.getName(), saved.getDescription(), saved.getType());
    }

    @Transactional
    public CategoryResponse updateMine(Long userId, Long id, CategoryUpdateRequest req) {
        User me = currentUser.requireUser(userId);

        Category c = categories.findByIdAndUserId(id, me.getId())
                .orElseThrow(() -> new ApiException(404, "Category not found"));

        String newName = req.name == null ? "" : req.name.trim();
        if (newName.isEmpty()) throw new ApiException(400, "Category name is required.");

        String newType = normalizeType(req.type);



        boolean nameChanged = !c.getName().equalsIgnoreCase(newName);
        boolean typeChanged = c.getType() == null || !c.getType().equalsIgnoreCase(newType);

        if ((nameChanged || typeChanged)
                && categories.existsByUserIdAndNameIgnoreCaseAndTypeIgnoreCase(me.getId(), newName, newType)) {
            throw new ApiException(409, "Category already exists: " + newName);
        }

        c.setName(newName);
        c.setDescription(cleanOptional(req.description));
        c.setType(newType);

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

    // ============================================================
    // used by CSV import (find or create by name + type)
    // ============================================================
    @Transactional
    public Category findOrCreateMyCategoryByNameAndType(Long userId, String nameRaw, TransactionType typeEnum) {
        User me = currentUser.requireUser(userId);

        String name = (nameRaw == null) ? "" : nameRaw.trim();
        if (name.isEmpty()) name = "Uncategorized";


        String finalName = name;
        return categories.findByUserIdAndNameIgnoreCase(me.getId(), name)
                .orElseGet(() -> {
                    Category c = new Category();
                    c.setUser(me);
                    c.setName(finalName);
                    c.setDescription(null);
                    c.setType(typeEnum == null ? "EXPENSE" : typeEnum.name());
                    c.setArchived(false);
                    return categories.save(c);
                });
    }

    private static String cleanOptional(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private static String normalizeType(String type) {
        String t = (type == null) ? "" : type.trim().toUpperCase();
        if (t.equals("INCOME") || t.equals("EXPENSE")) return t;
        // default to EXPENSE if missing/invalid
        return "EXPENSE";
    }
}