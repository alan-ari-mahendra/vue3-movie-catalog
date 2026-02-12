import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick, ref } from 'vue';
import { mount } from '@vue/test-utils';
import Home from '../Home.vue';
import MovieDetailModal from '../../components/MovieDetailModal.vue';
import VideoPlayerModal from '../../components/VideoPlayerModal.vue';

const mockUseGetMovies = {
    data: ref(null),
    isLoading: ref(false),
    page: ref(1),
};

vi.mock('../../api/getMovies', () => ({
    useGetMovies: vi.fn(() => mockUseGetMovies),
}));

const mockToggleFavorite = vi.fn();
const mockIsFavorite = vi.fn(() => false);

vi.mock('../../hooks/useFavorites', () => ({
    useFavorites: vi.fn(() => ({
        isFavorite: mockIsFavorite,
        toggleFavorite: mockToggleFavorite,
    })),
}));

const mockObserve = vi.fn();
const mockDisconnect = vi.fn();
const mockIntersectionObserverCallback = vi.fn();

class MockIntersectionObserver {
    callback: IntersectionObserverCallback;

    constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
        mockIntersectionObserverCallback.mockImplementation(callback);
    }

    observe() {
        mockObserve();
    }

    disconnect() {
        mockDisconnect();
    }
}

vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

const eventListeners: Record<string, Function[]> = {};

vi.stubGlobal('window', {
    addEventListener: vi.fn((event, cb) => {
        if (!eventListeners[event]) {
            eventListeners[event] = [];
        }
        eventListeners[event].push(cb);
    }),
    removeEventListener: vi.fn((event, cb) => {
        if (eventListeners[event]) {
            const index = eventListeners[event].indexOf(cb);
            if (index > -1) {
                eventListeners[event].splice(index, 1);
            }
        }
    }),
    scrollY: 0,
});

const fakeMovieResponse = {
    data: [
        { imdbID: 'tt1', Title: 'Movie 1', Year: '2023' },
        { imdbID: '2', Title: 'Movie 2', Year: '2022' },
    ],
    page: 1,
    total_pages: 5,
};

const setupMocks = () => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockUseGetMovies.data.value = null;
    mockUseGetMovies.isLoading.value = false;
    mockUseGetMovies.page.value = 1;
};

describe('Home.vue', () => {
    let wrapper: any;

    beforeEach(() => {
        setupMocks();
        wrapper = mount(Home, {
            global: {
                stubs: {
                    MovieDetailModal: { template: '<div></div>' },
                    VideoPlayerModal: { template: '<div></div>' },
                    'v-btn': { template: '<button @click="$emit(\'click\')"><slot /></button>' },
                    'v-progress-circular': { template: '<div>Loading...</div>' },
                },
            },
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should show skeleton screen on first load', () => {
        mockUseGetMovies.isLoading.value = true;
        mockUseGetMovies.data.value = null;

        expect(wrapper.find('.hero-skeleton').exists()).toBe(true);
        expect(wrapper.find('.hero').exists()).toBe(false);
        expect(wrapper.find('.grid-item').exists()).toBe(false);
    });

    it('should render hero banner and movie grid when data is loaded', async () => {
        mockUseGetMovies.isLoading.value = false;
        mockUseGetMovies.data.value = fakeMovieResponse;

        await nextTick();

        expect(wrapper.find('.hero').exists()).toBe(true);
        expect(wrapper.find('.hero__title').text()).toBe('Movie 1');
        expect(wrapper.find('.grid-list').exists()).toBe(true);
        const movieItems = wrapper.findAll('.grid-item');
        expect(movieItems).toHaveLength(fakeMovieResponse.data.length);
        expect(movieItems[0].text()).toContain('Movie 1');
    });

    it('should show "Load More" button when limit is reached', async () => {
        const largeFakeData = Array.from({ length: 60 }, (_, i) => ({ imdbID: `tt${i}` }));
        mockUseGetMovies.isLoading.value = false;
        mockUseGetMovies.data.value = { ...fakeMovieResponse, data: largeFakeData };

        await nextTick();

        expect(wrapper.find('.load-more-container').exists()).toBe(true);
    });

    it('should load more movies when "Load More" button is clicked', async () => {
        mockUseGetMovies.data.value = fakeMovieResponse;
        await nextTick();
        expect(wrapper.find('.load-more-container').exists()).toBe(true);

        await wrapper.find('.load-more-container button').trigger('click');
        await nextTick();

        expect(mockUseGetMovies.page.value).toBe(2);
    });

    it('should open MovieDetailModal when a movie is clicked', async () => {
        mockUseGetMovies.data.value = fakeMovieResponse;
        await nextTick();

        await wrapper.find('.grid-item').trigger('click');

        expect(wrapper.findComponent(MovieDetailModal).exists()).toBe(true);
        expect(wrapper.findComponent(MovieDetailModal).props('movie')).toEqual(
            expect.objectContaining({ imdbID: 'tt1', Title: 'Movie 1' })
        );
    });

    it('should call toggleFavorite when favorite button is clicked', async () => {
        mockUseGetMovies.data.value = fakeMovieResponse;
        await nextTick();

        await wrapper.find('.btn-more').trigger('click');

        expect(mockToggleFavorite).toHaveBeenCalledTimes(1);
        expect(mockToggleFavorite).toHaveBeenCalledWith('tt1');
    });

    it('should trigger load more when sentinel is intersecting', async () => {
        mockUseGetMovies.data.value = fakeMovieResponse;
        await nextTick();

        mockIntersectionObserverCallback([{ isIntersecting: true }]);
        await nextTick();

        expect(mockUseGetMovies.page.value).toBe(2);
    });
});