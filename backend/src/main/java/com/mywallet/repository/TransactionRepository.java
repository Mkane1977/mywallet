package com.mywallet.repository;

import com.mywallet.domain.Transaction;
import com.mywallet.domain.TransactionType;
import com.mywallet.dto.dashboard.CategorySpendingResponse;
import com.mywallet.dto.dashboard.RecentTransactionResponse;


import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    // To sort by date/amount/type/category server-side
    @EntityGraph(attributePaths = {"category"})
    Page<Transaction> findByUserId(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"category"})
    Page<Transaction> findByUserIdAndDateBetween(Long userId, LocalDate start, LocalDate end, Pageable pageable);

    @EntityGraph(attributePaths = {"category"})
    Page<Transaction> findByUserIdAndType(Long userId, TransactionType type, Pageable pageable);

    @EntityGraph(attributePaths = {"category"})
    Page<Transaction> findByUserIdAndTypeAndDateBetween(Long userId, TransactionType type, LocalDate start, LocalDate end, Pageable pageable);

    @EntityGraph(attributePaths = {"category"})
    Page<Transaction> findByUserIdAndCategoryId(Long userId, Long categoryId, Pageable pageable);

    @EntityGraph(attributePaths = {"category"})
    Page<Transaction> findByUserIdAndCategoryIdAndDateBetween(Long userId, Long categoryId, LocalDate start, LocalDate end, Pageable pageable);

    @EntityGraph(attributePaths = {"category"})
    Page<Transaction> findByUserIdAndCategoryIdAndType(Long userId, Long categoryId, TransactionType type, Pageable pageable);

    @EntityGraph(attributePaths = {"category"})
    Page<Transaction> findByUserIdAndCategoryIdAndTypeAndDateBetween(
            Long userId,
            Long categoryId,
            TransactionType type,
            LocalDate start,
            LocalDate end,
            Pageable pageable
    );


    // 1) SUMS — no date filters
    @Query("""
    select coalesce(sum(t.amount), 0)
    from Transaction t
    where t.user.id = :userId
      and t.type = :type
""")
    BigDecimal sumAmountByType(
            @Param("userId") Long userId,
            @Param("type") TransactionType type
    );

    // 2) SUMS — with date filters
    @Query("""
    select coalesce(sum(t.amount), 0)
    from Transaction t
    where t.user.id = :userId
      and t.type = :type
      and t.date >= :start
      and t.date <= :end
""")
    BigDecimal sumAmountByTypeInRange(
            @Param("userId") Long userId,
            @Param("type") TransactionType type,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );

    // 3) SPENDING — no date filters
    @Query("""
    select new com.mywallet.dto.dashboard.CategorySpendingResponse(
        c.id,
        c.name,
        coalesce(sum(t.amount), 0)
    )
    from Transaction t
    join t.category c
    where t.user.id = :userId
      and t.type = com.mywallet.domain.TransactionType.EXPENSE
    group by c.id, c.name
    order by coalesce(sum(t.amount), 0) desc
""")
    List<CategorySpendingResponse> spendingByCategory(
            @Param("userId") Long userId
    );

    // 4) SPENDING — with date filters
    @Query("""
    select new com.mywallet.dto.dashboard.CategorySpendingResponse(
        c.id,
        c.name,
        coalesce(sum(t.amount), 0)
    )
    from Transaction t
    join t.category c
    where t.user.id = :userId
      and t.type = com.mywallet.domain.TransactionType.EXPENSE
      and t.date >= :start
      and t.date <= :end
    group by c.id, c.name
    order by coalesce(sum(t.amount), 0) desc
""")
    List<CategorySpendingResponse> spendingByCategoryInRange(
            @Param("userId") Long userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );

    // 5) RECENT — no date filters
    @Query("""
    select new com.mywallet.dto.dashboard.RecentTransactionResponse(
        t.id, t.date, t.type, t.amount, c.id, c.name, t.description
    )
    from Transaction t
    join t.category c
    where t.user.id = :userId
    order by t.date desc, t.id desc
""")
    List<RecentTransactionResponse> recentForDashboard(
            @Param("userId") Long userId,
            Pageable pageable
    );

    // 6) RECENT — with date filters
    @Query("""
    select new com.mywallet.dto.dashboard.RecentTransactionResponse(
        t.id, t.date, t.type, t.amount, c.id, c.name, t.description
    )
    from Transaction t
    join t.category c
    where t.user.id = :userId
      and t.date >= :start
      and t.date <= :end
    order by t.date desc, t.id desc
""")
    List<RecentTransactionResponse> recentForDashboardInRange(
            @Param("userId") Long userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end,
            Pageable pageable
    );

    @Query("""
select (count(t) > 0)
from Transaction t
where t.user.id = :userId
  and t.date = :date
  and t.amount = :amount
  and t.type = :type
  and coalesce(t.description, '') = :description
""")
    boolean existsDuplicate(
            @Param("userId") Long userId,
            @Param("date") java.time.LocalDate date,
            @Param("amount") java.math.BigDecimal amount,
            @Param("type") com.mywallet.domain.TransactionType type,
            @Param("description") String description
    );

    boolean existsByUserIdAndDateAndAmountAndDescription(
            Long userId,
            LocalDate date,
            BigDecimal amount,
            String description
    );
}
