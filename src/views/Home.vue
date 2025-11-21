<script setup lang="ts">
import { useGetMovies } from '../api/getMovies'

const { data: movies, isLoading } = useGetMovies()
</script>

<template>
  <v-app>
    <v-main>
      <v-container class="movie-container" fluid>

        <!-- Loader -->
        <div v-if="isLoading" class="loading">
          <v-progress-circular indeterminate color="primary" size="48" />
          <p>Loading movies...</p>
        </div>

        <!-- Movies Grid -->
        <v-row v-else class="movies-grid" dense>
          <v-col
            v-for="movie in movies.data"
            :key="movie.imdbID"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <v-card class="movie-card" elevation="6">
              <v-card-title class="movie-title">{{ movie.Title }}</v-card-title>
              <v-card-subtitle class="movie-year">
                📅 {{ movie.Year }}
              </v-card-subtitle>

              <v-card-actions>
                <v-btn color="primary" variant="tonal">View Detail</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped lang="scss">
.movie-container {
  padding: 40px;
}

.loading {
  text-align: center;
  margin-top: 80px;

  p {
    margin-top: 12px;
    opacity: 0.7;
    font-size: 16px;
  }
}

.movies-grid {
  margin-top: 20px;
}

.movie-card {
  border-radius: 16px;
  padding: 16px;
  transition: 0.25s ease;
  cursor: pointer;
  background: white;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 22px rgba(0, 0, 0, 0.12);
  }

  .movie-title {
    font-size: 20px;
    font-weight: 700;
    line-height: 1.3;
    min-height: 48px;
  }

  .movie-year {
    opacity: 0.6;
    margin-top: 4px;
    font-size: 15px;
  }
}
</style>
