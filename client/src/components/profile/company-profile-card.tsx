import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { INDUSTRIES, COMPANY_SIZES } from '@/lib/constants';

// These imports aren't needed as our constants are just string arrays
import { Separator } from '@/components/ui/separator';
import { Building, MapPin, Users, Calendar, Briefcase } from 'lucide-react';

interface CompanyProfileCardProps {
  companyData: {
    name: string;
    logo?: string;
    industry?: string;
    location?: string;
    size?: string;
    founded?: string;
    mission?: string;
    description?: string;
    benefits?: string[];
    workArrangements?: string[];
    departments?: string[];
    sliderValues?: Record<string, number>;
  };
  showPreviewHeader?: boolean;
}

export default function CompanyProfileCard({ companyData, showPreviewHeader = false }: CompanyProfileCardProps) {
  const {
    name,
    logo,
    industry,
    location,
    size,
    founded,
    mission,
    description,
    benefits,
    workArrangements,
    departments,
    sliderValues
  } = companyData;

  // Helper to get industry label - since INDUSTRIES is a string array, we can just return the industry code
  const getIndustryLabel = (code: string) => {
    // Check if the industry code is in the INDUSTRIES array
    return INDUSTRIES.includes(code) ? code : code;
  };

  // Helper to get company size label - since COMPANY_SIZES is a string array, we can just return the size code
  const getCompanySizeLabel = (sizeCode: string) => {
    // Check if the size code is in the COMPANY_SIZES array
    return COMPANY_SIZES.includes(sizeCode) ? sizeCode : sizeCode;
  };

  // Format the work arrangements for display
  const formatWorkArrangement = (arrangement: string) => {
    const displayMap: Record<string, string> = {
      'remote': 'Remote',
      'hybrid': 'Hybrid',
      'in-office': 'In-Office',
      'flexible': 'Flexible'
    };
    return displayMap[arrangement] || arrangement;
  };

  return (
    <Card className="w-full shadow-lg border-2 border-border overflow-hidden">
      {showPreviewHeader && (
        <div className="bg-primary text-white text-center py-2 text-sm font-medium">
          Company Profile Preview
        </div>
      )}
      
      <CardHeader className="pb-4 relative">
        <div className="flex items-center gap-4">
          {logo ? (
            <div className="w-16 h-16 rounded-md overflow-hidden border border-border flex-shrink-0">
              <img src={logo} alt={`${name} logo`} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
              <Building size={30} className="text-muted-foreground" />
            </div>
          )}
          
          <div>
            <CardTitle className="text-xl">{name || 'Company Name'}</CardTitle>
            <CardDescription className="mt-1 flex flex-wrap gap-2">
              {industry && (
                <Badge variant="outline" className="bg-muted/50">
                  {getIndustryLabel(industry)}
                </Badge>
              )}
              
              {location && (
                <Badge variant="outline" className="bg-muted/50 flex items-center gap-1">
                  <MapPin size={12} className="mr-1" /> {location}
                </Badge>
              )}
              
              {size && (
                <Badge variant="outline" className="bg-muted/50 flex items-center gap-1">
                  <Users size={12} className="mr-1" /> {getCompanySizeLabel(size)}
                </Badge>
              )}

              {founded && (
                <Badge variant="outline" className="bg-muted/50 flex items-center gap-1">
                  <Calendar size={12} className="mr-1" /> Founded {founded}
                </Badge>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {mission && (
          <div>
            <h4 className="text-sm font-medium mb-1">Mission</h4>
            <p className="text-sm text-muted-foreground">{mission}</p>
          </div>
        )}
        
        {description && (
          <div>
            <h4 className="text-sm font-medium mb-1">About</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
          </div>
        )}

        {workArrangements && workArrangements.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Work Arrangements</h4>
            <div className="flex flex-wrap gap-2">
              {workArrangements.map((arrangement, i) => (
                <Badge key={i} variant="secondary" className="bg-secondary/10">
                  <Briefcase size={12} className="mr-1" />
                  {formatWorkArrangement(arrangement)}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {benefits && benefits.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Benefits</h4>
            <div className="flex flex-wrap gap-2">
              {benefits.slice(0, 5).map((benefit, i) => (
                <Badge key={i} variant="outline" className="bg-accent/10">
                  {benefit}
                </Badge>
              ))}
              {benefits.length > 5 && (
                <Badge variant="outline" className="bg-muted/50">
                  +{benefits.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {departments && departments.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Departments</h4>
            <div className="flex flex-wrap gap-2">
              {departments.slice(0, 5).map((dept, i) => (
                <Badge key={i} variant="outline">
                  {dept}
                </Badge>
              ))}
              {departments.length > 5 && (
                <Badge variant="outline" className="bg-muted/50">
                  +{departments.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {sliderValues && Object.keys(sliderValues).length > 0 && (
          <div>
            <Separator className="my-3" />
            <h4 className="text-sm font-medium mb-2">Company Culture</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(sliderValues).slice(0, 4).map(([key, value], i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">{formatSliderKey(key)}</span>
                    <span className="font-medium">{value}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div 
                      className="bg-primary h-1.5 rounded-full" 
                      style={{ width: `${value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            {Object.keys(sliderValues).length > 4 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                +{Object.keys(sliderValues).length - 4} more culture attributes
              </p>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="bg-muted/30 py-3 flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          This is how your company appears to jobseekers
        </p>
      </CardFooter>
    </Card>
  );
}

// Helper to format slider keys for display
function formatSliderKey(key: string): string {
  // Replace underscores and dashes with spaces
  const spacedKey = key.replace(/[_-]/g, ' ');
  
  // Capitalize first letter of each word
  return spacedKey
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}