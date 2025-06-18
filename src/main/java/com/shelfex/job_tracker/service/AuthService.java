package com.shelfex.job_tracker.service;

import com.shelfex.job_tracker.dto.*;
import com.shelfex.job_tracker.model.Role;
import com.shelfex.job_tracker.model.User;
import com.shelfex.job_tracker.repository.UserRepository;
import com.shelfex.job_tracker.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Transactional
    public String register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);

        userRepository.saveAndFlush(user);
        System.out.println(">> Email check: " + request.getEmail());
        System.out.println(">> Is present: " + userRepository.findByEmail(request.getEmail()).isPresent());

        // Send welcome email
        String subject = "🎉 Welcome to ShelfEx Job Tracker";
        String body = "Hi " + user.getName() + ",\n\nThank you for registering on ShelfEx Job Tracker!\nWe're excited to have you on board.";
        emailService.sendEmail(user.getEmail(), subject, body);

        return "User registered successfully!";
    }

    public AuthResponse login(AuthRequest request) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(), request.getPassword()
                )
        );
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String token = jwtUtil.generateToken(userDetails.getUsername());
        return new AuthResponse(token);
    }
}
