import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TestCaseRecord } from "@/types/screening";

interface Props {
  record: TestCaseRecord;
}

const decisionVariant: Record<string, "success" | "warning" | "danger" | "secondary"> = {
  high_risk_escalate: "danger",
  needs_manual_review: "warning",
  discard_as_not_relevant: "secondary",
};

const riskVariant: Record<string, "success" | "warning" | "danger" | "secondary"> = {
  high: "danger",
  medium: "warning",
  clear: "success",
  no_match: "secondary",
};

export function TestResultCard({ record }: Props) {
  const { input, output } = record;
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle className="text-xl">{record.title}</CardTitle>
          <CardDescription>
            {input.subject_names?.join(", ") || "Unknown subject"}
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={riskVariant[output.overall_risk_label] ?? "secondary"}>
            Risk: {output.overall_risk_label}
          </Badge>
          <Badge variant={decisionVariant[output.decision] ?? "secondary"}>
            {output.decision.replace(/_/g, " ")}
          </Badge>
          <Badge variant={output.is_subject_match ? "success" : "secondary"}>
            {output.is_subject_match ? "Match" : "No match"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Edge case context
          </h4>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {input.summary}
          </p>
          <div className="rounded-lg border bg-secondary/40 p-4 text-sm">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Edge case reason
            </p>
            <p className="font-medium">{input.edge_case_reason || "—"}</p>
          </div>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-semibold">Article:</span>{" "}
              <a
                className="text-primary underline"
                href={input.article_link}
                target="_blank"
                rel="noreferrer"
              >
                {input.article_link}
              </a>
            </p>
            <p>
              <span className="font-semibold">Expected sentiment:</span> {input.sentiment || "—"}
            </p>
            <p>
              <span className="font-semibold">Subjects:</span> {input.subject_names?.join(", ")}
            </p>
          </div>
        </section>
        <section className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Pipeline decision
          </h4>
          <p className="text-sm leading-relaxed">{output.human_readable_summary}</p>
          <Separator />
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Audit notes</p>
            <pre className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap rounded-md bg-secondary/60 p-3 text-xs">
              {output.audit_notes}
            </pre>
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
