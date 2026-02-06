# N8n Workflow Templates

This document contains ready-to-use n8n workflow templates for integrating with your Property Hub backend.

---

## Workflow 1: Google Ads Lead → Backend

### Overview
Captures leads from Google Ads Lead Form Extensions and creates them in your backend.

### Workflow Nodes

```json
{
  "name": "Google Ads Lead to Backend",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "google-ads-lead",
        "responseMode": "responseNode",
        "options": {}
      },
      "name": "Webhook - Google Ads",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300],
      "webhookId": "google-ads-lead-webhook"
    },
    {
      "parameters": {
        "functionCode": "// Transform Google Ads payload to backend format\nconst googleAdsData = $input.item.json;\n\n// Extract lead data from Google Ads webhook\nconst leadData = {\n  name: `${googleAdsData.first_name || ''} ${googleAdsData.last_name || ''}`.trim(),\n  email: googleAdsData.email,\n  phone: googleAdsData.phone_number,\n  regionId: $env.DEFAULT_REGION_ID, // Set this in n8n environment\n  source: 'google_ads',\n  campaignId: $env.GOOGLE_ADS_CAMPAIGN_ID, // Map to your campaign\n  notes: `Google Ads Lead - Campaign: ${googleAdsData.campaign_name || 'Unknown'}`,\n  metadata: {\n    adId: googleAdsData.ad_id,\n    formId: googleAdsData.form_id,\n    gclid: googleAdsData.gclid,\n    campaignName: googleAdsData.campaign_name,\n    adGroupName: googleAdsData.ad_group_name\n  }\n};\n\n// Generate idempotency key from Google Ads lead ID\nconst idempotencyKey = `google-ads-${googleAdsData.lead_id || Date.now()}`;\n\nreturn {\n  json: {\n    leadData,\n    idempotencyKey\n  }\n};"
      },
      "name": "Transform Payload",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "url": "={{$env.BACKEND_URL}}/webhooks/leads",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "X-API-Key",
              "value": "={{$env.N8N_WEBHOOK_API_KEY}}"
            },
            {
              "name": "X-Idempotency-Key",
              "value": "={{$json.idempotencyKey}}"
            }
          ]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": []
        },
        "options": {
          "timeout": 10000,
          "retry": {
            "enabled": true,
            "maxRetries": 3,
            "retryInterval": 1000
          }
        },
        "method": "POST",
        "body": "={{JSON.stringify($json.leadData)}}"
      },
      "name": "Create Lead in Backend",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [650, 300]
    },
    {
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{$json.statusCode}}",
              "operation": "equal",
              "value2": 201
            }
          ]
        }
      },
      "name": "Check Response",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [850, 300]
    },
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "status",
              "value": "success"
            },
            {
              "name": "leadId",
              "value": "={{$json.data.id}}"
            },
            {
              "name": "message",
              "value": "Lead created successfully"
            }
          ]
        },
        "options": {}
      },
      "name": "Success Response",
      "type": "n8n-nodes-base.set",
      "typeVersion": 1,
      "position": [1050, 200]
    },
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "status",
              "value": "error"
            },
            {
              "name": "error",
              "value": "={{$json.error}}"
            }
          ]
        },
        "options": {}
      },
      "name": "Error Response",
      "type": "n8n-nodes-base.set",
      "typeVersion": 1,
      "position": [1050, 400]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{$json}}"
      },
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [1250, 300]
    }
  ],
  "connections": {
    "Webhook - Google Ads": {
      "main": [[{ "node": "Transform Payload", "type": "main", "index": 0 }]]
    },
    "Transform Payload": {
      "main": [[{ "node": "Create Lead in Backend", "type": "main", "index": 0 }]]
    },
    "Create Lead in Backend": {
      "main": [[{ "node": "Check Response", "type": "main", "index": 0 }]]
    },
    "Check Response": {
      "main": [
        [{ "node": "Success Response", "type": "main", "index": 0 }],
        [{ "node": "Error Response", "type": "main", "index": 0 }]
      ]
    },
    "Success Response": {
      "main": [[{ "node": "Respond to Webhook", "type": "main", "index": 0 }]]
    },
    "Error Response": {
      "main": [[{ "node": "Respond to Webhook", "type": "main", "index": 0 }]]
    }
  }
}
```

### Environment Variables (Set in n8n)

```
BACKEND_URL=http://your-backend:3001
N8N_WEBHOOK_API_KEY=your-super-secure-api-key
DEFAULT_REGION_ID=your-default-region-uuid
GOOGLE_ADS_CAMPAIGN_ID=your-campaign-uuid
```

---

## Workflow 2: Meta (Facebook) Ads Lead → Backend

### Overview
Captures leads from Meta Lead Ads and creates them in your backend.

### Workflow Nodes

