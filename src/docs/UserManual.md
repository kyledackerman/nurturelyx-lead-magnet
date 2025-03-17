
# NurturelyX User Manual

## Overview
NurturelyX is a tool for estimating the potential lead generation and revenue impact of implementing visitor identification technology on your website. This manual will guide you through using the tool and understanding the results.

## Getting Started

### Entering Your Website Information
1. Navigate to the NurturelyX Lead Estimation Report tool
2. Enter the following information:
   - **Website Domain**: Your website's domain (e.g., example.com)
   - **Google Analytics Connection**: Connect your Google Analytics account for precise traffic data
   - **Estimated Monthly Paid Visitors**: (If not using Google Analytics) Number of monthly visitors from paid sources
   - **Average Transaction Value**: The average value of a transaction on your website

### Connecting Google Analytics
For the most accurate results, connect your Google Analytics account:
1. Click the "Connect to Google Analytics" button
2. Sign in with your Google account
3. Grant permission to access your analytics data
4. Once connected, we'll automatically fetch both organic and paid traffic metrics

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
If you see error messages related to the Google Analytics API:
1. Check your internet connection
2. Verify that the domain you entered is valid and correctly formatted
3. Try refreshing the page and attempting your calculation again
4. Ensure you've granted the necessary permissions when connecting your Google account
5. If using a self-hosted version, verify the OAuth client ID is correctly configured

### Common Issues

#### "Error fetching data" message
- This typically indicates a temporary API failure or authentication issue
- The tool will automatically use fallback data generation if the API is unavailable
- You can still get useful estimates by entering your traffic data manually

#### Blank or incomplete results
- Ensure you've filled out all fields in the form
- Check for any validation messages indicating errors in your inputs
- Try using a different browser if problems persist

#### Google Analytics connection problems
- Make sure you're logged into the correct Google account
- Verify that you have access to Google Analytics for the domain you're analyzing
- Check that you've granted all requested permissions
- Clear browser cookies and try again if the connection fails

## Methodology

### Visitor Identification
NurturelyX uses proprietary technology to identify up to 20% of anonymous website visitors without requiring opt-in. This is applied to the total of your organic and paid traffic (retrieved from Google Analytics or manually entered).

### Lead-to-Sale Conversion
We calculate potential sales using an industry-standard 1% conversion rate from identified leads to actual sales.

### Revenue Calculation
Revenue impact is calculated by multiplying potential sales by your average transaction value.

## Admin Configuration Options

For administrators or self-hosted instances:

### API Integration
- The application uses the Google Analytics API to retrieve domain traffic data
- Required OAuth client ID: `your-client-id`
- To use a custom client ID, modify the `GOOGLE_ANALYTICS_CLIENT_ID` constant in the apiService.ts file
- The OAuth redirect URI should point to `/auth/callback` on your domain

### Customization Options
- Conversion rates can be adjusted in the `calculateReportMetrics` function
- To change theme colors, update the color variables in the index.css file
- Google Analytics integration can be disabled by setting `enableGoogleAnalytics` to false

## Contact and Support
For additional help or to learn more about implementing NurturelyX on your website, click the "Apply for Beta" button to contact our team.
