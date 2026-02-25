package com.mywallet.repository;

import com.mywallet.domain.Transaction;
import com.mywallet.domain.TransactionType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @EntityGraph(attributePaths = {"category"})
    List<Transaction> findAllByUserIdOrderByDateDesc(Long userId);

    @EntityGraph(attributePaths = {"category"})
    Optional<Transaction> findByIdAndUserId(Long id, Long userId);

    @EntityGraph(attributePaths = {"category"})
    List<Transaction> findAllByUserIdAndTypeOrderByDateDesc(Long userId, TransactionType type);

    @EntityGraph(attributePaths = {"category"})
    List<Transaction> findAllByUserIdAndDateBetweenOrderByDateDesc(Long userId, LocalDate start, LocalDate end);

    @EntityGraph(attributePaths = {"category"})
    List<Transaction> findAllByUserIdAndTypeAndDateBetweenOrderByDateDesc(
            Long userId, TransactionType type, LocalDate start, LocalDate end
    );

    @EntityGraph(attributePaths = {"category"})
    List<Transaction> findAllByUserIdAndCategoryIdOrderByDateDesc(Long userId, Long categoryId);

    @EntityGraph(attributePaths = {"category"})
    List<Transaction> findAllByUserIdAndCategoryIdAndDateBetweenOrderByDateDesc(
            Long userId, Long categoryId, LocalDate start, LocalDate end
    );

    @EntityGraph(attributePaths = {"category"})
    List<Transaction> findAllByUserIdAndCategoryIdAndTypeOrderByDateDesc(
            Long userId, Long categoryId, TransactionType type
    );

    @EntityGraph(attributePaths = {"category"})
    List<Transaction> findAllByUserIdAndCategoryIdAndTypeAndDateBetweenOrderByDateDesc(
            Long userId, Long categoryId, TransactionType type, LocalDate start, LocalDate end
    );
}