```json
{
  "name": "Meta Ads Lead to Backend",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "meta-ads-lead",
        "responseMode": "responseNode",
        "options": {}
      },
      "name": "Webhook - Meta Ads",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300],
      "webhookId": "meta-ads-lead-webhook"
    },
    {
      "parameters": {
        "functionCode": "// Transform Meta Ads payload to backend format\nconst metaData = $input.item.json;\n\n// Meta sends data in entry array\nconst entry = metaData.entry?.[0];\nconst changes = entry?.changes?.[0];\nconst leadData = changes?.value;\n\nif (!leadData) {\n  throw new Error('Invalid Meta Ads webhook payload');\n}\n\n// Extract field data\nconst fieldData = {};\nleadData.field_data?.forEach(field => {\n  fieldData[field.name] = field.values?.[0];\n});\n\n// Map to backend format\nconst backendLead = {\n  name: `${fieldData.first_name || ''} ${fieldData.last_name || ''}`.trim() || fieldData.full_name,\n  email: fieldData.email,\n  phone: fieldData.phone_number,\n  regionId: $env.DEFAULT_REGION_ID,\n  source: 'meta_ads',\n  campaignId: $env.META_ADS_CAMPAIGN_ID,\n  notes: `Meta Lead Ads - Form: ${leadData.form_id}`,\n  metadata: {\n    leadId: leadData.leadgen_id,\n    formId: leadData.form_id,\n    adId: leadData.ad_id,\n    createdTime: leadData.created_time\n  }\n};\n\n// Generate idempotency key\nconst idempotencyKey = `meta-ads-${leadData.leadgen_id || Date.now()}`;\n\nreturn {\n  json: {\n    leadData: backendLead,\n    idempotencyKey\n  }\n};"
      },
      "name": "Transform Meta Payload",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "url": "={{$env.BACKEND_URL}}/webhooks/leads",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "X-API-Key",
              "value": "={{$env.N8N_WEBHOOK_API_KEY}}"
            },
            {
              "name": "X-Idempotency-Key",
              "value": "={{$json.idempotencyKey}}"
            }
          ]
        },
        "method": "POST",
        "body": "={{JSON.stringify($json.leadData)}}",
        "options": {
          "timeout": 10000,
          "retry": {
            "enabled": true,
            "maxRetries": 3,
            "retryInterval": 1000
          }
        }
      },
      "name": "Create Lead in Backend",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [650, 300]
    },
    {
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{$json.statusCode}}",
              "operation": "equal",
              "value2": 201
            }
          ]
        }
      },
      "name": "Check Response",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [850, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { success: true, leadId: $json.data?.id } }}"
      },
      "name": "Success Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [1050, 200]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { success: false, error: $json.error } }}",
        "responseCode": 400
      },
      "name": "Error Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [1050, 400]
    }
  ],
  "connections": {
    "Webhook - Meta Ads": {
      "main": [[{ "node": "Transform Meta Payload", "type": "main", "index": 0 }]]
    },
    "Transform Meta Payload": {
      "main": [[{ "node": "Create Lead in Backend", "type": "main", "index": 0 }]]
    },
    "Create Lead in Backend": {
      "main": [[{ "node": "Check Response", "type": "main", "index": 0 }]]
    },
    "Check Response": {
      "main": [
        [{ "node": "Success Response", "type": "main", "index": 0 }],
        [{ "node": "Error Response", "type": "main", "index": 0 }]
      ]
    }
  }
}
```

---

## Workflow 3: Campaign Metrics Sync

### Overview
Scheduled workflow that syncs campaign metrics from Google Ads and Meta Ads to your backend.

### Workflow Nodes

