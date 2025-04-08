
# NurturelyX User Manual

## Overview
NurturelyX is a tool for estimating the potential lead generation and revenue impact of implementing visitor identification technology on your website. This manual will guide you through using the tool and understanding the results.

## Getting Started

### Entering Your Website Information
1. Navigate to the NurturelyX Lead Estimation Report tool
2. Enter the following information:
   - **Website Domain**: Your website's domain (e.g., example.com)
   - **Average Transaction Value**: The average value of a transaction on your website

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
If you see error messages related to the SpyFu API:
1. Check your internet connection
2. Verify that the domain you entered is valid and correctly formatted
3. Try refreshing the page and attempting your calculation again
4. If problems persist, try entering your traffic data manually

### Proxy Server Configuration
The application uses a secure proxy server hosted on Railway:

- **Default Configuration**: The application uses the Railway-hosted proxy server at `nurture-lead-vision-production.up.railway.app`
- **Administration**: Proxy server configuration is restricted to administrators only

### Common Issues

#### "Error fetching data" message
- This typically indicates a temporary API failure or proxy connection issue
- You can still get useful estimates by entering your traffic data manually

#### Blank or incomplete results
- Ensure you've filled out all fields in the form
- Check for any validation messages indicating errors in your inputs
- Try using a different browser if problems persist

## Methodology

### Visitor Identification
NurturelyX uses proprietary technology to identify up to 20% of anonymous website visitors without requiring opt-in. This is applied to the total of your organic and paid traffic (retrieved from the SpyFu API or manually entered).

### Lead-to-Sale Conversion
We calculate potential sales using an industry-standard 1% conversion rate from identified leads to actual sales.

### Revenue Calculation
Revenue impact is calculated by multiplying potential sales by your average transaction value.

## Admin Configuration Options

For administrators:

### Proxy Server Deployment
- The application uses a proxy server running on Railway at `nurture-lead-vision-production.up.railway.app`
- The proxy server handles API calls to SpyFu and manages API credentials securely
- Required environment variables for the proxy server:
  - `SPYFU_API_USERNAME`: Your SpyFu API username
  - `SPYFU_API_KEY`: Your SpyFu API key
  - `PORT`: The port to run the server on (default: 3001)

### Admin Proxy Configuration
- Administrators can configure the proxy URL by enabling admin mode
- To enable admin mode, set `localStorage.setItem('admin_access', 'true')` in the browser console
- Admin proxy configuration persists in localStorage

## Contact and Support
For additional help or to learn more about implementing NurturelyX on your website, click the "Apply for Beta" button to contact our team.
