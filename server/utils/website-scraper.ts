import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { CULTURE_KEYWORDS } from '../../client/src/lib/constants';

interface ScrapedCompanyData {
  about?: string;
  mission?: string;
  vision?: string;
  values?: string[];
  culture?: string;
  benefits?: string[];
  industryKeywords?: string[];
  locations?: string[];
  jobTypes?: string[];
  success: boolean;
  error?: string;
}

/**
 * Scrapes a company website to extract relevant information
 * @param url The URL to scrape
 * @returns Parsed company data
 */
export async function scrapeCompanyWebsite(url: string): Promise<ScrapedCompanyData> {
  try {
    // Normalize the URL
    const normalizedUrl = normalizeUrl(url);
    
    // Fetch the website content
    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch the website: ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Initialize result object
    const result: ScrapedCompanyData = { success: true };
    
    // Extract company information
    result.about = extractAboutUs($);
    result.mission = extractMission($);
    result.vision = extractVision($);
    result.values = extractValues($);
    result.culture = extractCulture($);
    result.benefits = extractBenefits($);
    result.industryKeywords = extractIndustryKeywords($);
    result.locations = extractLocations($);
    result.jobTypes = extractJobTypes($);
    
    return result;
  } catch (error) {
    console.error('Error scraping website:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred while scraping the website',
    };
  }
}

/**
 * Ensures URL has proper protocol and is well-formed
 */
function normalizeUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

/**
 * Extracts "About Us" content from the webpage
 */
function extractAboutUs($: cheerio.CheerioAPI): string | undefined {
  // Look for about us sections
  const aboutSelectors = [
    'section:contains("About Us")',
    'div:contains("About Us")',
    'section:contains("About")', 
    'div:contains("About")',
    'section:contains("Who We Are")',
    'div:contains("Who We Are")',
    '#about',
    '.about',
    '[data-section="about"]',
    '[data-testid="about-section"]',
  ];
  
  let aboutContent = '';
  
  for (const selector of aboutSelectors) {
    const element = $(selector);
    if (element.length) {
      // Extract paragraphs inside the section
      const paragraphs = element.find('p');
      if (paragraphs.length) {
        paragraphs.each((i, p) => {
          const text = $(p).text().trim();
          if (text.length > 30) { // Only take meaningful paragraphs
            aboutContent += text + ' ';
          }
        });
      } else {
        // If no paragraphs, take the text from the section itself
        const text = element.text().trim();
        if (text.length > 100) { // Only take meaningful content
          aboutContent = text;
        }
      }
      
      if (aboutContent) break;
    }
  }
  
  // If we still don't have about content, try meta descriptions
  if (!aboutContent) {
    const metaDescription = $('meta[name="description"]').attr('content');
    if (metaDescription && metaDescription.length > 50) {
      aboutContent = metaDescription;
    }
  }
  
  return aboutContent ? cleanText(aboutContent) : undefined;
}

/**
 * Extracts mission statement from the webpage
 */
function extractMission($: cheerio.CheerioAPI): string | undefined {
  const missionSelectors = [
    'section:contains("Mission")',
    'div:contains("Mission")',
    'section:contains("Our Mission")',
    'div:contains("Our Mission")',
    'h2:contains("Mission") + p',
    'h3:contains("Mission") + p',
    '#mission',
    '.mission',
    '[data-section="mission"]',
  ];
  
  let missionContent = '';
  
  for (const selector of missionSelectors) {
    const element = $(selector);
    if (element.length) {
      const paragraphs = element.find('p');
      if (paragraphs.length) {
        paragraphs.each((i, p) => {
          const text = $(p).text().trim();
          if (text.length > 20) {
            missionContent += text + ' ';
          }
        });
      } else {
        const text = element.text().trim();
        if (text.length > 20) {
          missionContent = text;
        }
      }
      
      if (missionContent) break;
    }
  }
  
  return missionContent ? cleanText(missionContent) : undefined;
}

/**
 * Extracts vision statement from the webpage
 */
function extractVision($: cheerio.CheerioAPI): string | undefined {
  const visionSelectors = [
    'section:contains("Vision")',
    'div:contains("Vision")',
    'section:contains("Our Vision")',
    'div:contains("Our Vision")',
    'h2:contains("Vision") + p',
    'h3:contains("Vision") + p',
    '#vision',
    '.vision',
    '[data-section="vision"]',
  ];
  
  let visionContent = '';
  
  for (const selector of visionSelectors) {
    const element = $(selector);
    if (element.length) {
      const paragraphs = element.find('p');
      if (paragraphs.length) {
        paragraphs.each((i, p) => {
          const text = $(p).text().trim();
          if (text.length > 20) {
            visionContent += text + ' ';
          }
        });
      } else {
        const text = element.text().trim();
        if (text.length > 20) {
          visionContent = text;
        }
      }
      
      if (visionContent) break;
    }
  }
  
  return visionContent ? cleanText(visionContent) : undefined;
}

