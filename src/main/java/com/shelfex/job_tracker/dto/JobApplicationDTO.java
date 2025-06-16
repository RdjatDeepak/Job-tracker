package com.shelfex.job_tracker.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplicationDTO {
    private Long id;
    private String company;
    private String position;
    private String status;
    private LocalDate appliedDate;
    private String notes;
    private Long userId;
}
