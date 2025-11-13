import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
  ArrowLeft,
  Search,
  Trophy,
  Eye,
  Calendar,
  User,
  Target,
  AlertTriangle,
  RefreshCw,
  BookOpen
} from "lucide-react";
import "../pages/myscores.css";

export default function MentorResults() {
  const [studentResults, setStudentResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingResults, setLoadingResults] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch student results
  const fetchStudentResults = async () => {
    setLoadingResults(true);
    setError(null);
    try {
      console.log("Fetching mentor results...");
      
      // Try the primary endpoint
      const response = await api.get("/submissions/mentor");
      console.log("Primary response:", response.data);
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setStudentResults(response.data);
        setFilteredResults(response.data);
      } else {
        // Try the fallback endpoint
        const fallbackResponse = await api.get("/submissions/all-for-mentor");
        if (fallbackResponse.data && Array.isArray(fallbackResponse.data)) {
          setStudentResults(fallbackResponse.data);
          setFilteredResults(fallbackResponse.data);
        } else {
          setStudentResults([]);
          setFilteredResults([]);
        }
      }
    } catch (err) {
      console.error("Error fetching student results:", err);
      
      // Handle different types of errors
      if (err.response) {
        // Server responded with error status
        if (err.response.status === 401) {
          setError("Authentication failed. Please log in again.");
        } else if (err.response.status === 500) {
          setError("Server error. Please try again later or contact support.");
        } else {
          setError(`Server error: ${err.response.data?.message || err.response.statusText}`);
        }
      } else if (err.request) {
        // Request was made but no response received
        setError("Network error. Please check your connection and try again.");
      } else {
        // Something else happened
        setError(err.message || "Failed to fetch results");
      }
      
      // Try the fallback endpoint on error
      try {
        const fallbackResponse = await api.get("/submissions/all-for-mentor");
        if (fallbackResponse.data && Array.isArray(fallbackResponse.data)) {
          setStudentResults(fallbackResponse.data);
          setFilteredResults(fallbackResponse.data);
        } else {
          setStudentResults([]);
          setFilteredResults([]);
        }
      } catch (fallbackErr) {
        console.error("Error with fallback endpoint:", fallbackErr);
        // Don't override the original error message
        setStudentResults([]);
        setFilteredResults([]);
      }
    } finally {
      setLoadingResults(false);
    }
  };

  // Fetch student results on component mount
  useEffect(() => {
    fetchStudentResults();
  }, []);

  // Filter results
  useEffect(() => {
    let results = [...studentResults];

    if (searchTerm) {
      results = results.filter(result => {
        const studentName =
          result.student?.name ||
          result.userId?.name ||
          result.studentName ||
          "Unknown Student";
        const testName =
          result.test?.name ||
          result.testId?.name ||
          result.testName ||
          "Unknown Test";
        return (
          studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          testName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    setFilteredResults(results);
  }, [studentResults, searchTerm]);

  const getColor = (percent) => {
    if (percent < 35) return "#ef4444";
    if (percent <= 80) return "#f59e0b";
    return "#10b981";
  };

  const getGrade = (percent) => {
    if (percent >= 90) return "A+";
    if (percent >= 80) return "A";
    if (percent >= 70) return "B+";
    if (percent >= 60) return "B";
    if (percent >= 50) return "C";
    if (percent >= 35) return "D";
    return "F";
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "Invalid Date";
    }
  };

  // Group results by test name
  const groupedResults = filteredResults.reduce((acc, result) => {
    const testName = 
      result.test?.name ||
      result.testId?.name ||
      result.testName ||
      "Unknown Test";
    
    if (!acc[testName]) acc[testName] = [];
    acc[testName].push(result);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard/mentor")}
            className="flex items-center text-gray-600 mb-4 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Results</h1>
          <p className="text-gray-600">View and analyze student performance</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">All Student Results</h2>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by student or test name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
                />
              </div>
              <button
                onClick={fetchStudentResults}
                disabled={loadingResults}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
              >
                <RefreshCw className={`w-4 h-4 ${loadingResults ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Results Content */}
        {loadingResults ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading results...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Results</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={fetchStudentResults}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate("/dashboard/mentor")}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
            <div className="text-gray-600 max-w-2xl mx-auto">
              <p className="mb-4">
                {searchTerm
                  ? "No results match your search criteria."
                  : "No student results available yet. Students need to complete tests before results will appear here."}
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-800 mb-2">Important Note:</h4>
                <p className="text-blue-700">
                  You can only see results for tests that you have created. If students have completed exams but you don't see results here, 
                  please check if:
                </p>
                <ul className="list-disc list-inside text-blue-700 mt-2 text-left">
                  <li>You created the test using your current login credentials</li>
                  <li>Students submitted the correct test (matching the one you created)</li>
                  <li>The test was successfully saved in the database</li>
                </ul>
              </div>
              <button
                onClick={fetchStudentResults}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Refresh Results
              </button>
            </div>
          </div>
        ) : (
          /* Results by Test */
          <div className="space-y-8">
            {Object.entries(groupedResults).map(([testName, testResults], index) => (
              <div key={testName} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {testName} ({testResults.length} Students)
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {testResults.map((result, resultIndex) => {
                    const obtained = result.obtainedMarks || 0;
                    const total =
                      result.totalMarks ||
                      result.test?.totalMarks ||
                      result.testId?.totalMarks ||
                      100;
                    const percent = total > 0 ? (obtained / total) * 100 : 0;
                    const grade = getGrade(percent);
                    const studentName =
                      result.student?.name ||
                      result.userId?.name ||
                      result.studentName ||
                      "Unknown Student";
                    const submittedAt = result.submittedAt || new Date();
                    const submissionReason = result.submissionReason || "Test completed";
                    const violationReason = result.violationReason || "";

                    return (
                      <div
                        key={result._id || resultIndex}
                        className="border-2 border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer score-card"
                        onClick={() =>
                          setSelectedResult({
                            ...result,
                            percent,
                            grade,
                            studentName,
                            testName,
                            obtained,
                            total,
                            submittedAt,
                            submissionReason,
                            violationReason
                          })
                        }
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-gray-900 text-lg truncate test-name">
                            {studentName}
                          </h3>
                          <span 
                            className="px-2 py-1 rounded text-sm font-bold text-white grade-badge"
                            style={{ backgroundColor: getColor(percent) }}
                          >
                            {grade}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Score:</span>
                            <span className="font-semibold" style={{ color: getColor(percent) }}>
                              {obtained}/{total} ({percent.toFixed(1)}%)
                            </span>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Date:</span>
                            <span className="text-gray-700 date-value">{formatDate(submittedAt)}</span>
                          </div>
                          
                          {submissionReason && submissionReason !== "Test completed" && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Reason:</span>
                              <span className="text-gray-700 date-value truncate" title={submissionReason}>
                                {submissionReason}
                              </span>
                            </div>
                          )}
                          
                          {violationReason && (
                            <div className="flex items-center text-sm text-red-600">
                              <AlertTriangle className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate" title={violationReason}>
                                Violation
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <button
                          className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium view-details-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedResult({
                              ...result,
                              percent,
                              grade,
                              studentName,
                              testName,
                              obtained,
                              total,
                              submittedAt,
                              submissionReason,
                              violationReason
                            });
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Result Details Modal */}
        {selectedResult && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2 className="modal-title">Test Result Details</h2>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="close-btn"
                >
                  ×
                </button>
              </div>
              
              <div className="modal-content">
                <div className="test-info">
                  <h3>{selectedResult.studentName}</h3>
                  <p className="test-category">Student</p>
                  <h3 className="mt-3">{selectedResult.testName}</h3>
                  <p className="test-category">Test Name</p>
                </div>
                
                <div className="score-summary">
                  <div className="score-summary-row">
                    <span className="score-summary-label">Score:</span>
                    <span 
                      className="score-summary-value"
                      style={{ color: getColor(selectedResult.percent) }}
                    >
                      {selectedResult.obtained}/{selectedResult.total}
                    </span>
                  </div>
                  
                  <div className="score-summary-row">
                    <span className="score-summary-label">Percentage:</span>
                    <span 
                      className="score-summary-value"
                      style={{ color: getColor(selectedResult.percent) }}
                    >
                      {selectedResult.percent.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="score-summary-row">
                    <span className="score-summary-label">Grade:</span>
                    <span 
                      className="score-summary-value final-grade"
                      style={{ backgroundColor: getColor(selectedResult.percent) }}
                    >
                      {selectedResult.grade}
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="submission-date">
                    <strong>Submitted:</strong> {formatDate(selectedResult.submittedAt)}
                  </p>
                  {selectedResult.submissionReason && selectedResult.submissionReason !== "Test completed" && (
                    <p className="submission-date mt-2">
                      <strong>Reason:</strong> {selectedResult.submissionReason}
                    </p>
                  )}
                  {selectedResult.violationReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                      <p className="text-sm text-red-600 mb-1 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        <strong>Violation Detected</strong>
                      </p>
                      <p className="text-red-800">{selectedResult.violationReason}</p>
                    </div>
                  )}
                </div>
                
                <div className="performance-analysis">
                  <h4 className="analysis-title">Performance Analysis</h4>
                  <p className="analysis-text">
                    {selectedResult.percent < 35
                      ? "This student's performance needs significant improvement. Consider providing additional support and resources to help them understand basic concepts."
                      : selectedResult.percent <= 60
                      ? "Good effort from this student. They understand the basics but need to work on accuracy and speed. Encourage them to review incorrect answers and practice more."
                      : selectedResult.percent <= 80
                      ? "Great work by this student. They have a solid understanding. Suggest focusing on mastering advanced concepts and optimizing their approach."
                      : "Excellent performance! This student demonstrates strong mastery of the subject. Encourage them to continue their outstanding work and consider mentoring others."
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}