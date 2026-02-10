package com.mywallet.domain;


import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id@GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(nullable = false, unique = true)
    private String email;

    private String username;

    @Column(nullable = false)
    private Boolean enabled = true;

    public User() {}

    public User(String email, String username) {

        this.email = email;
        this.username = username;
    }

    // getters and setters

    public Long getId() {  return id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
}
