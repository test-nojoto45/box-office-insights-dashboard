
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { formatMethodName } from "@/utils/chartConfig";

interface DrillDownControlsProps {
  drillDownMethod: string | null;
  onBack: () => void;
}

const DrillDownControls: React.FC<DrillDownControlsProps> = ({
  drillDownMethod,
  onBack
}) => {
  if (!drillDownMethod) return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onBack}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {formatMethodName(drillDownMethod)} Overview
      </Button>
      <span className="text-sm text-gray-600">
        Showing {formatMethodName(drillDownMethod)} breakdown
      </span>
    </div>
  );
};

export default DrillDownControls;
