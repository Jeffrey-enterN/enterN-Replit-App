import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

// Interface for scraped company data
export interface ScrapedCompanyData {
  about?: string;
  mission?: string;
  vision?: string;
  values?: string | string[];
  culture?: string;
  benefits?: string | string[];
  industryKeywords?: string[];
  locations?: string[];
  jobTypes?: string[];
  success?: boolean;
  error?: string;
}

/**
 * Extracts readable text from HTML, cleaning up whitespace
 */
function extractText(html: string): string {
  // Replace break tags with newlines
  const withLineBreaks = html.replace(/<br\s*\/?>/gi, '\n');
  
  // Create a DOM parser
  const $ = cheerio.load(withLineBreaks);
  
  // Remove script and style tags
  $('script, style').remove();
  
  // Get text content
  let text = $.text();
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ');
  text = text.replace(/\n+/g, '\n');
  text = text.trim();
  
  return text;
}

/**
 * Find the most relevant paragraph about the company
 */
function findAboutSection($: cheerio.CheerioAPI): string {
  // Look for common about us section identifiers
  const selectors = [
    '#about', '.about', '[id*="about"]', '[class*="about"]', 
    'section:contains("About Us")', 'div:contains("About Us")', 
    'section:contains("About Our Company")', 'div:contains("About Our Company")',
    'section:contains("Who We Are")', 'div:contains("Who We Are")',
    '[id*="who-we-are"]', '[class*="who-we-are"]'
  ];
  
  let aboutText = '';
  
  // Try each selector
  for (const selector of selectors) {
    try {
      const element = $(selector);
      if (element.length) {
        // Take only the text from paragraphs in this section
        aboutText = element.find('p').text();
        
        // If no paragraphs, take the whole text
        if (!aboutText) {
          aboutText = element.text();
        }
        
        // Clean up the text
        aboutText = aboutText.replace(/\s+/g, ' ').trim();
        
        // If we have a decent amount of text, return it
        if (aboutText.length > 100) {
          return aboutText;
        }
      }
    } catch (e) {
      // Continue to next selector if one fails
      console.error(`Error with selector ${selector}:`, e);
    }
  }
  
  // If no specific about section found, look for paragraphs that might be about the company
  const paragraphs = $('p');
  const candidateParagraphs: string[] = [];
  
  paragraphs.each((i, el) => {
    const text = $(el).text().trim();
    // Look for paragraphs that might be about the company (at least 100 chars and contains company-related terms)
    if (text.length > 100 && 
        (text.toLowerCase().includes('company') || 
         text.toLowerCase().includes('our mission') || 
         text.toLowerCase().includes('founded') || 
         text.toLowerCase().includes('established'))) {
      candidateParagraphs.push(text);
    }
  });
  
  return candidateParagraphs.length > 0 ? candidateParagraphs[0] : '';
}

/**
 * Find mission, vision, and values sections
 */
