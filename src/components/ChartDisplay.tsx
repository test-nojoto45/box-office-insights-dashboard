
import React from 'react';
import PaymentBarChart from './PaymentBarChart';
import PaymentLineChart from './PaymentLineChart';
import PaymentPieChart from './PaymentPieChart';

interface ChartDisplayProps {
  data: any[];
  viewType: string;
  chartMetric: string;
  emiTypes?: string[];
  paymentStatuses?: string[];
}

const ChartDisplay: React.FC<ChartDisplayProps> = ({
  data,
  viewType,
  chartMetric,
  emiTypes = [],
  paymentStatuses = []
}) => {
  // Show pie chart if payment status is specifically filtered to only "failure"
  const showPieChart = paymentStatuses.length === 1 && paymentStatuses.includes("failure");
  
  // Show line chart by default
  const showLineChart = !showPieChart;
  
  return (
    <div className="h-96 w-full">
      {showPieChart && (
        <PaymentPieChart 
          data={data} 
          viewType={viewType} 
        />
      )}
      
      {showLineChart && (
        <PaymentLineChart
          data={data}
          viewType={viewType}
          chartMetric={chartMetric}
          emiTypes={emiTypes}
          paymentStatuses={paymentStatuses}
        />
      )}
    </div>
  );
};

export default ChartDisplay;
