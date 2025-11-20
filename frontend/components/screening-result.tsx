"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScreeningResult } from "@/types/screening";
import { cn } from "@/lib/utils";

interface Props {
  result: ScreeningResult;
}

const riskVariant: Record<string, "success" | "warning" | "danger" | "secondary"> = {
  high: "danger",
  medium: "warning",
  clear: "success",
  no_match: "secondary",
};

const sentimentVariant: Record<string, "default" | "success" | "danger" | "secondary"> = {
  negative: "danger",
  mixed: "secondary",
  positive: "success",
  neutral: "default",
};

export function ScreeningResultPanel({ result }: Props) {
  const { details } = result;
  const risk = result.overall_risk_label || "no_match";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-2xl font-semibold">
              Screening verdict
            </CardTitle>
            <CardDescription>High-level summary for analysts</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={riskVariant[risk] ?? "secondary"}>
              Risk: {risk.replace("_", " ")}
            </Badge>
            <Badge variant={result.is_subject_match ? "success" : "secondary"}>
              {result.is_subject_match ? "Match" : "No Match"}
            </Badge>
            <Badge variant="outline">Decision: {result.decision}</Badge>
            <Badge variant="outline">
              Confidence: {(result.match_confidence * 100).toFixed(0)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base leading-relaxed">
            {result.human_readable_summary}
          </p>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Audit notes
            </p>
            <pre className="mt-2 whitespace-pre-wrap rounded-md bg-secondary/60 p-3 text-sm">
              {result.audit_notes}
            </pre>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2">
        <InfoCard title="Article metadata" details={details.metadata} />
        <PeopleCard title="People" details={details.people} />
        <ContextCard title="Context" details={details.context} />
        <NameMatchCard title="Name match" details={details.name_match} />
        <DobCard title="DOB / Age" details={details.dob_age} />
        <SentimentCard title="Sentiment" details={details.sentiment} />
      </section>

      {details.article_text ? (
        <Card>
          <CardHeader>
            <CardTitle>Article transcript</CardTitle>
            <CardDescription>
              Reference text used for this screening decision.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 overflow-y-auto rounded-lg border bg-white p-4 text-sm leading-relaxed">
              {details.article_text}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

interface InfoCardProps {
  title: string;
  details: Record<string, any> | undefined;
}

function formatField(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) {
    if (!value.length) return "—";
    return value.join(", ");
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (typeof value === "number") {
    return value.toString();
  }
  return String(value);
}

function InfoCard({ title, details }: InfoCardProps) {
  const entries = Object.entries(details ?? {});

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {entries.length === 0 ? (
          <p className="text-muted-foreground">No data available.</p>
        ) : null}
        {entries.map(([key, value]) => (
          <div key={key}>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {key.replace(/_/g, " ")}
            </p>
            <p className="font-medium">{formatField(value)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function PeopleCard({ title, details }: InfoCardProps) {
  const { main_person, other_people, author_names, reasoning } = details ?? {};
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>Main vs supporting characters</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <Field label="Primary subject" value={main_person} />
        <Field label="Other people" value={other_people} />
        <Field label="Authors / bylines" value={author_names} />
        {reasoning ? (
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Reasoning</p>
            <p>{reasoning}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ContextCard({ title, details }: InfoCardProps) {
  const {
    locations,
    organisations,
    roles_or_occupations,
    subject_context_consistent,
    confidence,
    reasoning,
  } = details ?? {};
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>Geos, orgs, and roles linked to the subject.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <Field label="Locations" value={locations} />
        <Field label="Organisations" value={organisations} />
        <Field label="Roles or occupations" value={roles_or_occupations} />
        <Field label="Context consistent" value={mapBoolean(subject_context_consistent)} />
        <Field label="Confidence" value={confidence ? `${Math.round(confidence * 100)}%` : undefined} />
        {reasoning ? (
          <p className="text-muted-foreground">{reasoning}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function NameMatchCard({ title, details }: InfoCardProps) {
  const {
    subject_name_normalized,
    article_primary_names,
    is_name_potential_match,
    confidence,
    reasoning,
  } = details ?? {};
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>Name alignment evidence.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <Field label="Subject" value={subject_name_normalized} />
        <Field label="Article names" value={article_primary_names} />
        <Field label="Potential match" value={mapBoolean(is_name_potential_match ?? null)} />
        <Field label="Confidence" value={confidence ? `${Math.round(confidence * 100)}%` : undefined} />
        {reasoning ? (
          <p className="text-muted-foreground">{reasoning}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function DobCard({ title, details }: InfoCardProps) {
  const { dob_in_article, age_in_article, age_phrase, is_dob_or_age_consistent, confidence, reasoning } =
    details ?? {};
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>Date-of-birth or age evidence.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <Field label="DOB" value={dob_in_article} />
        <Field label="Age" value={age_in_article} />
        <Field label="Age phrase" value={age_phrase} />
        <Field label="Consistent" value={mapBoolean(is_dob_or_age_consistent ?? null)} />
        <Field label="Confidence" value={confidence ? `${Math.round(confidence * 100)}%` : undefined} />
        {reasoning ? <p className="text-muted-foreground">{reasoning}</p> : null}
      </CardContent>
    </Card>
  );
}

function SentimentCard({ title, details }: InfoCardProps) {
  const { overall_sentiment, is_adverse_media, adverse_categories, key_positives, key_negatives, reasoning } =
    details ?? {};
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>Adverse media classification.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex flex-wrap gap-2">
          {overall_sentiment ? (
            <Badge variant={sentimentVariant[overall_sentiment] ?? "secondary"}>
              Sentiment: {overall_sentiment}
            </Badge>
          ) : null}
          <Badge variant={is_adverse_media ? "danger" : "secondary"}>
            {is_adverse_media ? "Adverse" : "Not adverse"}
          </Badge>
        </div>
        <Field label="Categories" value={adverse_categories} />
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Key negatives</p>
          <ul className="list-disc space-y-1 pl-5">
            {key_negatives?.length ? key_negatives.map((item: string) => <li key={item}>{item}</li>) : <li>—</li>}
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Key positives</p>
          <ul className="list-disc space-y-1 pl-5">
            {key_positives?.length ? key_positives.map((item: string) => <li key={item}>{item}</li>) : <li>—</li>}
          </ul>
        </div>
        {reasoning ? <p className="text-muted-foreground">{reasoning}</p> : null}
      </CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-medium">{formatField(value)}</p>
    </div>
  );
}

function mapBoolean(value: boolean | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return value ? "Yes" : "No";
}
