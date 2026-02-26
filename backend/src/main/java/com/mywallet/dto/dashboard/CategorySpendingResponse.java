package com.mywallet.dto.dashboard;

import java.math.BigDecimal;

public record CategorySpendingResponse(
        Long id,
        String name,
        BigDecimal total
) {}