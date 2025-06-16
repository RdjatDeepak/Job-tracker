package com.shelfex.job_tracker.service;

import com.shelfex.job_tracker.dto.RegisterRequest;
import com.shelfex.job_tracker.model.Role;
import com.shelfex.job_tracker.model.User;
import com.shelfex.job_tracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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

        System.out.println("RegisterRequest name = " + request.getName());
        System.out.println("Built user = " + user);

        userRepository.saveAndFlush(user); //  Force INSERT immediately

        return "User registered successfully!";
    }
}
