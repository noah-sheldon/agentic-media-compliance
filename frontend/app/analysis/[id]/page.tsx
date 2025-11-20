"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Users, MapPin, Calendar, TrendingDown, Shield, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScreeningResult } from "@/types/screening";

const riskVariant: Record<string, "success" | "warning" | "danger" | "secondary"> = {
  high: "danger",
  medium: "warning", 
  clear: "success",
  no_match: "secondary",
};

const riskColors = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  clear: "bg-green-500",
  no_match: "bg-gray-400",
};

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd fetch the result by ID
    // For now, we'll get it from localStorage or sessionStorage
    const savedResult = sessionStorage.getItem('screening_result');
    if (savedResult) {
      setResult(JSON.parse(savedResult));
    }
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <XCircle className="h-12 w-12 text-gray-400 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-900">Analysis Not Found</h2>
          <p className="text-gray-600">The requested analysis could not be found.</p>
          <Button onClick={() => router.push('/')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Screening
          </Button>
        </div>
      </div>
    );
  }

  const riskLevel = result.overall_risk_label || "no_match";
  const confidence = Math.round(result.match_confidence * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analysis Results</h1>
                <p className="text-sm text-gray-600">Comprehensive AML screening report</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant={riskVariant[riskLevel]} className="text-sm px-3 py-1">
                {riskLevel.toUpperCase()}
              </Badge>
              <Badge variant={result.is_subject_match ? "success" : "secondary"} className="text-sm px-3 py-1">
                {result.is_subject_match ? "MATCH" : "NO MATCH"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Executive Summary */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span>Executive Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-3">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-gray-200"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${confidence * 2.51} 251`}
                      className={confidence > 75 ? "text-red-500" : confidence > 50 ? "text-yellow-500" : "text-green-500"}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold">{confidence}%</span>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900">Confidence</h3>
                <p className="text-sm text-gray-600">Match Probability</p>
              </div>

              <div className="text-center">
                <div className={`w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center ${riskColors[riskLevel]}`}>
                  {riskLevel === "high" && <AlertTriangle className="h-8 w-8 text-white" />}
                  {riskLevel === "medium" && <AlertTriangle className="h-8 w-8 text-white" />}
                  {riskLevel === "clear" && <CheckCircle className="h-8 w-8 text-white" />}
                  {riskLevel === "no_match" && <XCircle className="h-8 w-8 text-white" />}
                </div>
                <h3 className="font-semibold text-gray-900">Risk Level</h3>
                <p className="text-sm text-gray-600 capitalize">{riskLevel.replace('_', ' ')}</p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Decision</h3>
                <p className="text-sm text-gray-600 capitalize">{result.decision.replace(/_/g, ' ')}</p>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Analysis Summary</h4>
              <p className="text-gray-700 leading-relaxed">{result.human_readable_summary}</p>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Analysis Tabs */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            <Tabs defaultValue="overview" className="w-full">
              <div className="border-b bg-gray-50">
                <TabsList className="grid w-full grid-cols-6 bg-transparent h-auto p-0">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none py-4">
                    <Shield className="h-4 w-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="identity" className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none py-4">
                    <Users className="h-4 w-4 mr-2" />
                    Identity
                  </TabsTrigger>
                  <TabsTrigger value="context" className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none py-4">
                    <MapPin className="h-4 w-4 mr-2" />
                    Context
                  </TabsTrigger>
                  <TabsTrigger value="sentiment" className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none py-4">
                    <TrendingDown className="h-4 w-4 mr-2" />
                    Sentiment
                  </TabsTrigger>
                  <TabsTrigger value="article" className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none py-4">
                    <FileText className="h-4 w-4 mr-2" />
                    Article
                  </TabsTrigger>
                  <TabsTrigger value="audit" className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none py-4">
                    <Calendar className="h-4 w-4 mr-2" />
                    Audit
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="p-6 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Analysis Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Name Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Match Confidence</span>
                          <span className="font-semibold">{Math.round(result.details.name_match.confidence * 100)}%</span>
                        </div>
                        <Progress value={result.details.name_match.confidence * 100} className="h-2" />
                        <p className="text-sm text-gray-600">
                          {result.details.name_match.is_name_potential_match ? "Potential match identified" : "No match found"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Age/DOB Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Confidence</span>
                          <span className="font-semibold">{Math.round(result.details.dob_age.confidence * 100)}%</span>
                        </div>
                        <Progress value={result.details.dob_age.confidence * 100} className="h-2" />
                        <p className="text-sm text-gray-600">
                          {result.details.dob_age.dob_in_article || result.details.dob_age.age_in_article 
                            ? "Age/DOB information found" 
                            : "No age/DOB information available"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Risk Factors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.details.sentiment.adverse_categories.map((category, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <span className="font-medium text-red-900 capitalize">{category.replace(/_/g, ' ')}</span>
                          <Badge variant="danger" className="text-xs">High Risk</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="identity" className="p-6 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Identity Analysis</h3>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="name-match">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center justify-between w-full mr-4">
                        <span>Name Matching Analysis</span>
                        <Badge variant={result.details.name_match.is_name_potential_match ? "success" : "secondary"}>
                          {result.details.name_match.is_name_potential_match ? "Match" : "No Match"}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Subject Name (Normalized):</span>
                          <p className="font-medium">{result.details.name_match.subject_name_normalized}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Article Names Found:</span>
                          <p className="font-medium">{result.details.name_match.article_primary_names.join(", ")}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-sm text-gray-600">Confidence Score</span>
                        <Progress value={result.details.name_match.confidence * 100} className="h-3" />
                        <span className="text-xs text-gray-500">{Math.round(result.details.name_match.confidence * 100)}% match probability</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Reasoning:</span>
                        <p className="text-sm text-gray-600 mt-1">{result.details.name_match.reasoning}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="dob-analysis">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center justify-between w-full mr-4">
                        <span>Date of Birth Analysis</span>
                        <Badge variant={result.details.dob_age.is_dob_or_age_consistent === null ? "secondary" : result.details.dob_age.is_dob_or_age_consistent ? "success" : "danger"}>
                          {result.details.dob_age.is_dob_or_age_consistent === null ? "No Data" : result.details.dob_age.is_dob_or_age_consistent ? "Consistent" : "Inconsistent"}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">DOB in Article:</span>
                          <p className="font-medium">{result.details.dob_age.dob_in_article || "—"}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Age in Article:</span>
                          <p className="font-medium">{result.details.dob_age.age_in_article || "—"}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Analysis:</span>
                        <p className="text-sm text-gray-600 mt-1">{result.details.dob_age.reasoning}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="people">
                    <AccordionTrigger className="text-left">
                      <span>People Mentioned in Article</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-gray-600">Main Person:</span>
                          <p className="font-medium">{result.details.people.main_person || "—"}</p>
                        </div>
                        {result.details.people.other_people && result.details.people.other_people.length > 0 && (
                          <div>
                            <span className="text-sm text-gray-600">Other People:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {result.details.people.other_people.map((person, index) => (
                                <Badge key={index} variant="outline">{person}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Analysis:</span>
                        <p className="text-sm text-gray-600 mt-1">{result.details.people.reasoning}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>

              <TabsContent value="context" className="p-6 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Contextual Analysis</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        Locations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {result.details.context.locations && result.details.context.locations.length > 0 ? (
                          result.details.context.locations.map((location, index) => (
                            <Badge key={index} variant="outline" className="mr-2">{location}</Badge>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No locations identified</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        Organizations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {result.details.context.organisations && result.details.context.organisations.length > 0 ? (
                          result.details.context.organisations.map((org, index) => (
                            <Badge key={index} variant="outline" className="mr-2">{org}</Badge>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No organizations identified</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        Roles
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {result.details.context.roles_or_occupations && result.details.context.roles_or_occupations.length > 0 ? (
                          result.details.context.roles_or_occupations.map((role, index) => (
                            <Badge key={index} variant="outline" className="mr-2">{role}</Badge>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No roles identified</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Context Consistency Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Subject Context Consistent</span>
                      <Badge variant={result.details.context.subject_context_consistent ? "success" : "danger"}>
                        {result.details.context.subject_context_consistent ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Confidence</span>
                        <span className="font-semibold">{Math.round((result.details.context.confidence || 0) * 100)}%</span>
                      </div>
                      <Progress value={(result.details.context.confidence || 0) * 100} className="h-2" />
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Reasoning:</span>
                      <p className="text-sm text-gray-600 mt-1">{result.details.context.reasoning}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sentiment" className="p-6 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Sentiment & Risk Analysis</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Overall Sentiment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 ${
                          result.details.sentiment.overall_sentiment === 'negative' ? 'bg-red-100' :
                          result.details.sentiment.overall_sentiment === 'positive' ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <TrendingDown className={`h-8 w-8 ${
                            result.details.sentiment.overall_sentiment === 'negative' ? 'text-red-600' :
                            result.details.sentiment.overall_sentiment === 'positive' ? 'text-green-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <Badge variant={
                          result.details.sentiment.overall_sentiment === 'negative' ? 'danger' :
                          result.details.sentiment.overall_sentiment === 'positive' ? 'success' : 'secondary'
                        } className="text-sm">
                          {result.details.sentiment.overall_sentiment.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Adverse Media</span>
                          <Badge variant={result.details.sentiment.is_adverse_media ? "danger" : "success"}>
                            {result.details.sentiment.is_adverse_media ? "Yes" : "No"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Adverse Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {result.details.sentiment.adverse_categories.length > 0 ? (
                          result.details.sentiment.adverse_categories.map((category, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                              <span className="text-sm font-medium capitalize">{category.replace(/_/g, ' ')}</span>
                              <Badge variant="danger" className="text-xs">Risk</Badge>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No adverse categories identified</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base text-red-600">Key Negatives</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.details.sentiment.key_negatives.length > 0 ? (
                          result.details.sentiment.key_negatives.map((negative, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start">
                              <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {negative}
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-gray-500">No negative factors identified</li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base text-green-600">Key Positives</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.details.sentiment.key_positives.length > 0 ? (
                          result.details.sentiment.key_positives.map((positive, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start">
                              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {positive}
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-gray-500">No positive factors identified</li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Sentiment Analysis Reasoning</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">{result.details.sentiment.reasoning}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="article" className="p-6 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Article Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Metadata</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Title:</span>
                        <p className="font-medium">{result.details.metadata.title || "—"}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Published:</span>
                        <p className="font-medium">{result.details.metadata.published_date || "—"}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Source:</span>
                        <p className="font-medium">{result.details.metadata.source_domain || "—"}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Section:</span>
                        <p className="font-medium">{result.details.metadata.section || "—"}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Recent Article:</span>
                        <Badge variant={result.details.metadata.is_recent ? "success" : "secondary"}>
                          {result.details.metadata.is_recent ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Metadata Analysis:</span>
                        <p className="text-sm text-gray-600 mt-1">{result.details.metadata.reasoning}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {result.details.article_text && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Article Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg text-sm leading-relaxed">
                        {result.details.article_text}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="audit" className="p-6 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Audit Trail</h3>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Audit Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg text-gray-700">
                      {result.audit_notes}
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Decision Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-blue-600">1</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">Article Metadata Analysis</h4>
                          <p className="text-sm text-gray-600">Article information extracted and validated</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-blue-600">2</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">Identity Verification</h4>
                          <p className="text-sm text-gray-600">Name matching and DOB analysis completed</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-blue-600">3</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">Context Analysis</h4>
                          <p className="text-sm text-gray-600">Locations, organizations, and roles identified</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-blue-600">4</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">Sentiment Analysis</h4>
                          <p className="text-sm text-gray-600">Adverse content and risk factors assessed</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">Final Decision</h4>
                          <p className="text-sm text-gray-600">Risk assessment completed and decision rendered</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}