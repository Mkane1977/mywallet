package com.mywallet.service;

import com.mywallet.domain.Category;
import com.mywallet.domain.Transaction;
import com.mywallet.domain.TransactionType;
import com.mywallet.domain.User;
import com.mywallet.dto.transaction.*;
import com.mywallet.exception.ApiException;
import com.mywallet.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository txns;
    private final CurrentUserService currentUser;
    private final CategoryService categoryService;

    public TransactionService(TransactionRepository txns,
                              CurrentUserService currentUser,
                              CategoryService categoryService) {
        this.txns = txns;
        this.currentUser = currentUser;
        this.categoryService = categoryService;
    }

    public List<TransactionResponse> listMine(Long userId, TransactionType type, Long categoryId,
                                              LocalDate start, LocalDate end) {
        User me = currentUser.requireUser(userId);

        boolean hasType = type != null;
        boolean hasCategory = categoryId != null;
        boolean hasDates = start != null && end != null;

        if (hasCategory && hasType && hasDates) {
            return txns.findAllByUserIdAndCategoryIdAndTypeAndDateBetweenOrderByDateDesc(me.getId(), categoryId, type, start, end)
                    .stream().map(this::toResponse).toList();
        }
        if (hasCategory && hasDates) {
            return txns.findAllByUserIdAndCategoryIdAndDateBetweenOrderByDateDesc(me.getId(), categoryId, start, end)
                    .stream().map(this::toResponse).toList();
        }
        if (hasType && hasDates) {
            return txns.findAllByUserIdAndTypeAndDateBetweenOrderByDateDesc(me.getId(), type, start, end)
                    .stream().map(this::toResponse).toList();
        }
        if (hasDates) {
            return txns.findAllByUserIdAndDateBetweenOrderByDateDesc(me.getId(), start, end)
                    .stream().map(this::toResponse).toList();
        }
        if (hasCategory && hasType) {
            return txns.findAllByUserIdAndCategoryIdAndTypeOrderByDateDesc(me.getId(), categoryId, type)
                    .stream().map(this::toResponse).toList();
        }
        if (hasCategory) {
            return txns.findAllByUserIdAndCategoryIdOrderByDateDesc(me.getId(), categoryId)
                    .stream().map(this::toResponse).toList();
        }
        if (hasType) {
            return txns.findAllByUserIdAndTypeOrderByDateDesc(me.getId(), type)
                    .stream().map(this::toResponse).toList();
        }

        return txns.findAllByUserIdOrderByDateDesc(me.getId())
                .stream().map(this::toResponse).toList();
    }

    public TransactionResponse getMine(Long userId, Long id) {
        User me = currentUser.requireUser(userId);
        Transaction t = txns.findByIdAndUserId(id, me.getId())
                .orElseThrow(() -> new ApiException(404, "Transaction not found"));
        return toResponse(t);
    }

    @Transactional
    public TransactionResponse createMine(Long userId, TransactionCreateRequest req) {
        User me = currentUser.requireUser(userId);
        Category cat = categoryService.requireMyCategory(userId, req.categoryId);

        Transaction t = new Transaction();
        t.setAmount(req.amount);
        t.setType(req.type);
        t.setDate(req.date);
        t.setDescription(req.description.trim());
        t.setCategory(cat);
        t.setUser(me);

        return toResponse(txns.save(t));
    }

    @Transactional
    public TransactionResponse updateMine(Long userId, Long id, TransactionUpdateRequest req) {
        User me = currentUser.requireUser(userId);

        Transaction t = txns.findByIdAndUserId(id, me.getId())
                .orElseThrow(() -> new ApiException(404, "Transaction not found"));

        Category cat = categoryService.requireMyCategory(userId, req.categoryId);

        t.setAmount(req.amount);
        t.setType(req.type);
        t.setDate(req.date);
        t.setDescription(req.description.trim());
        t.setCategory(cat);

        return toResponse(t);
    }

    @Transactional
    public void deleteMine(Long userId, Long id) {
        User me = currentUser.requireUser(userId);
        Transaction t = txns.findByIdAndUserId(id, me.getId())
                .orElseThrow(() -> new ApiException(404, "Transaction not found"));
        txns.delete(t);
    }

    private TransactionResponse toResponse(Transaction t) {
        return new TransactionResponse(
                t.getId(),
                t.getAmount(),
                t.getType(),
                t.getDate(),
                t.getDescription(),
                t.getCategory().getId(),
                t.getCategory().getName()
        );
    }
}