```json
{
  "name": "Campaign Metrics Sync",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "0 2 * * *"
            }
          ]
        }
      },
      "name": "Schedule - Daily 2 AM",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "url": "={{$env.BACKEND_URL}}/api/marketing-campaigns?status=ACTIVE",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "Bearer {{$env.BACKEND_JWT_TOKEN}}"
            }
          ]
        },
        "options": {}
      },
      "name": "Get Active Campaigns",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [450, 300]
    },
    {
      "parameters": {
        "batchSize": 1,
        "options": {}
      },
      "name": "Loop Campaigns",
      "type": "n8n-nodes-base.splitInBatches",
      "typeVersion": 1,
      "position": [650, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.platform}}",
              "operation": "equal",
              "value2": "google_ads"
            }
          ]
        }
      },
      "name": "Check Platform",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [850, 300]
    },
    {
      "parameters": {
        "functionCode": "// Fetch Google Ads metrics\n// This is a simplified example - use Google Ads API node in production\nconst campaign = $input.item.json;\n\n// Mock metrics - replace with actual Google Ads API call\nconst metrics = {\n  campaignId: campaign.id,\n  impressions: Math.floor(Math.random() * 10000) + 5000,\n  clicks: Math.floor(Math.random() * 500) + 100,\n  leadsCount: Math.floor(Math.random() * 50) + 10,\n  conversions: Math.floor(Math.random() * 10) + 2,\n  spent: (Math.random() * 1000 + 500).toFixed(2),\n  date: new Date().toISOString().split('T')[0]\n};\n\nreturn { json: metrics };"
      },
      "name": "Fetch Google Ads Metrics",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [1050, 200]
    },
    {
      "parameters": {
        "functionCode": "// Fetch Meta Ads metrics\n// This is a simplified example - use Meta Graph API in production\nconst campaign = $input.item.json;\n\n// Mock metrics - replace with actual Meta API call\nconst metrics = {\n  campaignId: campaign.id,\n  impressions: Math.floor(Math.random() * 8000) + 3000,\n  clicks: Math.floor(Math.random() * 400) + 80,\n  leadsCount: Math.floor(Math.random() * 40) + 8,\n  conversions: Math.floor(Math.random() * 8) + 1,\n  spent: (Math.random() * 800 + 400).toFixed(2),\n  date: new Date().toISOString().split('T')[0]\n};\n\nreturn { json: metrics };"
      },
      "name": "Fetch Meta Ads Metrics",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [1050, 400]
    },
    {
      "parameters": {
        "url": "={{$env.BACKEND_URL}}/webhooks/campaign-metrics",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "X-API-Key",
              "value": "={{$env.N8N_WEBHOOK_API_KEY}}"
            }
          ]
        },
        "method": "POST",
        "body": "={{JSON.stringify($json)}}",
        "options": {
          "retry": {
            "enabled": true,
            "maxRetries": 3
          }
        }
      },
      "name": "Update Backend Metrics",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [1250, 300]
    },
    {
      "parameters": {
        "mode": "passThrough"
      },
      "name": "Merge",
      "type": "n8n-nodes-base.merge",
      "typeVersion": 2,
      "position": [1450, 300]
    }
  ],
  "connections": {
    "Schedule - Daily 2 AM": {
      "main": [[{ "node": "Get Active Campaigns", "type": "main", "index": 0 }]]
    },
    "Get Active Campaigns": {
      "main": [[{ "node": "Loop Campaigns", "type": "main", "index": 0 }]]
    },
    "Loop Campaigns": {
      "main": [[{ "node": "Check Platform", "type": "main", "index": 0 }]]
    },
    "Check Platform": {
      "main": [
        [{ "node": "Fetch Google Ads Metrics", "type": "main", "index": 0 }],
        [{ "node": "Fetch Meta Ads Metrics", "type": "main", "index": 0 }]
      ]
    },
    "Fetch Google Ads Metrics": {
      "main": [[{ "node": "Update Backend Metrics", "type": "main", "index": 0 }]]
    },
    "Fetch Meta Ads Metrics": {
      "main": [[{ "node": "Update Backend Metrics", "type": "main", "index": 0 }]]
    },
    "Update Backend Metrics": {
      "main": [[{ "node": "Merge", "type": "main", "index": 0 }]]
    }
  }
}
```

---

## Workflow 4: Monitor & Notify on New Ads Requests

### Overview
Monitors for new ads requests created by property-partners and regional managers in your backend, then notifies marketing managers via email/Slack.

**Note**: This workflow does NOT create ads requests - it monitors requests created through your application by users and sends notifications.

### Workflow Nodes

