
# NurturelyX User Manual

## Overview
NurturelyX is a tool for estimating the potential lead generation and revenue impact of implementing visitor identification technology on your website. This manual will guide you through using the tool and understanding the results.

## Getting Started

### Entering Your Website Information
1. Navigate to the NurturelyX Lead Estimation Report tool
2. Enter the following information:
   - **Website Domain**: Your website's domain (e.g., example.com)
   - **Estimated Monthly Paid Visitors**: Number of monthly visitors from paid sources
   - **Average Transaction Value**: The average value of a transaction on your website
   - **Industry**: Select your business industry from the dropdown menu

### Understanding the Results

#### Top Metrics
- **Missed Leads Per Month**: The number of potential leads you're missing without visitor identification
- **Estimated Lost Sales**: Potential sales lost based on a 1% lead-to-sale conversion rate
- **Lost Revenue Per Month**: The monthly revenue impact of these missed opportunities

#### Domain Performance
The report shows key metrics about your domain:
- **Domain Power**: A score out of 100 indicating your domain's overall strength
- **Backlinks**: The number of external links pointing to your website
- **Organic Traffic**: Estimated monthly organic traffic to your website
- **Organic Keywords**: Number of keywords your site ranks for in search engines

#### Monthly Opportunity Breakdown
A table showing a 6-month breakdown of:
- Visitors (combined organic and paid)
- Potential leads
- Lost sales
- Lost revenue

## Troubleshooting

### API Connection Issues
If you see error messages related to the Google Search Console API:
1. Check your internet connection
2. Verify that the domain you entered is valid and correctly formatted
3. Try refreshing the page and attempting your calculation again
4. If using a self-hosted version, verify the API key is correctly configured

### Common Issues

#### "Error fetching data" message
- This typically indicates a temporary API failure
- The tool will automatically use fallback data generation if the API is unavailable
- You can still get useful estimates, but they won't be based on actual domain data

#### Blank or incomplete results
- Ensure you've filled out all fields in the form
- Check for any validation messages indicating errors in your inputs
- Try using a different browser if problems persist

## Methodology

### Visitor Identification
NurturelyX uses proprietary technology to identify up to 20% of anonymous website visitors without requiring opt-in. This is applied to the total of your organic traffic (retrieved from Google Search Console) plus any paid traffic you enter.

### Lead-to-Sale Conversion
We calculate potential sales using an industry-standard 1% conversion rate from identified leads to actual sales.

### Revenue Calculation
Revenue impact is calculated by multiplying potential sales by your average transaction value.

## Admin Configuration Options

For administrators or self-hosted instances:

### API Integration
- The application uses the Google Search Console API to retrieve domain data
- Default API key: `your-google-api-key`
- To use a custom API key, modify the `GOOGLE_SEARCH_CONSOLE_API_KEY` constant in the apiService.ts file

### Customization Options
- Conversion rates can be adjusted in the `calculateReportMetrics` function
- Industry factors can be modified in the `getIndustryFactor` function
- To change theme colors, update the color variables in the index.css file

## Contact and Support
For additional help or to learn more about implementing NurturelyX on your website, click the "Apply for Beta" button to contact our team.
