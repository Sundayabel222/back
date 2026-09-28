import type { DisputeReviewItem, DisputeReviewReader } from '../domain/index.js';

export interface ListOpenDisputesDeps {
  disputeReviewReader: DisputeReviewReader;
}

export interface ListOpenDisputesInput {
  limit?: number;
  /** Cursor returned by the previous page. */
  after?: string;
}

export interface ListOpenDisputesResult {
  items: DisputeReviewItem[];
  nextCursor: string | null;
  limit: number;
}

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;
const MAX_CHAIN_DELIVERY_ID = 9_223_372_036_854_775_807n;

function decodeCursor(cursor: string): { raisedAt: Date; chainDeliveryId: bigint } {
  const separatorIndex = cursor.indexOf('|');
  if (separatorIndex <= 0 || separatorIndex !== cursor.lastIndexOf('|')) {
    throw new Error('Invalid dispute cursor');
  }

  const raisedAtText = cursor.slice(0, separatorIndex);
  const raisedAt = new Date(raisedAtText);
  const chainDeliveryIdText = cursor.slice(separatorIndex + 1);
  if (
    !Number.isFinite(raisedAt.getTime()) ||
    raisedAt.toISOString() !== raisedAtText ||
    !/^(0|[1-9]\d{0,18})$/.test(chainDeliveryIdText)
  ) {
    throw new Error('Invalid dispute cursor');
  }

  const chainDeliveryId = BigInt(chainDeliveryIdText);
  if (chainDeliveryId > MAX_CHAIN_DELIVERY_ID) {
    throw new Error('Invalid dispute cursor');
  }
  return { raisedAt, chainDeliveryId };
}

export function createListOpenDisputesUseCase(deps: ListOpenDisputesDeps) {
  return async function listOpenDisputes(
    input: ListOpenDisputesInput = {},
  ): Promise<ListOpenDisputesResult> {
    const limit = Math.min(input.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const page = await deps.disputeReviewReader.listOpenDisputes({
      limit,
      ...(input.after && { after: decodeCursor(input.after) }),
    });
    const hasMore = page.length > limit;
    const items = page.slice(0, limit);
    const lastItem = items[items.length - 1];
    const nextCursor =
      hasMore && lastItem
        ? `${lastItem.raisedAt.toISOString()}|${lastItem.chainDeliveryId.toString()}`
        : null;

    return { items, nextCursor, limit };
  };
}
