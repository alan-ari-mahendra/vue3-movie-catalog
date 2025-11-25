import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import VideoPlayerModal from '../VideoPlayerModal.vue';

let mockPaused = true;
let mockMuted = false;
let mockCurrentTime = 0;
let mockDuration = 200;
let mockPlay: any;
let mockPause: any;
let mockRequestFullscreen: any;

describe('VideoPlayerModal.vue', () => {
    const createWrapper = (props = {}) => {
        return mount(VideoPlayerModal, {
            props: {
                modelValue: true,
                movie: { Title: 'Test Movie', Year: '2023' },
                ...props,
            },
            global: {
                stubs: {
                    'v-dialog': {
                        template: '<div v-if="modelValue"><slot /></div>',
                        props: ['modelValue']
                    }
                }
            },
            attachTo: document.body
        });
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();

        mockPaused = true;
        mockMuted = false;
        mockCurrentTime = 0;
        mockDuration = 200;

        mockPlay = vi.fn().mockResolvedValue(undefined).mockImplementation(() => {
            mockPaused = false;
        });
        mockPause = vi.fn().mockImplementation(() => {
            mockPaused = true;
        });
        mockRequestFullscreen = vi.fn().mockResolvedValue(undefined);

        Object.defineProperty(HTMLVideoElement.prototype, 'play', {
            value: mockPlay,
            writable: true,
            configurable: true
        });
        Object.defineProperty(HTMLVideoElement.prototype, 'pause', {
            value: mockPause,
            writable: true,
            configurable: true
        });
        Object.defineProperty(HTMLVideoElement.prototype, 'paused', {
            get: () => mockPaused,
            configurable: true
        });
        Object.defineProperty(HTMLVideoElement.prototype, 'muted', {
            get: () => mockMuted,
            set: (v) => { mockMuted = v; },
            configurable: true
        });
        Object.defineProperty(HTMLVideoElement.prototype, 'currentTime', {
            get: () => mockCurrentTime,
            set: (v) => { mockCurrentTime = v; },
            configurable: true
        });
        Object.defineProperty(HTMLVideoElement.prototype, 'duration', {
            get: () => mockDuration,
            configurable: true
        });
        Object.defineProperty(HTMLVideoElement.prototype, 'requestFullscreen', {
            value: mockRequestFullscreen,
            writable: true,
            configurable: true
        });

        Object.defineProperty(document, 'fullscreenElement', {
            value: null,
            writable: true,
            configurable: true
        });
        Object.defineProperty(document, 'exitFullscreen', {
            value: vi.fn().mockResolvedValue(undefined),
            writable: true,
            configurable: true
        });
    });

    afterEach(() => {
        vi.useRealTimers();

        const propsToDelete = [
            'play', 'pause', 'paused', 'muted',
            'currentTime', 'duration', 'requestFullscreen'
        ];

        propsToDelete.forEach(prop => {
            const descriptor = Object.getOwnPropertyDescriptor(HTMLVideoElement.prototype, prop);
            if (descriptor && descriptor.configurable) {
                delete (HTMLVideoElement.prototype as any)[prop];
            }
        });
    });

    const getVideoElement = (wrapper: VueWrapper) => {
        return wrapper.find('.video-element').element as HTMLVideoElement;
    };

    it('should render movie title and year when open', () => {
        const wrapper = createWrapper({ movie: { Title: 'Inception', Year: '2010' } });
        expect(wrapper.find('.movie-info h2').text()).toBe('Inception');
        expect(wrapper.find('.movie-year').text()).toBe('2010');
        wrapper.unmount();
    });

    it('should not render content if modelValue is false', () => {
        const wrapper = createWrapper({ modelValue: false });
        expect(wrapper.find('.video-player').exists()).toBe(false);
        wrapper.unmount();
    });

    it('should call playVideo when modelValue becomes true', async () => {
        const wrapper = createWrapper({ modelValue: false });

        await wrapper.setProps({ modelValue: true });

        await vi.advanceTimersByTimeAsync(100);
        await wrapper.vm.$nextTick();

        expect(mockPlay).toHaveBeenCalled();
        wrapper.unmount();
    });

    it('should call pauseVideo when modelValue becomes false', async () => {
        const wrapper = createWrapper({ modelValue: true });

        await wrapper.setProps({ modelValue: false });
        await wrapper.vm.$nextTick();

        expect(mockPause).toHaveBeenCalled();
        wrapper.unmount();
    });

    it('should toggle play/pause state correctly', async () => {
        const wrapper = createWrapper();
        await wrapper.vm.$nextTick();

        const playButton = wrapper.find('.control-btn');

        await playButton.trigger('click');
        await wrapper.vm.$nextTick();

        expect(mockPlay).toHaveBeenCalled();
        expect(wrapper.vm.isPlaying).toBe(true);

        await playButton.trigger('click');
        await wrapper.vm.$nextTick();

        expect(mockPause).toHaveBeenCalled();
        expect(wrapper.vm.isPlaying).toBe(false);

        wrapper.unmount();
    });

    it('should toggle mute state correctly', async () => {
        const wrapper = createWrapper();
        await wrapper.vm.$nextTick();

        const muteButton = wrapper.find('.controls-left button:nth-child(2)');
        await muteButton.trigger('click');
        await wrapper.vm.$nextTick();

        expect(mockMuted).toBe(true);
        expect(wrapper.vm.isMuted).toBe(true);

        wrapper.unmount();
    });

    it('should update video time on progress bar click', async () => {
        const wrapper = createWrapper();
        await wrapper.vm.$nextTick();

        const videoElement = wrapper.find('.video-element').element as HTMLVideoElement;
        const progressBar = wrapper.find('.progress-bar');

        await videoElement.dispatchEvent(new Event('loadedmetadata'));
        await wrapper.vm.$nextTick();

        (progressBar.element as any).getBoundingClientRect = vi.fn(() => ({ left: 0, width: 100 }));

        await progressBar.trigger('click', { clientX: 50 });
        await wrapper.vm.$nextTick();

        expect(mockCurrentTime).toBe(100);
    });

    it('should emit back and update:modelValue when back button is clicked', async () => {
        const wrapper = createWrapper();
        await wrapper.vm.$nextTick();

        await wrapper.find('.btn-back').trigger('click');

        expect(wrapper.emitted()).toHaveProperty('back');
        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
        expect(wrapper.emitted('update:modelValue')![0]).toEqual([false]);

        wrapper.unmount();
    });

    it('should emit update:modelValue when dialog is closed', async () => {
        const wrapper = createWrapper();
        await wrapper.vm.$nextTick();

        await wrapper.vm.closePlayer();

        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
        expect(wrapper.emitted('update:modelValue')![0]).toEqual([false]);

        wrapper.unmount();
    });

    it('should toggle fullscreen correctly', async () => {
        const wrapper = createWrapper();
        await wrapper.vm.$nextTick();

        const fullscreenButton = wrapper.find('.controls-right button');

        await fullscreenButton.trigger('click');
        expect(mockRequestFullscreen).toHaveBeenCalled();

        const videoElement = getVideoElement(wrapper);
        (document as any).fullscreenElement = videoElement;

        await fullscreenButton.trigger('click');
        expect((document as any).exitFullscreen).toHaveBeenCalled();

        wrapper.unmount();
    });
});