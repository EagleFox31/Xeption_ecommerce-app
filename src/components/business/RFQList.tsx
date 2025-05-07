import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { RFQRequest, updateRFQRequestStatus } from "@/services/rfqService";

interface RFQListProps {
  rfqs: RFQRequest[];
  loading?: boolean;
  onStatusUpdate?: (rfqId: string, newStatus: RFQRequest["status"]) => void;
}

const RFQList: React.FC<RFQListProps> = ({
  rfqs,
  loading = false,
  onStatusUpdate,
}) => {
  const getStatusBadge = (status: RFQRequest["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
          >
            En attente
          </Badge>
        );
      case "processing":
        return (
          <Badge
            variant="outline"
            className="bg-blue-500/10 text-blue-500 border-blue-500/20"
          >
            En traitement
          </Badge>
        );
      case "quoted":
        return (
          <Badge
            variant="outline"
            className="bg-purple-500/10 text-purple-500 border-purple-500/20"
          >
            Devis envoyé
          </Badge>
        );
      case "accepted":
        return (
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-500 border-green-500/20"
          >
            Accepté
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-500/10 text-red-500 border-red-500/20"
          >
            Rejeté
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-gold-500/10 text-gold-500 border-gold-500/20"
          >
            Complété
          </Badge>
        );
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const handleStatusUpdate = (
    rfqId: string,
    newStatus: RFQRequest["status"],
  ) => {
    if (onStatusUpdate) {
      onStatusUpdate(rfqId, newStatus);
    }
  };

  if (loading) {
    return <p className="text-center py-8 text-gray-400">Chargement...</p>;
  }

  if (rfqs.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 mx-auto text-gray-600 mb-3" />
        <p className="text-gray-400">
          Vous n'avez pas encore de demandes de devis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rfqs.map((rfq) => (
        <div key={rfq.id} className="p-4 border border-gray-800 rounded-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <div className="flex items-center">
                <h3 className="font-medium text-white">
                  {rfq.productCategory}
                </h3>
                <span className="mx-2 text-gray-500">•</span>
                <span className="text-sm text-gray-400">{rfq.id}</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Quantité: {rfq.quantity} • Délai: {rfq.timeframe}
              </p>
            </div>
            <div className="mt-2 md:mt-0 flex items-center">
              {getStatusBadge(rfq.status)}
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 text-gray-400 hover:text-white"
                onClick={() =>
                  handleStatusUpdate(
                    rfq.id,
                    rfq.status === "pending"
                      ? "quoted"
                      : rfq.status === "quoted"
                        ? "accepted"
                        : "completed",
                  )
                }
              >
                {rfq.status === "pending"
                  ? "Marquer comme devisé"
                  : rfq.status === "quoted"
                    ? "Accepter le devis"
                    : rfq.status === "accepted"
                      ? "Marquer comme complété"
                      : "Détails"}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RFQList;
