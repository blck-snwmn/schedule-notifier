# schedule-notifier

## Setting(for Local)
Please follow these steps to set up the project:

1. Create a file named .dev.vars in the project root directory.
2. Write the following key-value pairs in the .dev.vars file:
  ```toml
  TARGET_URL=<Your_Target_URL>
  SLACK_TOKEN=<Your_Slack_Bearer_Token>
  ```

Replace 
- <Your_Target_URL> with the URL you want to capture a screenshot of
- <Your_Slack_Bearer_Token> with the bearer token for the Slack file upload API

## Setting
Run the following commands to add your secrets to the Workers configuration:
```bash
wrangler secret put TARGET_URL
wrangler secret put SLACK_TOKEN
```

## Deploy
After you've added the secrets, deploy the Worker with the following command:
```bash
wrangler deploy
```

