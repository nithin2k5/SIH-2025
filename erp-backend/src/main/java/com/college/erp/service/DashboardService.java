package com.college.erp.service;

import com.college.erp.repository.StudentRepository;
import com.college.erp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // Basic statistics
        stats.put("totalStudents", studentRepository.count());
        stats.put("activeStudents", studentRepository.findByStatus(com.college.erp.entity.Student.StudentStatus.ACTIVE).size());
        stats.put("totalUsers", userRepository.count());

        return stats;
    }

    public Map<String, Object> getSystemHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("database", "CONNECTED");
        health.put("timestamp", java.time.LocalDateTime.now());

        return health;
    }
}