function findMissionVisionValues($: cheerio.CheerioAPI): { mission: string, vision: string, values: string | string[] } {
  let mission = '';
  let vision = '';
  let values: string | string[] = '';
  
  // Look for mission statement
  const missionSelectors = [
    '#mission', '.mission', '[id*="mission"]', '[class*="mission"]',
    'section:contains("Our Mission")', 'div:contains("Our Mission")',
    'h1:contains("Mission")', 'h2:contains("Mission")', 'h3:contains("Mission")',
    'p:contains("Our mission is")', 'p:contains("The mission of")'
  ];
  
  for (const selector of missionSelectors) {
    try {
      const element = $(selector);
      if (element.length) {
        // Take paragraph text or the element text
        const text = element.find('p').text() || element.text();
        if (text && text.length > 20) {
          mission = text.replace(/\s+/g, ' ').trim();
          break;
        }
      }
    } catch (e) {
      console.error(`Error with mission selector ${selector}:`, e);
    }
  }
  
  // Look for vision statement
  const visionSelectors = [
    '#vision', '.vision', '[id*="vision"]', '[class*="vision"]',
    'section:contains("Our Vision")', 'div:contains("Our Vision")',
    'h1:contains("Vision")', 'h2:contains("Vision")', 'h3:contains("Vision")',
    'p:contains("Our vision is")', 'p:contains("The vision of")'
  ];
  
  for (const selector of visionSelectors) {
    try {
      const element = $(selector);
      if (element.length) {
        // Take paragraph text or the element text
        const text = element.find('p').text() || element.text();
        if (text && text.length > 20) {
          vision = text.replace(/\s+/g, ' ').trim();
          break;
        }
      }
    } catch (e) {
      console.error(`Error with vision selector ${selector}:`, e);
    }
  }
  
  // Look for values
  const valuesSelectors = [
    '#values', '.values', '[id*="values"]', '[class*="values"]',
    'section:contains("Our Values")', 'div:contains("Our Values")',
    'h1:contains("Values")', 'h2:contains("Values")', 'h3:contains("Values")',
    'ul:contains("Our values")', 'ol:contains("Our values")'
  ];
  
  for (const selector of valuesSelectors) {
    try {
      const element = $(selector);
      if (element.length) {
        // Check if there's a list of values
        const listItems = element.find('li');
        if (listItems.length > 0) {
          const valuesList: string[] = [];
          listItems.each((i, el) => {
            const text = $(el).text().trim();
            if (text) {
              valuesList.push(text);
            }
          });
          if (valuesList.length > 0) {
            values = valuesList;
            break;
          }
        } else {
          // Take paragraph text or the element text
          const text = element.find('p').text() || element.text();
          if (text && text.length > 20) {
            values = text.replace(/\s+/g, ' ').trim();
            break;
          }
        }
      }
    } catch (e) {
      console.error(`Error with values selector ${selector}:`, e);
    }
  }
  
  return { mission, vision, values };
}

/**
 * Find culture information
 */
function findCulture($: cheerio.CheerioAPI): string {
  // Look for culture sections
  const cultureSelectors = [
    '#culture', '.culture', '[id*="culture"]', '[class*="culture"]',
    'section:contains("Our Culture")', 'div:contains("Our Culture")',
    'h1:contains("Culture")', 'h2:contains("Culture")', 'h3:contains("Culture")',
    'section:contains("Work Culture")', 'div:contains("Work Culture")',
    'section:contains("Company Culture")', 'div:contains("Company Culture")'
  ];
  
  for (const selector of cultureSelectors) {
    try {
      const element = $(selector);
      if (element.length) {
        // Take paragraph text or the element text
        const text = element.find('p').text() || element.text();
        if (text && text.length > 50) {
          return text.replace(/\s+/g, ' ').trim();
        }
      }
    } catch (e) {
      console.error(`Error with culture selector ${selector}:`, e);
    }
  }
  
  return '';
}

/**
 * Find benefits information
 */
function findBenefits($: cheerio.CheerioAPI): string | string[] {
  // Look for benefits sections
  const benefitsSelectors = [
    '#benefits', '.benefits', '[id*="benefits"]', '[class*="benefits"]',
    'section:contains("Benefits")', 'div:contains("Benefits")',
    'h1:contains("Benefits")', 'h2:contains("Benefits")', 'h3:contains("Benefits")',
    'section:contains("Perks")', 'div:contains("Perks")',
    'h1:contains("Perks")', 'h2:contains("Perks")', 'h3:contains("Perks")'
  ];
  
  for (const selector of benefitsSelectors) {
    try {
      const element = $(selector);
      if (element.length) {
        // Check if there's a list of benefits
        const listItems = element.find('li');
        if (listItems.length > 0) {
          const benefitsList: string[] = [];
          listItems.each((i, el) => {
            const text = $(el).text().trim();
            if (text) {
              benefitsList.push(text);
            }
          });
          if (benefitsList.length > 0) {
            return benefitsList;
          }
        } else {
          // Take paragraph text or the element text
          const text = element.find('p').text() || element.text();
          if (text && text.length > 20) {
            return text.replace(/\s+/g, ' ').trim();
          }
        }
      }
    } catch (e) {
      console.error(`Error with benefits selector ${selector}:`, e);
    }
  }
  
  return '';
}

