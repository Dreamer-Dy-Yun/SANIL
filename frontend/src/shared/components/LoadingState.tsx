export function LoadingState({ label = "불러오는 중" }: { label?: string }) {
  return <div className="state-panel">{label}</div>;
}
