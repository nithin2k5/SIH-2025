# Next.js Frontend Development Rules & Best Practices

## Core Principles

### 1. Component Structure
- Always use functional components with hooks
- Use `'use client'` directive for components that need client-side features
- Keep components small and focused on a single responsibility
- Use proper TypeScript/JSDoc annotations for better code documentation

### 2. State Management
- Use `useState` for local component state
- Use `useContext` for global state that doesn't change frequently
- Use `useCallback` and `useMemo` to optimize re-renders
- Always include proper dependency arrays in `useEffect`

### 3. File Organization
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Route groups for organization
│   ├── dashboard/         # Feature-based directories
│   └── layout.js          # Root layout
├── components/            # Reusable components
│   ├── ui/               # Basic UI components
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── contexts/             # React contexts
├── hooks/                # Custom hooks
├── services/             # API and external service calls
├── utils/                # Utility functions
└── types/                # Type definitions
```

### 4. Styling Guidelines
- Use Tailwind CSS for all styling
- Prefer utility classes over custom CSS
- Use consistent color scheme (white and blue theme)
- Implement responsive design with mobile-first approach
- Use shadcn/ui components when available

### 5. Error Handling
- Always wrap async operations in try-catch blocks
- Provide meaningful error messages to users
- Use proper loading states during async operations
- Handle edge cases gracefully

### 6. Performance Best Practices
- Use `next/image` for all images
- Implement proper loading states
- Use `next/dynamic` for code splitting when needed
- Minimize client-side JavaScript bundle size
- Use server components when possible

### 7. Security Guidelines
- Never expose sensitive data in client-side code
- Validate all user inputs
- Use proper authentication and authorization
- Sanitize data before rendering
- Use HTTPS in production

### 8. Code Quality
- Use ESLint and Prettier for consistent code formatting
- Write descriptive variable and function names
- Add comments for complex logic
- Keep functions small and pure when possible
- Use proper error boundaries

## Specific Rules for This ERP System

### Authentication
- Remove all demo/mock authentication data in production
- Implement proper session management
- Use secure cookies for session storage
- Always validate user permissions on both client and server

### Data Management
- Replace all mock data with actual API calls
- Implement proper error handling for API failures
- Use loading states for all data fetching operations
- Cache data appropriately to improve performance

### UI Components
- Maintain consistent spacing using Tailwind's spacing scale
- Use blue (#3B82F6) as primary color and white as background
- Implement proper focus states for accessibility
- Ensure all forms have proper validation

### Navigation
- Use Next.js Link component for internal navigation
- Implement breadcrumbs for complex navigation hierarchies
- Provide clear visual feedback for active routes
- Handle protected routes properly

### Forms
- Use react-hook-form for all forms
- Implement proper validation with clear error messages
- Provide loading states during form submission
- Clear forms after successful submission

## Common Pitfalls to Avoid

1. **Hydration Mismatches**: Ensure server and client render the same content
2. **Memory Leaks**: Clean up event listeners and subscriptions in useEffect
3. **Infinite Re-renders**: Always include proper dependencies in useEffect
4. **SEO Issues**: Use proper meta tags and structured data
5. **Accessibility**: Ensure proper ARIA labels and keyboard navigation

## Development Workflow

1. Always run `npm run build` before committing changes
2. Fix all ESLint warnings and errors
3. Test components in different screen sizes
4. Verify proper error handling
5. Check for console errors and warnings

## Production Checklist

- [ ] Remove all console.log statements
- [ ] Remove all demo/mock data
- [ ] Implement proper error boundaries
- [ ] Add proper meta tags for SEO
- [ ] Optimize images and assets
- [ ] Enable proper caching headers
- [ ] Test in production environment
- [ ] Verify all forms work correctly
- [ ] Check mobile responsiveness
- [ ] Validate security measures

## API Integration Guidelines

### Preparing for Backend Connection
- Create service layer for API calls
- Use environment variables for API endpoints
- Implement proper error handling for network failures
- Use appropriate HTTP methods (GET, POST, PUT, DELETE)
- Handle authentication tokens properly
- Implement request/response interceptors for common logic

### Data Fetching Patterns
```javascript
// Use this pattern for API calls
const fetchData = async () => {
  try {
    setLoading(true);
    const response = await apiService.getData();
    setData(response.data);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

### Form Submission Pattern
```javascript
const handleSubmit = async (formData) => {
  try {
    setSubmitting(true);
    await apiService.submitForm(formData);
    // Show success message
    // Reset form or redirect
  } catch (error) {
    setError(error.message);
  } finally {
    setSubmitting(false);
  }
};
```

Remember: Always prioritize user experience, performance, and security in all development decisions.