/**
 * Find industry keywords in the page content
 */
function findIndustryKeywords($: cheerio.CheerioAPI): string[] {
  const pageText = $('body').text().toLowerCase();
  
  // Common industry keywords to look for
  const industries = [
    'technology', 'healthcare', 'finance', 'banking', 'insurance', 
    'retail', 'manufacturing', 'education', 'government', 'non-profit',
    'logistics', 'transportation', 'food', 'agriculture', 'energy',
    'pharmaceutical', 'biotechnology', 'telecommunications', 'media',
    'entertainment', 'hospitality', 'construction', 'real estate',
    'consulting', 'legal', 'automotive', 'aerospace', 'defense',
    'consumer goods', 'e-commerce', 'software', 'hardware', 'artificial intelligence',
    'machine learning', 'data science', 'cloud computing', 'cybersecurity',
    'fintech', 'edtech', 'healthtech', 'biotech', 'proptech', 'insurtech'
  ];
  
  const foundIndustries = industries.filter(industry => 
    pageText.includes(industry)
  );
  
  return foundIndustries;
}

/**
 * Find locations mentioned on the career page
 */
function findLocations($: cheerio.CheerioAPI): string[] {
  // This is simplified - a more robust implementation would use 
  // NLP to identify locations or a location database
  const pageText = $('body').text();
  
  // Common location patterns
  const locationRegexes = [
    /(?:headquartered|based) in ([A-Za-z ]+(?:,|\.| [A-Z]{2})?)/g,
    /(?:offices|locations) in ([A-Za-z, ]+)/g,
    /(?:remote|hybrid|onsite) (?:in|from) ([A-Za-z, ]+)/g
  ];
  
  const locations = new Set<string>();
  
  locationRegexes.forEach(regex => {
    let match;
    while ((match = regex.exec(pageText)) !== null) {
      if (match[1]) {
        locations.add(match[1].trim());
      }
    }
  });
  
  return Array.from(locations);
}

/**
 * Find job types mentioned on the career page
 */
function findJobTypes($: cheerio.CheerioAPI): string[] {
  const pageText = $('body').text().toLowerCase();
  
  // Common work arrangements to look for
  const arrangements = [
    'remote', 'hybrid', 'onsite', 'in-office', 'flexible', 
    'work from home', 'telework', 'distributed'
  ];
  
  const foundArrangements = arrangements.filter(arrangement => 
    pageText.includes(arrangement)
  );
  
  return foundArrangements;
}

/**
 * Scrape company information from a career website
 */
export async function scrapeCompanyWebsite(url: string): Promise<ScrapedCompanyData> {
  try {
    // If URL doesn't have a protocol, add one
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    
    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch the website: ${response.status} ${response.statusText}`
      };
    }
    
    // Get HTML content
    const html = await response.text();
    
    // Load HTML into cheerio
    const $ = cheerio.load(html);
    
    // Extract information
    const about = findAboutSection($);
    const { mission, vision, values } = findMissionVisionValues($);
    const culture = findCulture($);
    const benefits = findBenefits($);
    const industryKeywords = findIndustryKeywords($);
    const locations = findLocations($);
    const jobTypes = findJobTypes($);
    
    return {
      about,
      mission,
      vision,
      values,
      culture,
      benefits,
      industryKeywords,
      locations,
      jobTypes,
      success: true
    };
  } catch (error) {
    console.error('Error scraping website:', error);
    return {
      success: false,
      error: `Error scraping website: ${(error as Error).message}`
    };
  }
}