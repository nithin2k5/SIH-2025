package com.college.erp.service;

import com.college.erp.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Service
public class JwtService {

    private static final String SECRET = "college-erp-secret-key-for-jwt-tokens-that-should-be-at-least-256-bits-long";
    private static final long EXPIRATION_TIME = 86400000; // 24 hours

    private final Set<String> invalidatedTokens = new HashSet<>();

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    public String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + EXPIRATION_TIME);

        return Jwts.builder()
                .setSubject(user.getUserId())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .claim("firstName", user.getFirstName())
                .claim("lastName", user.getLastName())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        return claims.getSubject();
    }

    public boolean isTokenValid(String token) {
        try {
            if (invalidatedTokens.contains(token)) {
                return false;
            }

            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public void invalidateToken(String token) {
        invalidatedTokens.add(token);
    }
}
