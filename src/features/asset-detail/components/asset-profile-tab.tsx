// src/features/asset-detail/components/asset-profile-tab.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Briefcase, Building, ExternalLink, Globe, UserCircle, Users } from 'lucide-react';
import { AssetData } from '../../../types/dashboard';
import { RevenueSegmentationCharts } from './revenue-segmentation-charts';

interface InfoItemProps {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
}
const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
        <div className="text-primary mt-0.5 flex-shrink-0">{icon}</div>
        <div className="min-w-0">
            <p className="text-sm font-semibold text-muted-foreground">{label}</p>
            <p className="font-medium break-words">{value}</p>
        </div>
    </div>
);

const formatLargeNumber = (num: number | string): string => {
    const n = Number(num);
    if (isNaN(n)) return "N/A";
    return n.toLocaleString("es-ES");
};

interface AssetProfileTabProps {
    asset: AssetData;
}

export const AssetProfileTab: React.FC<AssetProfileTabProps> = ({ asset }) => {
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Acerca de {asset.companyName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-base leading-relaxed text-muted-foreground">{asset.description}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                        <InfoItem icon={<Briefcase className="w-5 h-5" />} label="Sector" value={asset.sector || "N/A"} />
                        <InfoItem icon={<Building className="w-5 h-5" />} label="Industria" value={asset.industry || "N/A"} />
                        <InfoItem icon={<UserCircle className="w-5 h-5" />} label="CEO" value={asset.ceo || "N/A"} />
                        <InfoItem
                            icon={<Users className="w-5 h-5" />}
                            label="Empleados"
                            value={typeof asset.employees === 'number' ? formatLargeNumber(asset.employees) : "N/A"}
                        />
                        <InfoItem icon={<Globe className="w-5 h-5" />} label="País" value={asset.country || "N/A"} />
                        <InfoItem
                            icon={<ExternalLink className="w-5 h-5" />}
                            label="Sitio Web"
                            value={
                                asset.website ? (
                                    <a
                                        href={asset.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline truncate block max-w-full"
                                    >
                                        {asset.website.replace(/^https?:\/\//, "")}
                                    </a>
                                ) : (
                                    "N/A"
                                )
                            }
                        />
                    </div>
                </CardContent>
            </Card>
            <RevenueSegmentationCharts asset={asset} />
        </>
    );
};