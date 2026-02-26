package com.mywallet.repository;

import com.mywallet.domain.Transaction;
import com.mywallet.domain.TransactionType;
import com.mywallet.dto.dashboard.CategorySpendingResponse;
import com.mywallet.dto.dashboard.RecentTransactionResponse;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;

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

    // Sum by type income/expense with optional date range
    @Query("""
        select coalesce(sum(t.amount), 0)
        from Transaction t
        where t.user.id = :userId
          and t.type = :type
          and (:start is null or t.date >= :start)
          and (:end is null or t.date <= :end)
    """)
    BigDecimal sumAmountByType(
            @Param("userId") Long userId,
            @Param("type") TransactionType type,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );
    // Spending by category  for chart
    @SuppressWarnings("JpaQlInspection")
    @Query("""
    select new CategorySpendingResponse(
        c.id,
        c.name,
        coalesce(sum(t.amount), java.math.BigDecimal.ZERO)
    )
    from Transaction t
    join t.category c
    where t.user.id = :userId
      and t.type = com.mywallet.domain.TransactionType.EXPENSE
      and (:start is null or t.date >= :start)
      and (:end is null or t.date <= :end)
    group by c.id, c.name
    order by coalesce(sum(t.amount), java.math.BigDecimal.ZERO) desc
""")
    List<CategorySpendingResponse> spendingByCategory(
            @Param("userId") Long userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );


    // Recent transactions list
    @Query("""
    select new com.mywallet.dto.dashboard.RecentTransactionResponse(
        t.id, t.date, t.type, t.amount, c.id, c.name, t.description
    )
    from Transaction t
    join t.category c
    where t.user.id = :userId
      and (:start is null or t.date >= :start)
      and (:end is null or t.date <= :end)
    order by t.date desc, t.id desc
""")
    List<RecentTransactionResponse> recentForDashboard(
            @Param("userId") Long userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end,
            Pageable pageable
    );
}
