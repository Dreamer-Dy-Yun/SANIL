import { toApiError } from "../../api/errors";

export function ErrorState({ error }: { error: unknown }) {
  const apiError = toApiError(error);
  return (
    <div className="state-panel state-panel--error">
      <strong>{apiError.message}</strong>
      <span>오류 유형: {apiError.kind}</span>
    </div>
  );
}
