import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import './index.css';
import App from './App';


Sentry.init({
  dsn: "https://95d587b639c3b8084a5cde95eea98d98@o4506960048881664.ingest.us.sentry.io/4506960050585600",
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: 1.0,
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
