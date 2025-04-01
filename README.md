# DabadocNearbyQuestionsUi
## Overview
Frontend application for NearbyQ, a location-based Q&A platform that enables users to post questions relevant to specific locations and get answers from people nearby. This Angular application provides a user-friendly interface for managing questions, answers, and favorites.

## Features
- **User Authentication**: Sign up and sign in functionality
- **Post Questions**: Create questions with title, content, and location
- **Answer Questions**: Reply to questions from other users
- **Location-based Browsing**: View questions sorted by distance from your current location
- **Distance Filtering**: Set a custom radius to view questions within specific distances
- **Favorites Management**: Like questions to add them to favorites, and view your favorite questions
- **Responsive Design**: Works on mobile, tablet and desktop devices

## Technology Stack
- **Angular**: Latest version with standalone components
- **Tailwind CSS**: For styling and responsive design
- **JWT Authentication**: For secure API communication
- **Geolocation API**: For location-based features
- **Angular Router**: For navigation and routing

## Prerequisites
- Node.js 16.0 or higher
- npm 7.0 or higher
- Angular CLI

## Installation and Setup

1. Clone the repository
   git clone https://github.com/yourusername/nearbyq-frontend.git
2. Install dependencies
   npm install
3. Configure environment variables
      Create or edit `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1'
};
```
4. Start the development server
   ng serve
5. Open the application in your browser
   http://localhost:4200

## Project Structure

src/app/components - Angular components for the UI
src/app/services - Services for API communication and business logic
src/app/models - TypeScript interfaces for data models
src/app/guards - Authentication guards for route protection
src/app/interceptors - HTTP interceptors for JWT authentication

## Available Components

Home Component: Landing page with app introduction
Login/Signup Components: User authentication screens
Question List: List of questions with distance filtering
Question Detail: View a question with its answers
Question Form: Create or edit a question
Favorite List: View favorite questions

## Future Enhancements

Google Maps integration for visualizing questions on a map
Real-time notifications when someone answers your question
User profiles with reputation system
Categories and tags for questions