```json
{
  "name": "Ads Request Notification",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "minutes",
              "minutesInterval": 5
            }
          ]
        }
      },
      "name": "Schedule - Every 5 Minutes",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "url": "={{$env.BACKEND_URL}}/api/ads-requests?status=PENDING",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "Bearer {{$env.BACKEND_JWT_TOKEN}}"
            }
          ]
        }
      },
      "name": "Get Pending Ads Requests",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [450, 300]
    },
    {
      "parameters": {
        "functionCode": "// Filter requests created in last 5 minutes\nconst requests = $input.all();\nconst fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);\n\nconst newRequests = requests.filter(item => {\n  const createdAt = new Date(item.json.createdAt);\n  return createdAt > fiveMinutesAgo;\n});\n\nreturn newRequests;"
      },
      "name": "Filter New Requests",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [650, 300]
    },
    {
      "parameters": {
        "batchSize": 1,
        "options": {}
      },
      "name": "Loop Requests",
      "type": "n8n-nodes-base.splitInBatches",
      "typeVersion": 1,
      "position": [850, 300]
    },
    {
      "parameters": {
        "url": "={{$env.BACKEND_URL}}/api/regions/{{$json.regionId}}",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "Bearer {{$env.BACKEND_JWT_TOKEN}}"
            }
          ]
        }
      },
      "name": "Get Region Managers",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [1050, 300]
    },
    {
      "parameters": {
        "fromEmail": "notifications@propertyhub.com",
        "toEmail": "={{$json.managers[0].email}}",
        "subject": "New Ads Request: {{$json.title}}",
        "emailType": "html",
        "message": "<h2>New Ads Request</h2><p><strong>Title:</strong> {{$json.title}}</p><p><strong>Priority:</strong> {{$json.priority}}</p><p><strong>Description:</strong> {{$json.description}}</p><p><strong>Region:</strong> {{$json.region.name}}</p><p><a href=\"{{$env.FRONTEND_URL}}/marketing-manager/ads-requests/{{$json.id}}\">View Request</a></p>"
      },
      "name": "Send Email Notification",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 2,
      "position": [1250, 300]
    }
  ],
  "connections": {
    "Schedule - Every 5 Minutes": {
      "main": [[{ "node": "Get Pending Ads Requests", "type": "main", "index": 0 }]]
    },
    "Get Pending Ads Requests": {
      "main": [[{ "node": "Filter New Requests", "type": "main", "index": 0 }]]
    },
    "Filter New Requests": {
      "main": [[{ "node": "Loop Requests", "type": "main", "index": 0 }]]
    },
    "Loop Requests": {
      "main": [[{ "node": "Get Region Managers", "type": "main", "index": 0 }]]
    },
    "Get Region Managers": {
      "main": [[{ "node": "Send Email Notification", "type": "main", "index": 0 }]]
    }
  }
}
```

---

## Setup Instructions

### 1. Import Workflows to n8n

1. Open n8n dashboard
2. Click "Add Workflow"
3. Click the three dots menu → "Import from File"
4. Paste the JSON workflow definition
5. Save the workflow

### 2. Configure Environment Variables

In n8n Settings → Variables, add:

```
BACKEND_URL=http://your-backend-host:3001
N8N_WEBHOOK_API_KEY=your-super-secure-api-key
DEFAULT_REGION_ID=your-default-region-uuid
GOOGLE_ADS_CAMPAIGN_ID=your-google-campaign-uuid
META_ADS_CAMPAIGN_ID=your-meta-campaign-uuid
BACKEND_JWT_TOKEN=your-backend-jwt-token (for authenticated endpoints)
FRONTEND_URL=https://your-frontend-url.com
```

### 3. Activate Workflows

1. Open each workflow
2. Click "Active" toggle in top right
3. Test with sample data

### 4. Configure Webhook URLs

For Google Ads and Meta Ads:

1. Get webhook URL from n8n (click "Webhook" node)
2. Add webhook URL to Google Ads / Meta Ads platform
3. Test webhook delivery

---

## Testing Workflows

### Test Google Ads Workflow

```bash
curl -X POST https://your-n8n-instance.com/webhook/google-ads-lead \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "test-123",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone_number": "+1234567890",
    "campaign_name": "Test Campaign",
    "ad_id": "ad-123",
    "form_id": "form-456",
    "gclid": "gclid-789"
  }'
```

### Test Meta Ads Workflow

```bash
curl -X POST https://your-n8n-instance.com/webhook/meta-ads-lead \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "changes": [{
        "value": {
          "leadgen_id": "test-meta-123",
          "form_id": "form-789",
          "ad_id": "ad-456",
          "created_time": "2026-02-06T10:00:00Z",
          "field_data": [
            { "name": "first_name", "values": ["Jane"] },
            { "name": "last_name", "values": ["Smith"] },
            { "name": "email", "values": ["jane@example.com"] },
            { "name": "phone_number", "values": ["+9876543210"] }
          ]
        }
      }]
    }]
  }'
```

---

## Monitoring & Troubleshooting

### View Execution Logs

1. Open workflow in n8n
2. Click "Executions" tab
3. View detailed logs for each run

### Common Issues

**Issue**: 401 Unauthorized
- **Solution**: Check `N8N_WEBHOOK_API_KEY` matches backend `.env`

**Issue**: 404 Not Found
- **Solution**: Verify `BACKEND_URL` is correct and backend is running

**Issue**: Duplicate leads
- **Solution**: Ensure idempotency keys are unique and consistent

**Issue**: Timeout errors
- **Solution**: Increase timeout in HTTP Request node options

---

## Best Practices

1. **Always use idempotency keys** for create operations
2. **Enable retry logic** with exponential backoff
3. **Log all executions** for debugging
4. **Monitor error rates** and set up alerts
5. **Test in staging** before production deployment
6. **Rotate API keys** every 90 days
7. **Use environment variables** for all configuration
8. **Version control** your workflow JSON files

---

## Next Steps

1. Import workflows to n8n
2. Configure environment variables
3. Test each workflow with sample data
4. Connect to actual Google Ads / Meta Ads accounts
5. Monitor execution logs
6. Set up alerting for failures