/**
 * Extracts company values from the webpage
 */
function extractValues($: cheerio.CheerioAPI): string[] | undefined {
  const valuesSelectors = [
    'section:contains("Values")',
    'div:contains("Values")',
    'section:contains("Our Values")',
    'div:contains("Our Values")',
    'h2:contains("Values") + ul',
    'h3:contains("Values") + ul',
    '#values',
    '.values',
    '[data-section="values"]',
  ];
  
  let valuesList: string[] = [];
  
  // Try to find a clear list of values
  for (const selector of valuesSelectors) {
    const element = $(selector);
    if (element.length) {
      // Look for list items
      const listItems = element.find('li');
      if (listItems.length) {
        listItems.each((i, li) => {
          const text = $(li).text().trim();
          if (text.length > 3 && text.length < 100) {
            valuesList.push(cleanText(text));
          }
        });
      }
      
      // Also look for bolded or emphasized values
      const emphasisElements = element.find('strong, b, em, i, h3, h4, h5, h6');
      if (emphasisElements.length) {
        emphasisElements.each((i, el) => {
          const text = $(el).text().trim();
          if (text.length > 3 && text.length < 50 && !valuesList.includes(text)) {
            valuesList.push(cleanText(text));
          }
        });
      }
      
      if (valuesList.length) break;
    }
  }
  
  return valuesList.length ? valuesList : undefined;
}

/**
 * Extracts culture information from the webpage
 */
