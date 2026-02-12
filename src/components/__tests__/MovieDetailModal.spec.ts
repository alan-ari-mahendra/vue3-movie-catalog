import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import MovieDetailModal from '../MovieDetailModal.vue';
import VideoPlayerModal from '../VideoPlayerModal.vue';

const mockToggleFavorite = vi.fn();
const mockIsFavorite = vi.fn(() => false);

vi.mock('../../hooks/useFavorites', () => ({
    useFavorites: vi.fn(() => ({
        isFavorite: mockIsFavorite,
        toggleFavorite: mockToggleFavorite,
    })),
}));

const fakeMovie = {
    imdbID: 'tt123',
    Title: 'Test Movie Title',
    Year: '2023',
    rating: 8.5,
    description: 'A great test movie.',
    duration: '2h 15m',
    genres: ['Action', 'Comedy'],
    cast: ['Actor One', 'Actor Two'],
};

describe('MovieDetailModal.vue', () => {
    const createWrapper = (props = {}) => {
        return mount(MovieDetailModal, {
            props: {
                modelValue: true,
                movie: fakeMovie,
                ...props,
            },
            global: {
                stubs: {
                    'v-dialog': {
                        props: ['modelValue'],
                        template: '<div v-if="modelValue"><slot /></div>',
                    },
                    'v-card': { template: '<div><slot /></div>' },
                    'v-btn': {
                        template: '<button @click="$emit(\'click\')"><slot /></button>'
                    },
                    'v-chip': { template: '<span class="v-chip-stub"><slot /></span>' },
                },
            },
        });
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render movie details correctly when open', () => {
        const wrapper = createWrapper();

        expect(wrapper.find('.modal-title').text()).toBe(fakeMovie.Title);
        expect(wrapper.find('.description').text()).toBe(fakeMovie.description);
        expect(wrapper.find('.rating-large span').text()).toBe(String(fakeMovie.rating));
        expect(wrapper.find('.duration').text()).toBe(fakeMovie.duration);
        expect(wrapper.find('.year').text()).toBe(fakeMovie.Year);

        const genres = wrapper.findAll('.genres .v-chip-stub');
        expect(genres).toHaveLength(2);
        expect(genres[0].text()).toBe('Action');
        expect(genres[1].text()).toBe('Comedy');

        expect(wrapper.find('.cast-list').text()).toContain('Actor One, Actor Two');
    });

    it('should not render content if modelValue is false', () => {
        const wrapper = createWrapper({ modelValue: false });
        expect(wrapper.find('.modal-card').exists()).toBe(false);
    });

    it('should not render content if movie is null', () => {
        const wrapper = createWrapper({ movie: null });
        expect(wrapper.find('.modal-card').exists()).toBe(false);
    });

    it('should display favorite status correctly', async () => {
        mockIsFavorite.mockReturnValue(false);
        const wrapper = createWrapper();
        const favoriteBtn = wrapper.find('.btn-heart-modal');
        expect(favoriteBtn.classes()).not.toContain('is-favorite');

        mockIsFavorite.mockReturnValue(true);
        wrapper.setProps({ movie: { ...fakeMovie } });

        await wrapper.vm.$nextTick();

        expect(favoriteBtn.classes()).toContain('is-favorite');
    });

    it('should call toggleFavorite when favorite button is clicked', async () => {
        const wrapper = createWrapper();
        await wrapper.find('.btn-heart-modal').trigger('click');

        expect(mockToggleFavorite).toHaveBeenCalledTimes(1);
        expect(mockToggleFavorite).toHaveBeenCalledWith(fakeMovie.imdbID);
    });

    it('should emit update:modelValue when close button is clicked', async () => {
        const wrapper = createWrapper();
        await wrapper.find('.modal-close').trigger('click');

        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
        expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
    });

    it('should open video player when play button is clicked', async () => {
        const wrapper = createWrapper();
        await wrapper.find('.btn-play-modal').trigger('click');

        const videoPlayer = wrapper.findComponent(VideoPlayerModal);
        expect(videoPlayer.exists()).toBe(true);
        expect(videoPlayer.props('modelValue')).toBe(true);
        expect(videoPlayer.props('movie')).toEqual(fakeMovie);
    });

    it('should close video player when back event is emitted', async () => {
        const wrapper = createWrapper();

        await wrapper.find('.btn-play-modal').trigger('click');
        let videoPlayer = wrapper.findComponent(VideoPlayerModal);
        expect(videoPlayer.props('modelValue')).toBe(true);

        await videoPlayer.vm.$emit('back');

        videoPlayer = wrapper.findComponent(VideoPlayerModal);
        expect(videoPlayer.props('modelValue')).toBe(false);
    });
});