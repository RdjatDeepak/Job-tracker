package com.shelfex.job_tracker.controller;

import com.shelfex.job_tracker.dto.JobApplicationDTO;
import com.shelfex.job_tracker.model.JobApplication;
import com.shelfex.job_tracker.model.User;
import com.shelfex.job_tracker.repository.JobApplicationRepository;
import com.shelfex.job_tracker.repository.UserRepository;
import com.shelfex.job_tracker.service.EmailService;
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

    @Autowired
    private EmailService emailService;

    // Helper methods
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

    @PostMapping
    public ResponseEntity<?> addJob(@RequestBody JobApplicationDTO jobDTO, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepo.findByEmail(email).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("User not found");

        JobApplication job = toEntity(jobDTO, user);
        JobApplication saved = jobRepo.save(job);

        // ✅ Send email after add
        String subject = "📥 New Job Application Added";
        String body = "Hi " + user.getName() + ",\n\nYou have successfully added the job application for: " + job.getPosition() + " at " + job.getCompany() + ".";
        emailService.sendEmail(user.getEmail(), subject, body);

        return ResponseEntity.ok(toDTO(saved));
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

                    JobApplication updated = jobRepo.save(job);

                    // 🛠 Send email after update
                    String subject = "🛠 Job Application Updated";
                    String body = "Hi " + user.getName() + ",\n\nYour job application for \"" + job.getPosition() + "\" at " + job.getCompany() + " has been updated.";
                    emailService.sendEmail(user.getEmail(), subject, body);

                    return ResponseEntity.ok(toDTO(updated));
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

                    // ❌ Send email before delete
                    String subject = "❌ Job Application Deleted";
                    String body = "Hi " + user.getName() + ",\n\nYour job application for \"" + job.getPosition() + "\" at " + job.getCompany() + " has been deleted.";
                    emailService.sendEmail(user.getEmail(), subject, body);

                    jobRepo.delete(job);
                    return ResponseEntity.ok("Job deleted successfully");
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
