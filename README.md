

# Vue 3 Movie Catalog Application Documentation

## Overview

This is a Vue 3 web application that showcases a movie catalog with search capabilities, favorites management, and a Netflix-inspired user interface. The project leverages Vue 3's Composition API, TypeScript for type safety, Vuetify for the UI framework, and Vue Query for efficient data fetching and state management.

## Architecture: Vue Bulletproof Pattern

Our application implements a Vue version of the Bulletproof architecture pattern, which originated in the React ecosystem. This pattern prioritizes several key principles:

- Clear separation of concerns
- Comprehensive type safety
- Scalable state management
- Reusable composables (Vue's equivalent to React hooks)
- Clean API layer
- Consistent error handling

### Key Bulletproof Pattern Elements in Our Implementation

1.  **Layered Architecture**
    -   **Presentation Layer**: UI rendering is handled by components and views, primarily located in the `src/views/` and `src/components/` directories.
    -   **Domain Layer**: Business logic is encapsulated in custom composables. The `src/hooks/` directory contains `useFavorites.ts`, which manages the state and logic for favoriting movies independently of any UI component.
    -   **Data Layer**: API abstraction is centralized. The `src/api/` directory contains hooks that interact with the API, while `src/utils/api.ts` provides the underlying HTTP client with consistent error handling.

2.  **Composables Pattern (Vue Hooks)**
    -   The `useFavorites.ts` composable handles all aspects of the favorites feature: the state of favorited IDs, persistence to `localStorage`, and methods to toggle or check the favorite status. This logic is completely decoupled from the components that use it, making it highly reusable and testable.

3.  **Type Safety Throughout**
    -   Comprehensive TypeScript interfaces are defined for all data structures, such as `MovieItem` and `MoviesResponse` in `src/types/movies.types.ts`. This ensures type safety from the API layer all the way to the components, preventing common runtime errors.

4.  **Clean API Abstraction**
    -   All API communication is routed through a centralized Axios client in `src/utils/api.ts`. This file standardizes request/response handling, error processing, and query parameter serialization.
    -   Specific data-fetching logic is encapsulated in dedicated files like `src/api/getMovies.ts` and `src/api/searchMovie.ts`, which use Vue Query to create composable hooks (`useGetMovies`, `useSearchMovies`) for components to consume.

5.  **State Management with Vue Query**
    -   Server state (data from the API) is managed exclusively through Vue Query. This provides powerful features out-of-the-box like caching, background refetching, deduplication of requests, and stale-while-revalidate strategies.
    -   Client state (e.g., the list of favorite movie IDs) is managed through custom composables, creating a clear and maintainable separation between server and client state.

## Infinite Scroll with Pagination System

One of the standout features of this application is its sophisticated infinite scroll system, which intelligently works with the API's pagination. This implementation delivers a smooth user experience while keeping performance and API efficiency in mind.

### Core Implementation Strategy

Rather than relying on a single mechanism, the system combines several techniques to ensure reliability and performance.

1.  **Dual Triggering Mechanism**
    -   **Intersection Observer**: The primary trigger uses the `IntersectionObserver` API. A hidden "sentinel" element is placed at the bottom of the movie list. When this element enters the viewport (with a `rootMargin` to trigger slightly before the user reaches the absolute bottom), it fetches the next page of data.
    -   **Scroll Position Fallback**: As a secondary trigger, the system also listens to the `scroll` event. If the user scrolls to 95% of the page height, it will attempt to load more data. This ensures the system works even if the Intersection Observer fails or in edge cases.

2.  **Throttling and Request Control**
    -   To prevent a flood of API requests during rapid scrolling, a simple throttling mechanism is implemented. A boolean flag (`isWaiting`) ensures that only one new page request can be made at a time, with a short cooldown period after each request.
    -   The system checks for multiple conditions before fetching: it must not already be loading, it must not be in a "waiting" state, and there must be more pages available to fetch.

3.  **Controlled Data Loading**
    -   To prevent browser performance degradation from loading thousands of items at once, the system implements a "load limit". It will only automatically load a certain number of items (e.g., 50) before pausing.
    -   When the load limit is reached, a "Load More" button is displayed. This transfers control back to the user, allowing them to decide when to load the next batch of data, thus managing memory usage and DOM complexity.

### Data Management Flow

The system efficiently manages data from paginated API responses to create a smooth, continuous list.

1.  **State Accumulation**: Instead of replacing the movie list on each new page fetch, the system appends new movies to the existing array (`allMovies`). This creates the effect of a continuously growing list.
2.  **Page Tracking**: It keeps track of the current `page` number, the `totalPages` available from the API, and the `lastLoadedPage` to avoid processing the same page twice.
3.  **State Reset**: On actions that change the dataset (like a new search), the system intelligently resets all relevant state variables: the page number, the accumulated movie list, loading counters, and UI flags. This ensures a clean slate for the new dataset.

### User Experience and Feedback

The system provides clear and distinct feedback to the user at every stage.

1.  **Initial Loading**: On first load, a full-page skeleton UI is displayed, mimicking the layout of the content to be loaded. This improves perceived performance.
2.  **Pagination Loading**: When subsequent pages are being fetched, a small loading spinner appears at the bottom of the list, indicating that more content is on its way without blocking the UI.
3.  **Empty States**: If a search yields no results, a dedicated empty state component is displayed with a helpful message and a call to action (e.g., "Try searching with different keywords").

### Performance Optimizations

The infinite scroll is designed with performance in mind.

1.  **Lazy Image Loading**: Images for movie posters are not loaded until they are about to enter the viewport. The system tracks which images have been loaded to prevent flickering and improve initial page render time.
2.  **Memory Management**: The "Load More" button is a key performance feature. By limiting the number of items rendered automatically, it prevents the DOM from becoming excessively large, which would lead to jank and slow scrolling.
3.  **Cleanup**: The system properly cleans up its event listeners and `IntersectionObserver` instances when components are unmounted to prevent memory leaks.

## Features

- Browse popular movies with pagination
- Search for movies by title
- Add movies to a favorites list with localStorage persistence
- View detailed movie information in a modal
- Mock video player interface with controls
- Responsive design optimized for mobile and desktop
- Graceful handling of loading and error states
- Smooth transitions and micro-interactions

## Tech Stack

- **Frontend Framework**: Vue 3 with Composition API
- **Language**: TypeScript
- **UI Framework**: Vuetify
- **CSS Preprocessor**: SCSS
- **Data Fetching**: Vue Query (@tanstack/vue-query)
- **HTTP Client**: Axios
- **Routing**: Vue Router
- **Icons**: Lucide Vue Next
- **Testing**: Vitest
- **Build Tool**: Vite

## Project Structure

```
src/
├── api/                 # API integration layer (Bulletproof data layer)
│   ├── getMovies.ts     # Fetch movies API
│   └── searchMovie.ts   # Search movies API
├── components/          # Reusable UI components (Presentation layer)
│   ├── AppFooter.vue
│   ├── AppNavbar.vue
│   ├── MovieDetailModal.vue
│   └── VideoPlayerModal.vue
├── hooks/               # Composable functions (Bulletproof domain layer)
│   └── useFavorites.ts  # Favorites management
├── router/              # Vue Router configuration
│   └── index.ts
├── styles/              # Global styles
│   └── main.scss
├── types/               # TypeScript type definitions
│   └── movies.types.ts
├── utils/               # Utility functions (Bulletproof infrastructure)
│   ├── api.ts           # API client with error handling
│   ├── apiEndpoints.ts  # API endpoint definitions
│   ├── config.ts        # Configuration management
│   ├── fillPathParams.ts # URL parameter utilities
│   └── vue-query.ts     # Vue Query configuration
├── views/               # Page components (Presentation layer)
│   ├── Home.vue
│   ├── MyList.vue
│   └── SearchList.vue
├── App.vue              # Root component
└── main.ts              # Application entry point
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Development

To start the development server:
```bash
npm run dev
```

## Build

To build for production:
```bash
npm run build
```

## Testing

To run tests:
```bash
npm run test
```

## API Integration

The application fetches movie data from a public API endpoint. The integration follows the Bulletproof pattern with a centralized API client for consistent error handling and dedicated Vue Query hooks for data fetching, caching, and state management.

## State Management

The application implements a hybrid state management approach following Bulletproof principles:
- **Server State**: Managed through Vue Query with intelligent caching and background refetching.
- **Client State**: Managed through custom composables like `useFavorites.ts`, which also handle persistence.
- **UI State**: Managed locally within components using Vue's reactivity system.

## Key Components

- **App.vue**: Root component that sets up the application layout with navigation and footer.
- **Home.vue**: Displays a hero banner and a grid of popular movies with infinite scroll.
- **SearchList.vue**: Handles movie search functionality and displays results in a grid.
- **MyList.vue**: Displays the user's favorite movies, also using infinite scroll for large lists.
- **MovieDetailModal.vue**: Shows detailed information about a selected movie.
- **VideoPlayerModal.vue**: Provides a mock video player interface with playback controls.

## Styling

The application uses SCSS for styling with:
- Component-scoped styles for better maintainability.
- A responsive design with mobile-first breakpoints.
- A dark theme inspired by modern streaming services.
- Skeleton loading states for better perceived performance.
- Smooth transitions and hover effects for enhanced UX.

## Deployment

The application is deployed in vercel https://vue3-movie-catalog.vercel.app/
