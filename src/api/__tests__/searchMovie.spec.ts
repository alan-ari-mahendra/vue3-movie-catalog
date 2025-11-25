import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ref } from "vue";
import {
    useSearchMovies,
    searchMoviesQueryKey,
} from "../searchMovie";
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { mount, flushPromises } from "@vue/test-utils";

vi.mock("../../utils/api", () => ({
    default: {
        get: vi.fn(),
    },
}));

vi.mock("../../utils/apiEndpoints", () => ({
    default: {
        searchMovies: "/search",
    },
}));

vi.mock("../../utils/config", () => ({
    getRestApiUrl: "https://api.example.com",
}));

import api from "../../utils/api";
import apiEndpoints from "../../utils/apiEndpoints";
import { getRestApiUrl } from "../../utils/config";

const TestComponent = {
    template: "<div></div>",
    setup() {
        const { data, isLoading, error, isFetching } = useSearchMovies({
            Title: ref("Inception"),
            page: ref(1),
        });
        return { data, isLoading, error, isFetching };
    },
};

describe("searchMovie API", () => {
    let queryClient: QueryClient;
    let mockApiGet: any;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
        mockApiGet = api.get as any;

        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                    gcTime: 0,
                },
            },
        });
    });

    afterEach(() => {
        queryClient.clear();
        vi.useRealTimers();
    });

    it("should generate the correct search query key", () => {
        const title = ref("Batman");
        const page = ref(3);
        const key = searchMoviesQueryKey({ Title: title, page });
        expect(key).toEqual(["search-movies", { Title: title, page }]);
    });

    it("should call api.get with correct search params and return data", async () => {
        const fakeSearchResponse = {
            data: [{ imdbID: "tt2", Title: "Inception" }],
            page: 1,
            total_pages: 1,
        };
        mockApiGet.mockResolvedValue({ data: fakeSearchResponse });

        const wrapper = mount(TestComponent, {
            global: {
                plugins: [[VueQueryPlugin, { queryClient }]],
            },
        });

        await flushPromises();
        await vi.runAllTimersAsync();
        await flushPromises();

        expect(mockApiGet).toHaveBeenCalledTimes(1);
        expect(mockApiGet).toHaveBeenCalledWith(
            apiEndpoints.searchMovies,
            { params: { Title: "Inception", page: 1 } },
            getRestApiUrl
        );

        expect(wrapper.vm.isLoading).toBe(false);
        expect(wrapper.vm.error).toBeNull();

        expect(wrapper.vm.data).toEqual({ data: fakeSearchResponse });
    });

    it("should handle cases with no search results", async () => {
        const emptyResponse = { data: [], page: 1, total_pages: 0 };
        mockApiGet.mockResolvedValue({ data: emptyResponse });

        const wrapper = mount(TestComponent, {
            global: {
                plugins: [[VueQueryPlugin, { queryClient }]],
            },
        });

        await flushPromises();
        await vi.runAllTimersAsync();
        await flushPromises();

        expect(wrapper.vm.isLoading).toBe(false);
        expect(wrapper.vm.error).toBeNull();

        expect(wrapper.vm.data).toEqual({ data: emptyResponse });
    });

    it("should handle API errors during search", async () => {
        const apiError = new Error("Search service unavailable");
        mockApiGet.mockRejectedValue(apiError);

        const wrapper = mount(TestComponent, {
            global: {
                plugins: [[VueQueryPlugin, { queryClient }]],
            },
        });

        await flushPromises();
        await vi.runAllTimersAsync();
        await flushPromises();

        expect(wrapper.vm.isLoading).toBe(false);
        expect(wrapper.vm.data).toBeUndefined();
        expect(wrapper.vm.error).toEqual(apiError);
    });
});