function extractCulture($: cheerio.CheerioAPI): string | undefined {
  const cultureSelectors = [
    'section:contains("Culture")',
    'div:contains("Culture")',
    'section:contains("Our Culture")',
    'div:contains("Our Culture")',
    'section:contains("Work Culture")',
    'div:contains("Work Culture")',
    'h2:contains("Culture") + p',
    'h3:contains("Culture") + p',
    '#culture',
    '.culture',
    '[data-section="culture"]',
  ];
  
  let cultureContent = '';
  
  for (const selector of cultureSelectors) {
    const element = $(selector);
    if (element.length) {
      const paragraphs = element.find('p');
      if (paragraphs.length) {
        paragraphs.each((i, p) => {
          const text = $(p).text().trim();
          if (text.length > 30) {
            cultureContent += text + ' ';
          }
        });
      } else {
        const text = element.text().trim();
        if (text.length > 50) {
          cultureContent = text;
        }
      }
      
      if (cultureContent) break;
    }
  }
  
  // If we don't find explicit culture sections, look for paragraphs containing culture keywords
  if (!cultureContent) {
    $('p').each((i, p) => {
      if (cultureContent) return; // Already found content
      
      const text = $(p).text().trim();
      if (text.length > 100) {
        // Check if paragraph contains culture keywords
        const containsKeywords = CULTURE_KEYWORDS.some(keyword => 
          text.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (containsKeywords) {
          cultureContent = text;
        }
      }
    });
  }
  
  return cultureContent ? cleanText(cultureContent) : undefined;
}

/**
 * Extracts benefits information from the webpage
 */
function extractBenefits($: cheerio.CheerioAPI): string[] | undefined {
  const benefitSelectors = [
    'section:contains("Benefits")',
    'div:contains("Benefits")',
    'section:contains("Our Benefits")',
    'div:contains("Our Benefits")',
    'section:contains("Perks")',
    'div:contains("Perks")',
    'h2:contains("Benefits") + ul',
    'h3:contains("Benefits") + ul',
    '#benefits',
    '.benefits',
    '[data-section="benefits"]',
  ];
  
  let benefitsList: string[] = [];
  
  for (const selector of benefitSelectors) {
    const element = $(selector);
    if (element.length) {
      // Look for list items
      const listItems = element.find('li');
      if (listItems.length) {
        listItems.each((i, li) => {
          const text = $(li).text().trim();
          if (text.length > 3 && text.length < 100) {
            benefitsList.push(cleanText(text));
          }
        });
      }
      
      if (benefitsList.length) break;
    }
  }
  
  return benefitsList.length ? benefitsList : undefined;
}

/**
 * Extracts industry keywords from the webpage
 */
function extractIndustryKeywords($: cheerio.CheerioAPI): string[] | undefined {
  // Extract meta keywords
  const metaKeywords = $('meta[name="keywords"]').attr('content');
  let keywords: string[] = [];
  
  if (metaKeywords) {
    keywords = metaKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
  }
  
  // Extract from content
  const fullText = $('body').text();
  
  // Common industry terms to look for
  const industryTerms = [
    'technology', 'tech', 'software', 'hardware', 'IT', 'information technology',
    'healthcare', 'health', 'medical', 'medicine', 'hospital',
    'finance', 'financial', 'banking', 'investment', 'insurance',
    'retail', 'e-commerce', 'sales',
    'manufacturing', 'production', 'factory',
    'education', 'school', 'university', 'teaching', 'learning',
    'government', 'public sector',
    'non-profit', 'charity', 'NGO',
    'media', 'advertising', 'marketing',
    'entertainment', 'film', 'music', 'art',
    'legal', 'law',
    'consulting',
    'transportation', 'logistics', 'shipping',
    'energy', 'oil', 'gas', 'renewable', 'sustainability',
    'construction', 'architecture', 'engineering',
    'hospitality', 'hotel', 'restaurant', 'tourism',
    'telecommunications',
    'automotive',
    'aerospace',
    'biotechnology', 'biotech',
    'pharmaceutical', 'pharma',
    'agriculture', 'farming', 'food'
  ];
  
  for (const term of industryTerms) {
    if (fullText.toLowerCase().includes(term.toLowerCase())) {
      if (!keywords.includes(term)) {
        keywords.push(term);
      }
    }
  }
  
  return keywords.length ? keywords : undefined;
}

/**
 * Extracts location information from the webpage
 */
function extractLocations($: cheerio.CheerioAPI): string[] | undefined {
  let locations: string[] = [];
  
  // Look for address information
  const addressSelectors = [
    'address',
    '.address',
    '.location',
    'footer address',
    'footer .address',
    'div:contains("Address")',
    'div:contains("Location")',
    'div:contains("Headquarters")',
    '[itemprop="address"]',
  ];
  
  for (const selector of addressSelectors) {
    const elements = $(selector);
    if (elements.length) {
      elements.each((i, el) => {
        const text = $(el).text().trim();
        if (text.length > 5 && text.length < 200) {
          locations.push(cleanText(text));
        }
      });
    }
  }
  
  return locations.length ? locations : undefined;
}

/**
 * Extracts job types information from the webpage
 */
function extractJobTypes($: cheerio.CheerioAPI): string[] | undefined {
  let jobTypes: string[] = [];
  
  // Common job type indicators to search for in the page
  const jobTypeIndicators = [
    'remote', 'remote work', 'work from home', 'wfh',
    'hybrid', 'hybrid work', 'flexible',
    'in-office', 'on-site', 'onsite', 'in office',
    'full-time', 'fulltime', 'full time',
    'part-time', 'part time',
    'contract', 'contractor',
    'temporary', 'temp',
    'internship', 'intern',
    'apprenticeship', 'apprentice'
  ];
  
  const jobTypeSelectors = [
    'section:contains("Careers")',
    'div:contains("Careers")',
    'section:contains("Jobs")',
    'div:contains("Jobs")',
    'section:contains("Positions")',
    'div:contains("Positions")',
    'section:contains("Work With Us")',
    'div:contains("Work With Us")',
  ];
  
  // First try in specific job-related sections
  for (const selector of jobTypeSelectors) {
    const element = $(selector);
    if (element.length) {
      const text = element.text().toLowerCase();
      
      for (const indicator of jobTypeIndicators) {
        if (text.includes(indicator.toLowerCase()) && !jobTypes.includes(indicator)) {
          jobTypes.push(indicator);
        }
      }
    }
  }
  
  // If we didn't find anything, look more broadly
  if (!jobTypes.length) {
    const bodyText = $('body').text().toLowerCase();
    
    for (const indicator of jobTypeIndicators) {
      if (bodyText.includes(indicator.toLowerCase()) && !jobTypes.includes(indicator)) {
        jobTypes.push(indicator);
      }
    }
  }
  
  return jobTypes.length ? jobTypes : undefined;
}

/**
 * Cleans and normalizes text
 */
function cleanText(text: string): string {
  return text
    .replace(/\\s+/g, ' ')             // Normalize whitespace
    .replace(/[\\t\\n\\r]/g, ' ')      // Remove tabs and newlines
    .replace(/\s{2,}/g, ' ')           // Remove multiple spaces
    .replace(/[^\x20-\x7E]/g, '')      // Remove non-printable characters
    .trim();
}