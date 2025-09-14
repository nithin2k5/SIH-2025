package com.college.erp.service;

import com.college.erp.entity.User;
import com.college.erp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    public Optional<User> authenticate(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                return Optional.of(user);
            }
        }

        return Optional.empty();
    }

    public Map<String, Object> generateAuthResponse(User user) {
        String token = jwtService.generateToken(user);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("user", Map.of(
            "id", user.getUserId(),
            "email", user.getEmail(),
            "role", user.getRole(),
            "firstName", user.getFirstName(),
            "lastName", user.getLastName(),
            "fullName", user.getFullName()
        ));
        response.put("token", token);

        return response;
    }

    public void logout(String token) {
        jwtService.invalidateToken(token);
    }

    public boolean isTokenValid(String token) {
        return jwtService.isTokenValid(token);
    }
}
