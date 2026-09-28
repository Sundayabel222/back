import type { DisputeReviewItem, DisputeReviewReader } from '../domain/index.js';

export interface ListOpenDisputesDeps {
  disputeReviewReader: DisputeReviewReader;
}

/**
 * Creates the use case for listing disputes that are awaiting administrative
 * review.
 *
 * @param deps - Use case dependencies; requires a `disputeReviewReader` used
 *   to retrieve the currently open disputes.
 * @returns An async function that resolves to the open dispute review items.
 */
export function createListOpenDisputesUseCase(deps: ListOpenDisputesDeps) {
  return async function listOpenDisputes(): Promise<DisputeReviewItem[]> {
    return deps.disputeReviewReader.listOpenDisputes();
  };
}
