import React, { useState } from 'react';
import { FileText, Download, Calendar, BarChart3, TrendingDown, Building } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState<'personal' | 'business'>('personal');
  const [dateRange, setDateRange] = useState({ start: '2025-01-01', end: '2025-01-31' });
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data for reports
  const personalData = {
    totalEmissions: 285.4,
    reduction: 12.8,
    categories: { transport: 145.2, energy: 89.6, diet: 50.6 },
    monthlyTrend: [320, 295, 310, 285, 290, 285.4],
    goals: { target: 250, achieved: 285.4 },
  };

  const businessData = {
    totalEmissions: 1250.8,
    employees: 25,
    avgPerEmployee: 50.03,
    departments: {
      'IT': 320.5,
      'Operations': 455.2,
      'Sales': 275.1,
      'HR': 200.0,
    },
    compliance: {
      target: 1500,
      current: 1250.8,
      status: 'On Track',
    },
  };

  const generatePersonalReport = async () => {
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Header
      pdf.setFillColor(16, 185, 129);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.text('Climora - Personal Carbon Report', 20, 25);
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.text(`Report Period: ${dateRange.start} to ${dateRange.end}`, 20, 60);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 75);
      
      // Summary Section
      pdf.setFontSize(16);
      pdf.text('Executive Summary', 20, 100);
      
      pdf.setFontSize(12);
      pdf.text(`Total Carbon Footprint: ${personalData.totalEmissions} kg CO₂`, 20, 120);
      pdf.text(`Reduction from Previous Period: ${personalData.reduction}% `, 20, 135);
      pdf.text(`Status: ${personalData.totalEmissions < personalData.goals.target ? 'Meeting Goals' : 'Needs Improvement'}`, 20, 150);
      
      // Breakdown
      pdf.setFontSize(16);
      pdf.text('Emissions Breakdown', 20, 180);
      
      pdf.setFontSize(12);
      pdf.text(`Transport: ${personalData.categories.transport} kg CO₂ (${Math.round((personalData.categories.transport / personalData.totalEmissions) * 100)}%)`, 20, 200);
      pdf.text(`Energy: ${personalData.categories.energy} kg CO₂ (${Math.round((personalData.categories.energy / personalData.totalEmissions) * 100)}%)`, 20, 215);
      pdf.text(`Diet: ${personalData.categories.diet} kg CO₂ (${Math.round((personalData.categories.diet / personalData.totalEmissions) * 100)}%)`, 20, 230);
      
      // Recommendations
      pdf.setFontSize(16);
      pdf.text('Recommendations', 20, 260);
      
      pdf.setFontSize(12);
      const recommendations = [
        '• Consider using public transport or cycling for short trips',
        '• Switch to renewable energy sources if possible',
        '• Reduce meat consumption by 1-2 days per week',
        '• Use energy-efficient appliances and LED lighting',
      ];
      
      recommendations.forEach((rec, index) => {
        pdf.text(rec, 20, 280 + (index * 15));
      });
      
      pdf.save('climora-personal-report.pdf');
    } catch (error) {
      // Error generating report
    } finally {
      setIsGenerating(false);
    }
  };

  const generateBusinessReport = async () => {
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // Header
      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.text('Climora - Business Emission Report', 20, 25);
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.text(`Report Period: ${dateRange.start} to ${dateRange.end}`, 20, 60);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 75);
      
      // Company Overview
      pdf.setFontSize(16);
      pdf.text('Company Overview', 20, 100);
      
      pdf.setFontSize(12);
      pdf.text(`Total Employees: ${businessData.employees}`, 20, 120);
      pdf.text(`Total Emissions: ${businessData.totalEmissions} kg CO₂`, 20, 135);
      pdf.text(`Average per Employee: ${businessData.avgPerEmployee} kg CO₂`, 20, 150);
      
      // Compliance Status
      pdf.setFontSize(16);
      pdf.text('Compliance Status', 20, 180);
      
      pdf.setFontSize(12);
      pdf.text(`Target: ${businessData.compliance.target} kg CO₂`, 20, 200);
      pdf.text(`Current: ${businessData.compliance.current} kg CO₂`, 20, 215);
      pdf.text(`Status: ${businessData.compliance.status}`, 20, 230);
      pdf.text(`Remaining Budget: ${businessData.compliance.target - businessData.compliance.current} kg CO₂`, 20, 245);
      
      // Department Breakdown
      pdf.setFontSize(16);
      pdf.text('Department Breakdown', 20, 275);
      
      pdf.setFontSize(12);
      let yPos = 295;
      Object.entries(businessData.departments).forEach(([dept, emissions]) => {
        pdf.text(`${dept}: ${emissions} kg CO₂`, 20, yPos);
        yPos += 15;
      });
      
      // New page for recommendations
      pdf.addPage();
      
      pdf.setFontSize(16);
      pdf.text('Recommendations for Improvement', 20, 30);
      
      pdf.setFontSize(12);
      const businessRecommendations = [
        '• Implement remote work policies to reduce commuting emissions',
        '• Upgrade to energy-efficient equipment and LED lighting',
        '• Consider renewable energy contracts for office electricity',
        '• Encourage carpooling or public transport incentives',
        '• Set up recycling programs to reduce waste emissions',
        '• Monitor and optimize HVAC systems for efficiency',
      ];
      
      businessRecommendations.forEach((rec, index) => {
        pdf.text(rec, 20, 50 + (index * 15));
      });
      
      pdf.save('climora-business-report.pdf');
    } catch (error) {
      // Error generating report
    } finally {
      setIsGenerating(false);
    }
  };

  const personalChartData = {
    labels: ['Transport', 'Energy', 'Diet'],
    datasets: [{
      data: [personalData.categories.transport, personalData.categories.energy, personalData.categories.diet],
      backgroundColor: ['#EF4444', '#F59E0B', '#10B981'],
      borderWidth: 0,
    }],
  };

  const businessChartData = {
    labels: Object.keys(businessData.departments),
    datasets: [{
      label: 'Emissions (kg CO₂)',
      data: Object.values(businessData.departments),
      backgroundColor: '#3B82F6',
      borderRadius: 4,
    }],
  };

  const trendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Monthly Emissions',
      data: personalData.monthlyTrend,
      borderColor: '#10B981',
      backgroundColor: '#10B98120',
      fill: true,
      tension: 0.4,
    }],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Carbon Reports</h1>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as 'personal' | 'business')}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="personal">Personal Report</option>
            <option value="business">Business Report</option>
          </select>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-4">
          <Calendar className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-900">Report Period:</span>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Report Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Stats */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {reportType === 'personal' ? 'Personal Summary' : 'Business Summary'}
            </h2>
            
            {reportType === 'personal' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Emissions</span>
                  <span className="font-bold text-red-600">{personalData.totalEmissions} kg CO₂</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Reduction</span>
                  <span className="font-bold text-green-600">-{personalData.reduction}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Goal Progress</span>
                  <span className={`font-bold ${personalData.totalEmissions < personalData.goals.target ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.round((personalData.goals.target / personalData.totalEmissions) * 100)}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Emissions</span>
                  <span className="font-bold text-red-600">{businessData.totalEmissions} kg CO₂</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Employees</span>
                  <span className="font-bold text-blue-600">{businessData.employees}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Per Employee</span>
                  <span className="font-bold text-gray-900">{businessData.avgPerEmployee} kg CO₂</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Compliance</span>
                  <span className="font-bold text-green-600">{businessData.compliance.status}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {reportType === 'personal' ? 'Emissions by Category' : 'Emissions by Department'}
            </h3>
            <div className="h-64">
              {reportType === 'personal' ? (
                <Pie data={personalChartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom' } },
                }} />
              ) : (
                <Bar data={businessChartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } },
                }} />
              )}
            </div>
          </div>

          {reportType === 'personal' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h3>
              <div className="h-64">
                <Line data={trendData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } },
                }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generate Report Button */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Generate PDF Report</h3>
            <p className="text-gray-600">
              Create a comprehensive {reportType} carbon footprint report with detailed analysis and recommendations.
            </p>
          </div>
          <button
            onClick={reportType === 'personal' ? generatePersonalReport : generateBusinessReport}
            disabled={isGenerating}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Report Templates */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Report Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
            <div className="flex items-center space-x-3 mb-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h3 className="font-medium text-gray-900">Monthly Summary</h3>
            </div>
            <p className="text-sm text-gray-600">
              Complete monthly carbon footprint analysis with trends and comparisons.
            </p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
            <div className="flex items-center space-x-3 mb-2">
              <TrendingDown className="w-6 h-6 text-green-600" />
              <h3 className="font-medium text-gray-900">Reduction Report</h3>
            </div>
            <p className="text-sm text-gray-600">
              Focus on emission reductions and progress towards sustainability goals.
            </p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
            <div className="flex items-center space-x-3 mb-2">
              <Building className="w-6 h-6 text-purple-600" />
              <h3 className="font-medium text-gray-900">Compliance Report</h3>
            </div>
            <p className="text-sm text-gray-600">
              Detailed compliance analysis for regulatory requirements and standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;