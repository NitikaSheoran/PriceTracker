import {
  NotificationType,
  PriceHistoryItem,
  Product,
} from "@/types";

const Notification: Record<
  NotificationType,
  NotificationType
> = {
  WELCOME: "WELCOME",
  CHANGE_OF_STOCK: "CHANGE_OF_STOCK",
  LOWEST_PRICE: "LOWEST_PRICE",
  THRESHOLD_MET: "THRESHOLD_MET",
};

const THRESHOLD_PERCENTAGE = 40;

// Extract price
export function extractPrice(...elements: any[]) {
  for (const element of elements) {
    if (!element) continue;

    const priceText = element.text()?.trim();

    if (!priceText) continue;

    const cleanPrice = priceText.replace(/[^\d.]/g, "");

    if (cleanPrice) {
      return cleanPrice;
    }
  }

  return "";
}

// Extract currency
export function extractCurrency(element: any) {
  if (!element) return "";

  const currencyText = element
    .text()
    ?.trim()
    .slice(0, 1);

  return currencyText || "";
}

// Extract description
export function extractDescription($: any) {
  const selectors = [
    ".a-unordered-list .a-list-item",
    ".a-expander-content p",
  ];

  for (const selector of selectors) {
    const elements = $(selector);

    if (elements.length > 0) {
      return elements
        .map(
          (_: any, element: any) =>
            $(element).text().trim()
        )
        .get()
        .join("\n");
    }
  }

  return "";
}

// Highest price
export function getHighestPrice(
  priceList: PriceHistoryItem[]
) {
  if (!priceList.length) return 0;

  return Math.max(
    ...priceList.map((item) => item.price)
  );
}

// Lowest price
export function getLowestPrice(
  priceList: PriceHistoryItem[]
) {
  if (!priceList.length) return 0;

  return Math.min(
    ...priceList.map((item) => item.price)
  );
}

// Average price
export function getAveragePrice(
  priceList: PriceHistoryItem[]
) {
  if (!priceList.length) return 0;

  const sum = priceList.reduce(
    (acc, curr) => acc + curr.price,
    0
  );

  return sum / priceList.length;
}

// Format number
export const formatNumber = (
  num: number = 0
) => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

/**
 * Determine which email notification should be sent.
 *
 */
export const getEmailNotifType = (
  scrapedProduct: Product,
  currentProduct: Product
): NotificationType | null => {
  const newPrice = scrapedProduct.currentPrice;

  const historicalLowest =
    currentProduct.priceHistory.length > 0
      ? getLowestPrice(
          currentProduct.priceHistory
        )
      : Infinity;

  if (newPrice < historicalLowest) {
    return Notification.LOWEST_PRICE;
  }

  /**
   * 2. Product came back in stock
   */
  if (
    !scrapedProduct.isOutOfStock &&
    currentProduct.isOutOfStock
  ) {
    return Notification.CHANGE_OF_STOCK;
  }

  /**
   * 3. Discount crossed 40%
   */
  if (
    scrapedProduct.discountRate >=
      THRESHOLD_PERCENTAGE &&
    currentProduct.discountRate <
      THRESHOLD_PERCENTAGE
  ) {
    return Notification.THRESHOLD_MET;
  }

  return null;
};