import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ref } from "vue";
import { useGetMovies, getMoviesQueryKey } from "../getMovies";
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { mount, flushPromises } from "@vue/test-utils";

vi.mock("../../utils/api", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("../../utils/apiEndpoints", () => ({
  default: {
    movies: "/movies",
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
    const { data, isLoading, error, isFetching } = useGetMovies({
      page: ref(1),
    });
    return { data, isLoading, error, isFetching };
  },
};

describe("getMovies API", () => {
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

  it("should generate the correct query key", () => {
    const page = ref(2);
    const key = getMoviesQueryKey({ page });
    expect(key).toEqual(["movies", { page }]);
  });

  it("should call api.get with correct params and return data on success", async () => {
    const fakeApiResponse = {
      data: [{ imdbID: "tt1", Title: "Test Movie" }],
      page: 1,
      total_pages: 10,
    };

    mockApiGet.mockResolvedValue(fakeApiResponse);

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
        apiEndpoints.movies,
        { params: { page: 1 } },
        getRestApiUrl
    );

    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.error).toBeNull();
    expect(wrapper.vm.data).toEqual(fakeApiResponse);
  });

  it("should handle API errors correctly", async () => {
    const apiError = new Error("Network Error");
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