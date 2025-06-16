package com.shelfex.job_tracker.controller;

import com.shelfex.job_tracker.dto.JobApplicationDTO;
import com.shelfex.job_tracker.model.JobApplication;
import com.shelfex.job_tracker.model.User;
import com.shelfex.job_tracker.repository.JobApplicationRepository;
import com.shelfex.job_tracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jobs")
public class JobApplicationController {

    @Autowired
    private JobApplicationRepository jobRepo;

    @Autowired
    private UserRepository userRepo;

    // Helper methods to map between DTO and Entity
    private JobApplicationDTO toDTO(JobApplication job) {
        return JobApplicationDTO.builder()
                .id(job.getId())
                .company(job.getCompany())
                .position(job.getPosition())
                .status(job.getStatus())
                .appliedDate(job.getAppliedDate())
                .notes(job.getNotes())
                .userId(job.getUser().getId())
                .build();
    }

    private JobApplication toEntity(JobApplicationDTO dto, User user) {
        return JobApplication.builder()
                .id(dto.getId())
                .company(dto.getCompany())
                .position(dto.getPosition())
                .status(dto.getStatus())
                .appliedDate(dto.getAppliedDate())
                .notes(dto.getNotes())
                .user(user)
                .build();
    }

    // Get all jobs for the authenticated user
    @GetMapping
    public ResponseEntity<?> getUserJobs(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepo.findByEmail(email).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("User not found");
        List<JobApplicationDTO> jobs = jobRepo.findByUser(user)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(jobs);
    }

    // Add a new job
    @PostMapping
    public ResponseEntity<?> addJob(@RequestBody JobApplicationDTO jobDTO, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepo.findByEmail(email).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("User not found");

        JobApplication job = toEntity(jobDTO, user);
        return ResponseEntity.ok(toDTO(jobRepo.save(job)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateJob(@PathVariable Long id, @RequestBody JobApplicationDTO jobDTO, Authentication auth) {
        String email = auth.getName();
        User user = userRepo.findByEmail(email).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("User not found");

        return jobRepo.findById(id)
                .map(job -> {
                    if (!job.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.status(403).body("Unauthorized");
                    }
                    job.setCompany(jobDTO.getCompany());
                    job.setPosition(jobDTO.getPosition());
                    job.setStatus(jobDTO.getStatus());
                    job.setAppliedDate(jobDTO.getAppliedDate());
                    job.setNotes(jobDTO.getNotes());
                    return ResponseEntity.ok(toDTO(jobRepo.save(job)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id, Authentication auth) {
        String email = auth.getName();
        User user = userRepo.findByEmail(email).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("User not found");

        return jobRepo.findById(id)
                .map(job -> {
                    if (!job.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.status(403).body("Unauthorized");
                    }
                    jobRepo.delete(job);
                    return ResponseEntity.ok("Job deleted successfully");
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
