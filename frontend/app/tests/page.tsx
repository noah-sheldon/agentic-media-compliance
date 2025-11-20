"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchTestResults } from "@/lib/api";
import { TestCaseRecord } from "@/types/screening";

const riskOptions = [
  { value: "all", label: "All risk levels" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "clear", label: "Clear" },
  { value: "no_match", label: "No match" },
];

const matchOptions = [
  { value: "all", label: "All matches" },
  { value: "matched", label: "Matches only" },
  { value: "not_matched", label: "Non-matches" },
];

const riskVariant: Record<string, "success" | "warning" | "danger" | "secondary"> = {
  high: "danger",
  medium: "warning", 
  clear: "success",
  no_match: "secondary",
};

export default function TestsPage() {
  const [records, setRecords] = useState<TestCaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<TestCaseRecord | null>(null);
  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [matchFilter, setMatchFilter] = useState("all");
  const [edgeFilter, setEdgeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const router = useRouter();

  function handleViewAnalysis(record: TestCaseRecord) {
    // Store result in session storage and navigate to analysis page
    sessionStorage.setItem('screening_result', JSON.stringify(record.output));
    router.push(`/analysis/${record.source_file}-${record.record_index}`);
  }

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchTestResults();
        setRecords(data);
        if (data.length > 0) {
          setSelectedRecord(data[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tests");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const edgeOptions = useMemo(() => {
    const values = Array.from(
      new Set(records.map((r) => r.input.edge_case_reason).filter(Boolean) as string[])
    );
    return [{ value: "all", label: "All edge cases" }, ...values.map((value) => ({ value, label: value }))];
  }, [records]);

  const filtered = useMemo(() => {
    const results = records.filter((record) => {
      if (query) {
        const haystack = `${record.title} ${record.input.subject_names?.join(" ")}`.toLowerCase();
        if (!haystack.includes(query.toLowerCase())) {
          return false;
        }
      }
      if (riskFilter !== "all" && record.output.overall_risk_label !== riskFilter) {
        return false;
      }
      if (matchFilter === "matched" && !record.output.is_subject_match) {
        return false;
      }
      if (matchFilter === "not_matched" && record.output.is_subject_match) {
        return false;
      }
      if (edgeFilter !== "all" && record.input.edge_case_reason !== edgeFilter) {
        return false;
      }
      return true;
    });
    
    // Reset to page 1 when filters change
    setCurrentPage(1);
    
    return results;
  }, [records, query, riskFilter, matchFilter, edgeFilter]);

  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-gray-900">Test Gallery</h1>
            <p className="text-gray-600 max-w-2xl">
              Browse curated test scenarios that demonstrate the AML screening pipeline across different risk levels and edge cases.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-96 flex flex-col space-y-6">
            {/* Filters */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Filter Tests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Search by title or subject..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                />
                <div className="grid gap-3 grid-cols-2">
                  <Select value={riskFilter} onValueChange={setRiskFilter}>
                    <SelectTrigger className="border-gray-200 focus:border-gray-400 focus:ring-gray-400">
                      <SelectValue placeholder="Risk Level" />
                    </SelectTrigger>
                    <SelectContent>
                      {riskOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={matchFilter} onValueChange={setMatchFilter}>
                    <SelectTrigger className="border-gray-200 focus:border-gray-400 focus:ring-gray-400">
                      <SelectValue placeholder="Match Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {matchOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {filtered.length > 0 && (
                  <div className="text-xs text-gray-500 mt-2">
                    Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} test{filtered.length !== 1 ? 's' : ''}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Test List */}
            <div className="space-y-3">
              {loading ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-3 text-gray-500">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Loading test scenarios...</span>
                    </div>
                  </CardContent>
                </Card>
              ) : error ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="py-8">
                    <p className="text-red-600 text-center">{error}</p>
                  </CardContent>
                </Card>
              ) : filtered.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="py-8">
                    <p className="text-gray-500 text-center">No tests match your current filters.</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="space-y-3">
                    {paginatedRecords.map((record) => (
                  <Card
                    key={`${record.source_file}-${record.record_index}`}
                    className={`cursor-pointer transition-all duration-200 border-0 shadow-sm hover:shadow-md ${
                      selectedRecord === record 
                        ? "ring-2 ring-gray-300 bg-gray-50 shadow-md" 
                        : "hover:bg-white"
                    }`}
                    onClick={() => setSelectedRecord(record)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 space-y-1">
                            <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                              {record.title}
                            </h3>
                            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                              {record.input.summary}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1.5 items-end">
                            <Badge 
                              variant={riskVariant[record.output.overall_risk_label] ?? "secondary"} 
                              className="text-xs font-medium"
                            >
                              {record.output.overall_risk_label.toUpperCase()}
                            </Badge>
                            <Badge 
                              variant={record.output.is_subject_match ? "success" : "secondary"} 
                              className="text-xs"
                            >
                              {record.output.is_subject_match ? "MATCH" : "NO MATCH"}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <span>Subject:</span>
                            <span className="font-medium text-gray-700">
                              {record.input.subject_names?.[0]}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewAnalysis(record);
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700 font-medium hover:underline transition-colors"
                          >
                            Analyze →
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                  </div>
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Previous
                      </Button>
                      
                      <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 p-0 ${
                              currentPage === page 
                                ? "bg-gray-800 text-white hover:bg-gray-900" 
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            }`}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Detail View */}
          <div className="flex-1">
            {selectedRecord ? (
              <div className="space-y-6">
                {/* Header */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <CardTitle className="text-xl text-gray-900">
                          {selectedRecord.title}
                        </CardTitle>
                        <p className="text-gray-600 leading-relaxed">
                          {selectedRecord.input.summary}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge 
                          variant={riskVariant[selectedRecord.output.overall_risk_label] ?? "secondary"}
                          className="text-sm px-3 py-1"
                        >
                          {selectedRecord.output.overall_risk_label.toUpperCase()}
                        </Badge>
                        <Badge 
                          variant={selectedRecord.output.is_subject_match ? "success" : "secondary"}
                          className="text-sm px-3 py-1"
                        >
                          {selectedRecord.output.is_subject_match ? "MATCH" : "NO MATCH"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div className="space-y-1">
                        <span className="text-gray-500">Subject</span>
                        <p className="font-semibold text-gray-900">
                          {selectedRecord.input.subject_names?.join(", ")}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-gray-500">Edge Case</span>
                        <p className="font-semibold text-gray-900">
                          {selectedRecord.input.edge_case_reason || "Standard case"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-gray-500">Date of Birth</span>
                        <p className="font-semibold text-gray-900">
                          {selectedRecord.input.dob_value || "Not provided"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-gray-500">Source Article</span>
                        <a
                          href={selectedRecord.input.article_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-gray-700 hover:text-gray-900 hover:underline"
                        >
                          View Article ↗
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Analysis Preview */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Analysis Preview</CardTitle>
                      <Button 
                        onClick={() => handleViewAnalysis(selectedRecord)}
                        className="bg-gray-800 hover:bg-gray-900 text-white"
                      >
                        View Full Analysis →
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <span className="text-sm text-gray-500">Decision</span>
                        <p className="text-lg font-semibold text-gray-900 capitalize">
                          {selectedRecord.output.decision.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm text-gray-500">Confidence Score</span>
                        <p className="text-lg font-semibold text-gray-900">
                          {Math.round(selectedRecord.output.match_confidence * 100)}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <span className="text-sm text-gray-500">Executive Summary</span>
                      <p className="text-gray-700 leading-relaxed">
                        {selectedRecord.output.human_readable_summary}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-0 shadow-sm h-96">
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Select a Test Case</h3>
                      <p className="text-gray-500 text-sm">Choose a test scenario from the sidebar to view detailed results.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
