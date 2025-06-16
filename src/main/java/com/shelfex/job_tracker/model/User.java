package com.shelfex.job_tracker.model;
import com.shelfex.job_tracker.model.Role;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data // includes @Getter, @Setter, @ToString, @EqualsAndHashCode, and @RequiredArgsConstructor
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @Column(unique = true, nullable = false)
    private String email;



    @Column(nullable = false)
    private String password;
    @Enumerated(EnumType.STRING)
    private Role role;

    //private String role = "USER"; // Optional: USER or ADMIN
}
