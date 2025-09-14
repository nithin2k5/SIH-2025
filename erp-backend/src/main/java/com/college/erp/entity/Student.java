package com.college.erp.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", unique = true, nullable = false)
    @NotBlank(message = "Student ID is required")
    private String studentId;

    @Column(name = "first_name", nullable = false)
    @NotBlank(message = "First name is required")
    private String firstName;

    @Column(name = "last_name", nullable = false)
    @NotBlank(message = "Last name is required")
    private String lastName;

    @Column(name = "email", unique = true, nullable = false)
    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "programme", nullable = false)
    @NotBlank(message = "Programme is required")
    private String programme;

    @Column(name = "semester", nullable = false)
    private Integer semester;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private StudentStatus status = StudentStatus.ACTIVE;

    @Column(name = "gpa")
    private Double gpa;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum StudentStatus {
        ACTIVE, INACTIVE, GRADUATED, SUSPENDED, WITHDRAWN
    }

    // Default constructor
    public Student() {}

    // Constructor for initialization
    public Student(String studentId, String firstName, String lastName, String email, String programme, Integer semester) {
        this.studentId = studentId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.programme = programme;
        this.semester = semester;
        this.status = StudentStatus.ACTIVE;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getProgramme() { return programme; }
    public void setProgramme(String programme) { this.programme = programme; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public StudentStatus getStatus() { return status; }
    public void setStatus(StudentStatus status) { this.status = status; }

    public Double getGpa() { return gpa; }
    public void setGpa(Double gpa) { this.gpa = gpa; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Helper methods
    public String getFullName() {
        return firstName + " " + lastName;
    }

    public boolean isActive() {
        return status == StudentStatus.ACTIVE;
    }
}