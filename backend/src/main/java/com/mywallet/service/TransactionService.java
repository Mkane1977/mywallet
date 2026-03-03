package com.mywallet.service;

import com.mywallet.domain.Category;
import com.mywallet.domain.Transaction;
import com.mywallet.domain.TransactionType;
import com.mywallet.domain.User;
import com.mywallet.dto.dashboard.RecentTransactionResponse;
import com.mywallet.dto.transaction.*;
import com.mywallet.dto.transaction.importing.CsvImportConfirmRequest;
import com.mywallet.dto.transaction.importing.CsvImportPreviewResponse;
import com.mywallet.dto.transaction.importing.CsvImportPreviewRow;
import com.mywallet.exception.ApiException;
import com.mywallet.repository.TransactionRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

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


    public List<RecentTransactionResponse> recent(
            Long userId,
            int limit,
            Long categoryId,
            TransactionType type,
            LocalDate start,
            LocalDate end,
            String sort,
            String dir
    ) {
        User me = currentUser.requireUser(userId);


        if (start != null && end == null) end = start;
        if (end != null && start == null) start = end;
        if (start != null && end != null && start.isAfter(end)) {
            LocalDate tmp = start; start = end; end = tmp;
        }

        boolean hasRange = (start != null && end != null);


        String sortProp = switch (sort == null ? "" : sort.toLowerCase()) {
            case "date" -> "date";
            case "amount" -> "amount";
            case "type" -> "type";
            case "category" -> "category.name";
            default -> "date";
        };

        Sort.Direction direction = "asc".equalsIgnoreCase(dir) ? Sort.Direction.ASC : Sort.Direction.DESC;


        Sort s = Sort.by(direction, sortProp).and(Sort.by(Sort.Direction.DESC, "id"));
        int safeLimit = Math.max(1, Math.min(limit, 200));
        Pageable pageable = PageRequest.of(0, safeLimit, s);

        Page<Transaction> page;

        if (categoryId != null && type != null && hasRange) {
            page = txns.findByUserIdAndCategoryIdAndTypeAndDateBetween(me.getId(), categoryId, type, start, end, pageable);
        } else if (categoryId != null && type != null) {
            page = txns.findByUserIdAndCategoryIdAndType(me.getId(), categoryId, type, pageable);
        } else if (categoryId != null && hasRange) {
            page = txns.findByUserIdAndCategoryIdAndDateBetween(me.getId(), categoryId, start, end, pageable);
        } else if (categoryId != null) {
            page = txns.findByUserIdAndCategoryId(me.getId(), categoryId, pageable);
        } else if (type != null && hasRange) {
            page = txns.findByUserIdAndTypeAndDateBetween(me.getId(), type, start, end, pageable);
        } else if (type != null) {
            page = txns.findByUserIdAndType(me.getId(), type, pageable);
        } else if (hasRange) {
            page = txns.findByUserIdAndDateBetween(me.getId(), start, end, pageable);
        } else {
            page = txns.findByUserId(me.getId(), pageable);
        }

        return page.getContent().stream()
                .map(t -> new RecentTransactionResponse(
                        t.getId(),
                        t.getDate(),
                        t.getType(),
                        t.getAmount(),
                        t.getCategory().getId(),
                        t.getCategory().getName(),
                        t.getDescription()
                ))
                .toList();
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
        if (req.description != null) {
            t.setDescription(req.description.trim());
        } else {
            t.setDescription(null);
        }
        t.setCategory(cat);
        t.setUser(me);

        return toResponse(txns.save(t));
    }

    public CsvImportPreviewResponse previewCsvImport(Long userId, MultipartFile file, boolean skipPending) {
        User me = currentUser.requireUser(userId);

        if (file == null || file.isEmpty()) {
            throw new ApiException(400, "CSV file is required.");
        }

        CsvImportPreviewResponse out = new CsvImportPreviewResponse();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)
        )) {
            Iterable<CSVRecord> records = CSVFormat.DEFAULT.builder()
                    .setHeader()
                    .setSkipHeaderRecord(true)
                    .setIgnoreHeaderCase(true)
                    .setTrim(true)
                    .build()
                    .parse(reader);

            int skipped = 0;
            int duplicates = 0;
            int parsed = 0;
            int total = 0;

            for (CSVRecord r : records) {
                total++;

                try {
                    CsvImportPreviewRow row = parseCsvRow(r, skipPending);
                    if (row == null) {
                        skipped++;
                        continue;
                    }

                    // duplicate detection
                    String descKey = (row.description == null) ? "" : row.description.trim();

                    boolean dup = txns.existsDuplicate(
                            me.getId(),
                            java.time.LocalDate.parse(row.date, DateTimeFormatter.ISO_LOCAL_DATE),
                            row.amount,
                            row.type,
                            descKey
                    );

                    row.duplicate = dup;
                    if (dup) {
                        row.duplicateReason = "Same date, amount, type, description already exists";
                        row.selected = false; // default check box for :  do not import duplicates
                        duplicates++;
                    } else {
                        row.selected = true;
                    }

                    out.rows.add(row);
                    parsed++;

                } catch (Exception rowEx) {
                    skipped++;
                    out.errors.add("Row " + r.getRecordNumber() + ": " + rowEx.getMessage());
                }
            }

            out.totalRows = total;
            out.parsedRows = parsed;
            out.duplicates = duplicates;
            out.skipped = skipped;

        } catch (Exception e) {
            throw new ApiException(400, "Failed to preview CSV: " + e.getMessage());
        }

        return out;
    }

    @Transactional
    public TransactionImportResult confirmCsvImport(Long userId, CsvImportConfirmRequest req) {
        User me = currentUser.requireUser(userId);

        if (req == null || req.rows == null || req.rows.isEmpty()) {
            throw new ApiException(400, "No rows to import.");
        }

        int imported = 0;
        int skipped = 0;
        int duplicates = 0;
        ArrayList<String> errors = new ArrayList<>();

        for (CsvImportPreviewRow row : req.rows) {
            try {
                if (row == null) { skipped++; continue; }
                if (!row.selected) { skipped++; continue; }

                // Validate required fields
                if (row.date == null || row.date.isBlank()) throw new IllegalArgumentException("Missing date");
                if (row.amount == null) throw new IllegalArgumentException("Missing amount");
                if (row.type == null) throw new IllegalArgumentException("Missing type");

                java.time.LocalDate date = java.time.LocalDate.parse(row.date, DateTimeFormatter.ISO_LOCAL_DATE);
                BigDecimal amount = row.amount;
                TransactionType type = row.type;

                String desc = clean(row.description);
                String descKey = (desc == null) ? "" : desc; // duplicate compare key

                // check duplicates
                boolean dup = txns.existsDuplicate(me.getId(), date, amount, type, descKey);
                if (dup) {
                    duplicates++;
                    if (req.skipDuplicates) {
                        skipped++;
                        continue;
                    }
                }


                String catName = clean(row.categoryName);
                if (catName == null) catName = "Uncategorized";

                Category cat = categoryService.findOrCreateMyCategoryByNameAndType(userId, catName, type);

                Transaction t = new Transaction();
                t.setUser(me);
                t.setCategory(cat);
                t.setType(type);
                t.setDate(date);
                t.setAmount(amount);


                t.setDescription(desc);

                txns.save(t);
                imported++;

            } catch (Exception ex) {
                skipped++;
                errors.add("Row " + row.rowNumber + ": " + ex.getMessage());
            }
        }

        TransactionImportResult result = new TransactionImportResult();
        result.imported = imported;
        result.skipped = skipped;
        result.duplicates = duplicates;
        result.errors = errors;
        return result;
    }

    private CsvImportPreviewRow parseCsvRow(CSVRecord r, boolean skipPending) {
        CsvImportPreviewRow row = new CsvImportPreviewRow();
        row.rowNumber = r.getRecordNumber();

        String status = get(r, "Status");
        String dateStr = get(r, "Date");
        String amountStr = get(r, "Amount");

        // Skip pending
        if (skipPending && status != null && status.equalsIgnoreCase("Pending")) {
            return null;
        }

        BigDecimal rawAmount = parseAmount(amountStr);
        if (rawAmount.compareTo(BigDecimal.ZERO) == 0) return null;

        TransactionType type = rawAmount.signum() < 0 ? TransactionType.EXPENSE : TransactionType.INCOME;
        BigDecimal amount = rawAmount.abs();

        String currency = clean(get(r, "Currency"));
        String accountName = clean(get(r, "Account Name"));

        String csvCategory = clean(get(r, "Category"));

        String userDesc = clean(get(r, "User Description"));
        String simpleDesc = clean(get(r, "Simple Description"));
        String originalDesc = clean(get(r, "Original Description"));
        String memo = clean(get(r, "Memo"));

        String desc = firstNonBlank(userDesc, simpleDesc, originalDesc);
        desc = clean(desc);

        // Optionally append memo  120 chars
        if (memo != null && !memo.isBlank()) {
            String combined = (desc == null ? "" : desc);
            if (!combined.isBlank()) combined += " — ";
            combined += memo;
            desc = truncate(clean(combined), 120);
        } else {
            desc = truncate(desc, 120);
        }

        java.time.LocalDate date = parseDate(dateStr);

        row.status = status;
        row.currency = currency;
        row.accountName = accountName;

        row.date = date.format(DateTimeFormatter.ISO_LOCAL_DATE);
        row.type = type;
        row.amount = amount;

        row.categoryName = (csvCategory == null ? "Uncategorized" : csvCategory);
        row.description = desc;

        return row;
    }

    private static String get(CSVRecord r, String header) {
        try {
            return r.isMapped(header) ? r.get(header) : null;
        } catch (Exception e) {
            return null;
        }
    }

    private static String firstNonBlank(String... vals) {
        for (String v : vals) {
            if (v != null && !v.trim().isEmpty()) return v;
        }
        return null;
    }

    private static String clean(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private static String truncate(String s, int max) {
        if (s == null) return null;
        if (s.length() <= max) return s;
        return s.substring(0, max);
    }

    private static BigDecimal parseAmount(String s) {
        if (s == null) throw new IllegalArgumentException("Missing Amount");
        String t = s.trim();

        t = t.replace("$", "").replace(",", "");

        if (t.startsWith("(") && t.endsWith(")")) {
            t = "-" + t.substring(1, t.length() - 1);
        }

        return new BigDecimal(t);
    }

    private static java.time.LocalDate parseDate(String s) {
        if (s == null) throw new IllegalArgumentException("Missing Date");
        String t = s.trim();

        try {
            return java.time.LocalDate.parse(t, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (DateTimeParseException ignored) {}

        DateTimeFormatter mdyyyy = DateTimeFormatter.ofPattern("M/d/yyyy", Locale.US);
        try {
            return java.time.LocalDate.parse(t, mdyyyy);
        } catch (DateTimeParseException ignored) {}

        DateTimeFormatter mDash = DateTimeFormatter.ofPattern("M-d-yyyy", Locale.US);
        return java.time.LocalDate.parse(t, mDash);
    }

    @Transactional
    public TransactionResponse updateMine(Long userId, Long id, TransactionUpdateRequest req) {
        User me = currentUser.requireUser(userId);
        if (req.categoryId == null) throw new ApiException(400, "Category is required.");
        if (req.amount == null) throw new ApiException(400, "Amount is required.");
        if (req.type == null) throw new ApiException(400, "Type is required.");
        if (req.date == null) throw new ApiException(400, "Date is required.");

        Transaction t = txns.findByIdAndUserId(id, me.getId())
                .orElseThrow(() -> new ApiException(404, "Transaction not found"));

        Category cat = categoryService.requireMyCategory(userId, req.categoryId);

        t.setAmount(req.amount);
        t.setType(req.type);
        t.setDate(req.date);

        String desc = (req.description == null) ? null : req.description.trim();
        t.setDescription((desc == null || desc.isEmpty()) ? null : desc);

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