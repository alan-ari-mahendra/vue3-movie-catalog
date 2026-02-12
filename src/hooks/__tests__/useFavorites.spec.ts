import { describe, it, expect, vi } from 'vitest';

// --- MOCK SETUP (Tidak berubah) ---
const createMockLocalStorage = () => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value;
        }),
        clear: vi.fn(() => {
            store = {};
        }),
        getStore: () => store,
    };
};

describe('useFavorites', () => {
    // --- SCENARIO 1: Initial State & Loading ---
    it('should load favorites from localStorage on initialization', async () => {
        const mockLocalStorage = createMockLocalStorage();
        mockLocalStorage.setItem('movie_favorites', JSON.stringify(['tt1', 'tt2']));
        vi.stubGlobal('localStorage', mockLocalStorage);

        vi.resetModules();
        const { useFavorites } = await import('../useFavorites');
        const { isFavorite, favoritesCount, allFavoriteIds } = useFavorites();

        expect(isFavorite('tt1')).toBe(true);
        expect(isFavorite('tt2')).toBe(true);
        expect(isFavorite('tt3')).toBe(false);
        expect(favoritesCount.value).toBe(2);
        expect(allFavoriteIds.value).toEqual(expect.arrayContaining(['tt1', 'tt2']));
    });

    it('should handle corrupted localStorage data gracefully', async () => {
        const mockLocalStorage = createMockLocalStorage();
        mockLocalStorage.setItem('movie_favorites', 'this-is-not-json');
        vi.stubGlobal('localStorage', mockLocalStorage);

        vi.resetModules();
        const { useFavorites } = await import('../useFavorites');
        const { favoritesCount } = useFavorites();

        expect(favoritesCount.value).toBe(0);
    });

    // --- Helper untuk tes lainnya ---
    // --- PERBAIKAN: Fungsi ini sekarang mengembalikan fungsi `useFavorites` itu sendiri ---
    const setupHookWithEmptyState = async () => {
        const mockLocalStorage = createMockLocalStorage();
        vi.stubGlobal('localStorage', mockLocalStorage);
        vi.resetModules();
        const { useFavorites } = await import('../useFavorites');
        const { clearAllFavorites } = useFavorites();
        clearAllFavorites();
        return useFavorites; // Kembalikan fungsi hook-nya, bukan hasil panggilannya
    };

    // --- SCENARIO 2: Core Functionality ---
    it('should add a movie to favorites', async () => {
        // --- PERBAIKAN: Panggil fungsi yang dikembalikan helper ---
        const { addFavorite, isFavorite, favoritesCount } = (await setupHookWithEmptyState())();

        expect(isFavorite('tt1')).toBe(false);
        expect(favoritesCount.value).toBe(0);

        addFavorite('tt1');

        expect(isFavorite('tt1')).toBe(true);
        expect(favoritesCount.value).toBe(1);
    });

    it('should remove a movie from favorites', async () => {
        // --- PERBAIKAN: Panggil fungsi yang dikembalikan helper ---
        const { removeFavorite, addFavorite, isFavorite, favoritesCount } = (await setupHookWithEmptyState())();

        addFavorite('tt1');
        addFavorite('tt2');
        expect(favoritesCount.value).toBe(2);

        removeFavorite('tt1');

        expect(isFavorite('tt1')).toBe(false);
        expect(isFavorite('tt2')).toBe(true);
        expect(favoritesCount.value).toBe(1);
    });

    it('should toggle a movie favorite status correctly', async () => {
        // --- PERBAIKAN: Panggil fungsi yang dikembalikan helper ---
        const { toggleFavorite, isFavorite, favoritesCount } = (await setupHookWithEmptyState())();

        toggleFavorite('tt1');
        expect(isFavorite('tt1')).toBe(true);
        expect(favoritesCount.value).toBe(1);

        toggleFavorite('tt1');
        expect(isFavorite('tt1')).toBe(false);
        expect(favoritesCount.value).toBe(0);
    });

    // --- SCENARIO 3: Side Effects (localStorage interaction) ---
    it('should save to localStorage when favorites are changed', async () => {
        const mockLocalStorage = createMockLocalStorage();
        vi.stubGlobal('localStorage', mockLocalStorage);
        vi.resetModules();
        const { useFavorites } = await import('../useFavorites');
        const { addFavorite, removeFavorite, clearAllFavorites } = useFavorites();

        addFavorite('tt1');
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
            'movie_favorites',
            JSON.stringify(['tt1'])
        );

        removeFavorite('tt1');
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
            'movie_favorites',
            JSON.stringify([])
        );

        addFavorite('tt1');
        addFavorite('tt2');
        clearAllFavorites();
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
            'movie_favorites',
            JSON.stringify([])
        );
    });

    // --- SCENARIO 4: Singleton Behavior (Shared State) ---
    it('should share state across different component instances', async () => {
        // --- PERBAIKAN: Panggil fungsi yang dikembalikan helper ---
        const useFavorites = await setupHookWithEmptyState();
        const hook1 = useFavorites();
        const hook2 = useFavorites();

        hook1.addFavorite('tt1');

        expect(hook2.isFavorite('tt1')).toBe(true);
        expect(hook2.favoritesCount.value).toBe(1);

        hook2.removeFavorite('tt1');

        expect(hook1.isFavorite('tt1')).toBe(false);
        expect(hook1.favoritesCount.value).toBe(0);
    });
});