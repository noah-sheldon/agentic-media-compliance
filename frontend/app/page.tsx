"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { runScreeningRequest } from "@/lib/api";
import { ScreeningResult } from "@/types/screening";

export default function ScreeningPage() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name || !url) {
      setError("Name and article URL are required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await runScreeningRequest({
        name,
        url,
        dob: dob || undefined,
      });
      
      // Store result in session storage and navigate to analysis page
      sessionStorage.setItem('screening_result', JSON.stringify(response));
      router.push(`/analysis/${Date.now()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run screening");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Header Section */}

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Input Panel */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
                <CardTitle className="text-xl text-gray-800">
                  Screening Input
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Enter subject details and article URL to begin analysis
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Subject Full Name *
                      </Label>
                      <Input
                        id="name"
                        placeholder="e.g., Vijay Mallya"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="dob"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Date of Birth
                      </Label>
                      <Input
                        id="dob"
                        placeholder="DD/MM/YYYY or age (optional)"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="url"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Article URL *
                      </Label>
                      <Input
                        id="url"
                        type="url"
                        placeholder="https://www.bbc.co.uk/news/..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {error ? (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  ) : null}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-medium"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing Screening...
                      </span>
                    ) : (
                      "Run AML Screening"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quick Examples */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">
                  Quick Examples
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-700">
                    High Risk Case
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setName("Vijay Mallya");
                      setDob("18/12/1955");
                      setUrl("https://www.bbc.co.uk/news/62131024");
                    }}
                    className="text-left p-2 w-full text-sm bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors"
                  >
                    <span className="font-medium">Vijay Mallya</span> -
                    Financial fraud case
                  </button>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-700">
                    Clear Case
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setName("Joseph Mason");
                      setDob("");
                      setUrl(
                        "https://www.bbc.co.uk/news/articles/cdeg8enengxo"
                      );
                    }}
                    className="text-left p-2 w-full text-sm bg-green-50 border border-green-200 rounded hover:bg-green-100 transition-colors"
                  >
                    <span className="font-medium">Joseph Mason</span> - Bank
                    fraud conviction
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
