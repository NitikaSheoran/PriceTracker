"use client";

import React, {
  useState,
  type SyntheticEvent,
} from "react";

import {
  scrapeAndStoreProduct,
} from "@/lib/action";

const isValidAmazonProductUrl = (
  url: string
) => {
  try {
    const parsedUrl =
      new URL(url);

    const hostname =
      parsedUrl.hostname.toLowerCase();

    return (
      hostname === "amazon.com" ||
      hostname.endsWith(".amazon.com") ||
      hostname === "amazon.in" ||
      hostname.endsWith(".amazon.in")
    );
  } catch {
    return false;
  }
};

const Searchbar = () => {
  const [
    searchPrompt,
    setSearchPrompt,
  ] = useState("");

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (
    event: SyntheticEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    const url =
      searchPrompt.trim();

    if (!url) {
      setError(
        "Please enter an Amazon product URL."
      );

      return;
    }

    if (!isValidAmazonProductUrl(url)) {
      setError(
        "Please provide a valid Amazon product URL."
      );

      return;
    }

    try {
      setIsLoading(true);

      await scrapeAndStoreProduct(
        url
      );

      setSearchPrompt("");

      /**
       * Refresh page so newly stored
       * product appears.
       */
      window.location.reload();
    } catch (error: any) {
      console.error(error);

      setError(
        error?.message ||
          "Something went wrong while tracking the product."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl">
      <form
        className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full"
        onSubmit={handleSubmit}
      >
        <input
          type="url"
          value={searchPrompt}
          onChange={(e) =>
            setSearchPrompt(
              e.target.value
            )
          }
          placeholder="Paste Amazon product link..."
          className="flex-1 w-full px-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />

        <button
          type="submit"
          disabled={
            !searchPrompt.trim() ||
            isLoading
          }
          className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium shadow-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? "Tracking..."
            : "Track Price"}
        </button>
      </form>

      {error && (
        <p className="mt-3 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

export default Searchbar;