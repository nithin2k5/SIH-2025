package com.college.erp.config;

import com.college.erp.entity.Student;
import com.college.erp.entity.User;
import com.college.erp.repository.StudentRepository;
import com.college.erp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            initializeUsers();
        }

        if (studentRepository.count() == 0) {
            initializeStudents();
        }
    }

    private void initializeUsers() {
        User admin = new User("ADMIN001", "admin@college.edu",
            passwordEncoder.encode("admin123"), "John", "Administrator", User.UserRole.ADMIN);

        User staff = new User("STAFF001", "admissions@college.edu",
            passwordEncoder.encode("staff123"), "Michael", "Thompson", User.UserRole.STAFF);

        User student = new User("STUDENT001", "john.doe@college.edu",
            passwordEncoder.encode("student123"), "John", "Doe", User.UserRole.STUDENT);

        userRepository.save(admin);
        userRepository.save(staff);
        userRepository.save(student);
    }

    private void initializeStudents() {
        Student student1 = new Student("STUDENT001", "John", "Doe", "john.doe@college.edu", "Computer Science", 3);
        Student student2 = new Student("STUDENT002", "Jane", "Smith", "jane.smith@college.edu", "Electrical Engineering", 2);

        studentRepository.save(student1);
        studentRepository.save(student2);
    }
}