import clsx from "clsx";

export const InfoRow = ({
  label,
  value,
  mono,
}: {
  label: string;
  value?: React.ReactNode;
  mono?: boolean;
}) => (
  <div className="flex justify-between gap-4">
    <span className="text-slate-500 shrink-0">{label}:</span>
    <span className={clsx("text-right break-all", mono && "font-mono text-xs")}>
      {value ?? "-"}
    </span>
  </div>
);
