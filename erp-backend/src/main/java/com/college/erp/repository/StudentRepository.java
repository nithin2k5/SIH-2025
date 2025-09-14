package com.college.erp.repository;

import com.college.erp.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByStudentId(String studentId);

    Optional<Student> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByStudentId(String studentId);

    List<Student> findByProgramme(String programme);

    List<Student> findBySemester(Integer semester);

    List<Student> findByStatus(Student.StudentStatus status);
}